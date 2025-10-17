<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Medicine;
use App\Models\Pharmacy;
use App\Models\User;
use App\Models\Insurance;
use App\Notifications\PurchaseNotification;
use App\Mail\PurchaseConfirmationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PurchaseController extends Controller
{
    /**
     * Display a listing of purchases with filters
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Purchase::with(['user', 'pharmacy', 'insurance', 'purchaseItems.medicine'])
            ->orderBy('purchase_date', 'desc');

        // Apply filters based on user role
        if ($user->role === 'pharmacy' || $user->role === 'pharmacy_owner') {
            // Pharmacy can only see their own purchases
            $pharmacy = Pharmacy::where('user_id', $user->id)->first();
            if ($pharmacy) {
                $query->where('pharmacy_id', $pharmacy->id);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Pharmacy not found for this user'
                ], 404);
            }
        } elseif ($user->role === 'patient') {
            // Patient can only see their own purchases
            $query->where('user_id', $user->id);
        }

        // Apply additional filters
        if ($request->filled('pharmacy_id')) {
            $query->where('pharmacy_id', $request->pharmacy_id);
        }

        if ($request->filled('patient_id')) {
            $query->where('user_id', $request->patient_id);
        }

        if ($request->filled('insurance_id')) {
            $query->where('insurance_id', $request->insurance_id);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('date_from')) {
            $query->where('purchase_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('purchase_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('purchase_number', 'like', "%{$searchTerm}%")
                  ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                      $userQuery->where('name', 'like', "%{$searchTerm}%")
                               ->orWhere('email', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('pharmacy', function ($pharmacyQuery) use ($searchTerm) {
                      $pharmacyQuery->where('pharmacy_name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $perPage = $request->get('per_page', 15);
        $purchases = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $purchases
        ]);
    }

    /**
     * Store a newly created purchase
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pharmacy_id' => 'required|exists:pharmacies,id',
            'user_id' => 'nullable|exists:users,id',
            'patient_name' => 'required_without:user_id|string|max:255',
            'patient_email' => 'nullable|email|max:255',
            'patient_phone' => 'nullable|string|max:20',
            'insurance_id' => 'nullable|exists:insurances,id',
            'purchase_items' => 'required|array|min:1',
            'purchase_items.*.medicine_id' => 'required|exists:medicines,id',
            'purchase_items.*.quantity' => 'required|integer|min:1',
            'purchase_items.*.unit_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,insurance,mixed',
            'payment_status' => 'required|in:paid,pending,partially_paid,cancelled',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Check if user has permission to create purchase for this pharmacy
        if ($user->role === 'pharmacy' || $user->role === 'pharmacy_owner') {
            $pharmacy = Pharmacy::where('user_id', $user->id)->first();
            if (!$pharmacy || $pharmacy->id != $request->pharmacy_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only create purchases for your own pharmacy'
                ], 403);
            }
        }

        DB::beginTransaction();
        
        try {
            // Handle patient - either use existing user_id or find/create patient by phone
            $patientId = $request->user_id;
            
            if (!$patientId && $request->patient_name) {
                // First, try to find an existing user with this phone number
                if ($request->patient_phone) {
                    $existingPatient = User::where('phone_number', $request->patient_phone)
                        ->where('role', 'patient')
                        ->first();
                    
                    if ($existingPatient) {
                        $patientId = $existingPatient->id;
                        \Log::info('✅ Found existing patient by phone', [
                            'user_id' => $existingPatient->id,
                            'phone' => $request->patient_phone
                        ]);
                    }
                }
                
                // If no existing user found, create a new patient
                if (!$patientId) {
                    $patient = User::create([
                        'name' => $request->patient_name,
                        'email' => $request->patient_email ?: 'patient_' . time() . '@pharmafind.local',
                        'phone_number' => $request->patient_phone,
                        'role' => 'patient',
                        'password' => bcrypt('temp_password_' . time()), // Temporary password
                    ]);
                    $patientId = $patient->id;
                    \Log::info('🆕 Created new patient user', [
                        'user_id' => $patient->id,
                        'phone' => $request->patient_phone
                    ]);
                }
            }

            if (!$patientId) {
                throw new \Exception("Patient information is required");
            }

            // Check stock availability and validate medicines
            $totalAmount = 0;
            $insuranceCoverage = 0;
            $patientPayment = 0;
            
            foreach ($request->purchase_items as $item) {
                $medicine = Medicine::find($item['medicine_id']);
                
                if (!$medicine) {
                    throw new \Exception("Medicine not found: {$item['medicine_id']}");
                }
                
                if ($medicine->pharmacy_id != $request->pharmacy_id) {
                    throw new \Exception("Medicine does not belong to this pharmacy");
                }
                
                if ($medicine->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for medicine: {$medicine->name}. Available: {$medicine->stock_quantity}, Requested: {$item['quantity']}");
                }
                
                $itemTotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $itemTotal;
            }

            // Calculate insurance coverage if insurance is provided
            \Log::info('💊 Calculating insurance coverage', [
                'insurance_id' => $request->insurance_id,
                'pharmacy_id' => $request->pharmacy_id,
                'total_amount' => $totalAmount
            ]);

            if ($request->insurance_id) {
                $insurance = Insurance::find($request->insurance_id);
                \Log::info('🏥 Insurance found', ['insurance_name' => $insurance->name ?? 'NULL']);

                if ($insurance) {
                    // Get insurance coverage percentage for this pharmacy
                    $pharmacyInsurance = DB::table('insurance_pharmacy')
                        ->where('insurance_id', $request->insurance_id)
                        ->where('pharmacy_id', $request->pharmacy_id)
                        ->first();
                    
                    \Log::info('🔍 Pharmacy-Insurance relationship', [
                        'found' => $pharmacyInsurance ? 'YES' : 'NO',
                        'coverage_percentage' => $pharmacyInsurance->coverage_percentage ?? 'N/A'
                    ]);

                    if ($pharmacyInsurance) {
                        $coveragePercentage = $pharmacyInsurance->coverage_percentage ?? 0;
                        $insuranceCoverage = $totalAmount * ($coveragePercentage / 100);
                        $patientPayment = $totalAmount - $insuranceCoverage;
                        
                        \Log::info('✅ Insurance coverage calculated', [
                            'coverage_percentage' => $coveragePercentage,
                            'insurance_coverage' => $insuranceCoverage,
                            'patient_payment' => $patientPayment
                        ]);
                    } else {
                        $insuranceCoverage = 0;
                        $patientPayment = $totalAmount;
                        \Log::warning('⚠️ No pharmacy-insurance relationship found - no coverage applied');
                    }
                } else {
                    $insuranceCoverage = 0;
                    $patientPayment = $totalAmount;
                    \Log::warning('⚠️ Insurance not found in database');
                }
            } else {
                $insuranceCoverage = 0;
                $patientPayment = $totalAmount;
                \Log::info('💵 No insurance provided - full cash payment');
            }

            // Create purchase
            $purchase = Purchase::create([
                'pharmacy_id' => $request->pharmacy_id,
                'user_id' => $patientId,
                'insurance_id' => $request->insurance_id,
                'patient_name' => $request->patient_name,
                'patient_email' => $request->patient_email,
                'patient_phone' => $request->patient_phone,
                'purchase_number' => Purchase::generatePurchaseNumber(),
                'total_amount' => $totalAmount,
                'insurance_coverage' => $insuranceCoverage,
                'patient_payment' => $patientPayment,
                'payment_status' => $request->payment_status,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'purchase_date' => now()
            ]);

            // Create purchase items and reduce stock
            foreach ($request->purchase_items as $item) {
                $medicine = Medicine::find($item['medicine_id']);
                $itemTotal = $item['quantity'] * $item['unit_price'];
                
                // Calculate insurance coverage for this item
                $itemInsuranceCoverage = 0;
                $itemPatientPayment = $itemTotal;
                
                if ($request->insurance_id && $insuranceCoverage > 0) {
                    $itemInsuranceCoverage = ($itemTotal / $totalAmount) * $insuranceCoverage;
                    $itemPatientPayment = $itemTotal - $itemInsuranceCoverage;
                }

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $itemTotal,
                    'insurance_coverage_amount' => $itemInsuranceCoverage,
                    'patient_payment_amount' => $itemPatientPayment,
                    'notes' => $item['notes'] ?? null
                ]);

                // Reduce stock
                $medicine->reduceStock($item['quantity']);
            }

            DB::commit();

            // Load relationships for response
            $purchase->load(['user', 'pharmacy', 'insurance', 'purchaseItems.medicine']);

            // Send notification to patient
            \Log::info('🔔 Starting purchase notification process', [
                'purchase_id' => $purchase->id,
                'purchase_number' => $purchase->purchase_number,
                'patient_phone' => $request->patient_phone
            ]);

            $patient = $purchase->user;
            if ($patient) {
                \Log::info('✅ Sending notification to linked user', [
                    'user_id' => $patient->id,
                    'user_name' => $patient->name,
                    'user_email' => $patient->email,
                    'user_phone' => $patient->phone_number
                ]);
                $patient->notify(new PurchaseNotification($purchase, 'purchase_created'));
                
                // Also send direct email as backup
                try {
                    Mail::to($patient->email)->send(new PurchaseConfirmationMail($purchase, $patient, 'purchase_created'));
                    \Log::info('📧 Purchase confirmation email sent directly', [
                        'user_id' => $patient->id,
                        'user_email' => $patient->email,
                        'purchase_id' => $purchase->id
                    ]);
                } catch (\Exception $e) {
                    \Log::error('❌ Failed to send direct purchase confirmation email', [
                        'user_id' => $patient->id,
                        'user_email' => $patient->email,
                        'purchase_id' => $purchase->id,
                        'error' => $e->getMessage()
                    ]);
                }
            } else {
                \Log::warning('⚠️ No linked user found for purchase');
            }

            // ALSO check if there's a registered user with the phone number entered
            // This handles the case where pharmacy enters a phone number manually
            if ($request->patient_phone) {
                \Log::info('📞 Checking for users with phone number', [
                    'phone' => $request->patient_phone
                ]);

                // Find user(s) with this phone number (excluding the already notified patient)
                $phoneUsers = User::where('phone_number', $request->patient_phone)
                    ->where('role', 'patient')
                    ->when($patient, function($query) use ($patient) {
                        return $query->where('id', '!=', $patient->id);
                    })
                    ->get();

                \Log::info('📋 Found matching phone users', [
                    'count' => $phoneUsers->count(),
                    'users' => $phoneUsers->map(function($u) {
                        return [
                            'id' => $u->id,
                            'name' => $u->name,
                            'email' => $u->email,
                            'phone' => $u->phone_number
                        ];
                    })
                ]);

                // Notify all users with this phone number
                foreach ($phoneUsers as $phoneUser) {
                    \Log::info('✅ Sending notification to phone-matched user', [
                        'user_id' => $phoneUser->id,
                        'user_name' => $phoneUser->name
                    ]);
                    $phoneUser->notify(new PurchaseNotification($purchase, 'purchase_created'));
                    
                    // Also send direct email as backup
                    try {
                        Mail::to($phoneUser->email)->send(new PurchaseConfirmationMail($purchase, $phoneUser, 'purchase_created'));
                        \Log::info('📧 Purchase confirmation email sent to phone-matched user', [
                            'user_id' => $phoneUser->id,
                            'user_email' => $phoneUser->email,
                            'purchase_id' => $purchase->id
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('❌ Failed to send direct purchase confirmation email to phone-matched user', [
                            'user_id' => $phoneUser->id,
                            'user_email' => $phoneUser->email,
                            'purchase_id' => $purchase->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            } else {
                \Log::warning('⚠️ No patient phone provided in request');
            }

            return response()->json([
                'success' => true,
                'message' => 'Purchase created successfully',
                'data' => $purchase
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create purchase: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified purchase
     */
    public function show(string $id)
    {
        $purchase = Purchase::with(['user', 'pharmacy', 'insurance', 'purchaseItems.medicine'])
            ->find($id);

        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Purchase not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $purchase
        ]);
    }

    /**
     * Update the specified purchase
     */
    public function update(Request $request, string $id)
    {
        $purchase = Purchase::find($id);

        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Purchase not found'
            ], 404);
        }

        $user = $request->user();
        
        // Check permissions
        if ($user->role === 'pharmacy' || $user->role === 'pharmacy_owner') {
            $pharmacy = Pharmacy::where('user_id', $user->id)->first();
            if (!$pharmacy || $pharmacy->id != $purchase->pharmacy_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only update purchases for your own pharmacy'
                ], 403);
            }
        } elseif ($user->role === 'patient' && $purchase->user_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update your own purchases'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'payment_status' => 'sometimes|in:paid,pending,partially_paid,cancelled',
            'payment_method' => 'sometimes|in:cash,insurance,mixed',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $purchase->update($request->only(['payment_status', 'payment_method', 'notes']));

        $purchase->load(['user', 'pharmacy', 'insurance', 'purchaseItems.medicine']);

        // Send notification to patient about the update
        $patient = $purchase->user;
        $patient->notify(new PurchaseNotification($purchase, 'purchase_updated'));

        return response()->json([
            'success' => true,
            'message' => 'Purchase updated successfully',
            'data' => $purchase
        ]);
    }

    /**
     * Remove the specified purchase
     */
    public function destroy(string $id)
    {
        $purchase = Purchase::find($id);

        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Purchase not found'
            ], 404);
        }

        $user = request()->user();
        
        // Check permissions
        if ($user->role === 'pharmacy' || $user->role === 'pharmacy_owner') {
            $pharmacy = Pharmacy::where('user_id', $user->id)->first();
            if (!$pharmacy || $pharmacy->id != $purchase->pharmacy_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only delete purchases for your own pharmacy'
                ], 403);
            }
        } elseif ($user->role === 'patient' && $purchase->user_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own purchases'
            ], 403);
        }

        DB::beginTransaction();
        
        try {
            // Send notification to patient about cancellation before deleting
            $patient = $purchase->user;
            $patient->notify(new PurchaseNotification($purchase, 'purchase_cancelled'));

            // Restore stock for all items
            foreach ($purchase->purchaseItems as $item) {
                $medicine = $item->medicine;
                $medicine->stock_quantity += $item->quantity;
                $medicine->save();
            }

            // Delete purchase items
            $purchase->purchaseItems()->delete();
            
            // Delete purchase
            $purchase->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Purchase deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete purchase: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pharmacy purchase reports
     */
    public function pharmacyReports(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'pharmacy' && $user->role !== 'pharmacy_owner') {
            return response()->json([
                'success' => false,
                'message' => 'Only pharmacy users can access pharmacy reports'
            ], 403);
        }

        $pharmacy = Pharmacy::where('user_id', $user->id)->first();
        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Pharmacy not found'
            ], 404);
        }

        $period = $request->get('period', 'month'); // day, week, month, year
        $startDate = $request->get('date_from');
        $endDate = $request->get('date_to');

        // Set date range based on period
        if (!$startDate || !$endDate) {
            switch ($period) {
                case 'day':
                    $startDate = now()->startOfDay();
                    $endDate = now()->endOfDay();
                    break;
                case 'week':
                    $startDate = now()->startOfWeek();
                    $endDate = now()->endOfWeek();
                    break;
                case 'month':
                    $startDate = now()->startOfMonth();
                    $endDate = now()->endOfMonth();
                    break;
                case 'year':
                    $startDate = now()->startOfYear();
                    $endDate = now()->endOfYear();
                    break;
            }
        }

        $purchases = Purchase::with(['user', 'purchaseItems.medicine'])
            ->where('pharmacy_id', $pharmacy->id)
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->get();

        // Calculate statistics
        $totalPurchases = $purchases->count();
        $totalRevenue = $purchases->sum('total_amount');
        $totalInsuranceCoverage = $purchases->sum('insurance_coverage');
        $totalPatientPayments = $purchases->sum('patient_payment');

        // Top selling medicines
        $medicineSales = [];
        foreach ($purchases as $purchase) {
            foreach ($purchase->purchaseItems as $item) {
                $medicineName = $item->medicine->name;
                if (!isset($medicineSales[$medicineName])) {
                    $medicineSales[$medicineName] = [
                        'name' => $medicineName,
                        'quantity' => 0,
                        'revenue' => 0
                    ];
                }
                $medicineSales[$medicineName]['quantity'] += $item->quantity;
                $medicineSales[$medicineName]['revenue'] += $item->total_price;
            }
        }

        // Sort by quantity and take top 10
        $topMedicines = collect($medicineSales)
            ->sortByDesc('quantity')
            ->take(10)
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'date_range' => [
                    'from' => $startDate,
                    'to' => $endDate
                ],
                'statistics' => [
                    'total_purchases' => $totalPurchases,
                    'total_revenue' => $totalRevenue,
                    'total_insurance_coverage' => $totalInsuranceCoverage,
                    'total_patient_payments' => $totalPatientPayments,
                    'average_purchase_value' => $totalPurchases > 0 ? $totalRevenue / $totalPurchases : 0
                ],
                'top_medicines' => $topMedicines,
                'purchases' => $purchases
            ]
        ]);
    }

    /**
     * Get insurance purchase reports
     */
    public function insuranceReports(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only admin users can access insurance reports'
            ], 403);
        }

        $insuranceId = $request->get('insurance_id');
        if (!$insuranceId) {
            return response()->json([
                'success' => false,
                'message' => 'Insurance ID is required'
            ], 400);
        }

        $period = $request->get('period', 'month');
        $startDate = $request->get('date_from');
        $endDate = $request->get('date_to');

        // Set date range based on period
        if (!$startDate || !$endDate) {
            switch ($period) {
                case 'day':
                    $startDate = now()->startOfDay();
                    $endDate = now()->endOfDay();
                    break;
                case 'week':
                    $startDate = now()->startOfWeek();
                    $endDate = now()->endOfWeek();
                    break;
                case 'month':
                    $startDate = now()->startOfMonth();
                    $endDate = now()->endOfMonth();
                    break;
                case 'year':
                    $startDate = now()->startOfYear();
                    $endDate = now()->endOfYear();
                    break;
            }
        }

        $purchases = Purchase::with(['user', 'pharmacy', 'purchaseItems.medicine'])
            ->where('insurance_id', $insuranceId)
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->get();

        // Calculate statistics
        $totalPurchases = $purchases->count();
        $totalCoverage = $purchases->sum('insurance_coverage');
        $totalPatientPayments = $purchases->sum('patient_payment');

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'date_range' => [
                    'from' => $startDate,
                    'to' => $endDate
                ],
                'statistics' => [
                    'total_purchases' => $totalPurchases,
                    'total_insurance_coverage' => $totalCoverage,
                    'total_patient_payments' => $totalPatientPayments,
                    'average_coverage_per_purchase' => $totalPurchases > 0 ? $totalCoverage / $totalPurchases : 0
                ],
                'purchases' => $purchases
            ]
        ]);
    }

    /**
     * Get patients who have made purchases at the pharmacy
     */
    public function getPharmacyPatients(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'pharmacy' && $user->role !== 'pharmacy_owner') {
            return response()->json([
                'success' => false,
                'message' => 'Only pharmacy users can access this endpoint'
            ], 403);
        }

        $pharmacy = Pharmacy::where('user_id', $user->id)->first();
        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Pharmacy not found for this user'
            ], 404);
        }

        // Get unique patients who have made purchases at this pharmacy
        $patients = User::whereHas('purchases', function ($query) use ($pharmacy) {
            $query->where('pharmacy_id', $pharmacy->id);
        })
        ->select('id', 'name', 'email', 'phone_number')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }

    /**
     * Get print-ready purchase report
     * Optimized for printing with detailed purchase information
     */
    public function getPrintableReport(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'pharmacy' && $user->role !== 'pharmacy_owner') {
            return response()->json([
                'success' => false,
                'message' => 'Only pharmacy users can access pharmacy reports'
            ], 403);
        }

        $pharmacy = Pharmacy::where('user_id', $user->id)->first();
        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Pharmacy not found'
            ], 404);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'insurance_id' => 'nullable|exists:insurances,id',
            'report_type' => 'nullable|in:daily,insurance,detailed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;
        $insuranceId = $request->insurance_id;
        $reportType = $request->get('report_type', 'detailed');

        // Build query
        $query = Purchase::with(['user', 'insurance', 'purchaseItems.medicine'])
            ->where('pharmacy_id', $pharmacy->id)
            ->whereBetween('purchase_date', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('purchase_date', 'desc');

        // Filter by insurance if provided
        if ($insuranceId) {
            $query->where('insurance_id', $insuranceId);
        }

        $purchases = $query->get();

        // Calculate statistics
        $totalPurchases = $purchases->count();
        $totalRevenue = $purchases->sum('total_amount');
        $totalInsuranceCoverage = $purchases->sum('insurance_coverage');
        $totalPatientPayments = $purchases->sum('patient_payment');

        // Group medicines sold
        $medicinesSold = [];
        $medicineCategories = [];
        
        foreach ($purchases as $purchase) {
            foreach ($purchase->purchaseItems as $item) {
                $medicine = $item->medicine;
                $medicineName = $medicine->name ?: $medicine->medicine_name ?: 'Unknown Medicine';
                $medicineId = $medicine->id;
                
                if (!isset($medicinesSold[$medicineId])) {
                    $medicinesSold[$medicineId] = [
                        'id' => $medicineId,
                        'name' => $medicineName,
                        'category' => $medicine->category,
                        'quantity' => 0,
                        'revenue' => 0,
                        'unit_price' => $medicine->price ?: $medicine->unit_price ?: 0
                    ];
                }
                
                $medicinesSold[$medicineId]['quantity'] += $item->quantity;
                $medicinesSold[$medicineId]['revenue'] += $item->total_price;

                // Track categories
                if ($medicine->category) {
                    if (!isset($medicineCategories[$medicine->category])) {
                        $medicineCategories[$medicine->category] = [
                            'category' => $medicine->category,
                            'quantity' => 0,
                            'revenue' => 0
                        ];
                    }
                    $medicineCategories[$medicine->category]['quantity'] += $item->quantity;
                    $medicineCategories[$medicine->category]['revenue'] += $item->total_price;
                }
            }
        }

        // Sort medicines by quantity sold
        $medicinesSold = collect($medicinesSold)->sortByDesc('quantity')->values();
        $medicineCategories = collect($medicineCategories)->sortByDesc('revenue')->values();

        // Group by insurance if showing insurance breakdown
        $insuranceBreakdown = [];
        if (!$insuranceId) {
            foreach ($purchases as $purchase) {
                $insuranceName = $purchase->insurance ? $purchase->insurance->name : 'No Insurance';
                
                if (!isset($insuranceBreakdown[$insuranceName])) {
                    $insuranceBreakdown[$insuranceName] = [
                        'insurance_name' => $insuranceName,
                        'purchase_count' => 0,
                        'total_amount' => 0,
                        'insurance_coverage' => 0,
                        'patient_payment' => 0
                    ];
                }
                
                $insuranceBreakdown[$insuranceName]['purchase_count']++;
                $insuranceBreakdown[$insuranceName]['total_amount'] += $purchase->total_amount;
                $insuranceBreakdown[$insuranceName]['insurance_coverage'] += $purchase->insurance_coverage;
                $insuranceBreakdown[$insuranceName]['patient_payment'] += $purchase->patient_payment;
            }
            $insuranceBreakdown = array_values($insuranceBreakdown);
        }

        // Get insurance details if filtering by specific insurance
        $insuranceDetails = null;
        if ($insuranceId) {
            $insurance = Insurance::find($insuranceId);
            $insuranceDetails = [
                'id' => $insurance->id,
                'name' => $insurance->name,
                'description' => $insurance->description
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'pharmacy' => [
                    'id' => $pharmacy->id,
                    'name' => $pharmacy->pharmacy_name,
                    'location' => $pharmacy->location,
                    'phone_number' => $pharmacy->phone_number,
                    'email' => $pharmacy->email
                ],
                'report_info' => [
                    'type' => $reportType,
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                    'generated_at' => now()->format('Y-m-d H:i:s'),
                    'generated_by' => $user->name
                ],
                'insurance_filter' => $insuranceDetails,
                'summary' => [
                    'total_purchases' => $totalPurchases,
                    'total_revenue' => round($totalRevenue, 2),
                    'total_insurance_coverage' => round($totalInsuranceCoverage, 2),
                    'total_patient_payments' => round($totalPatientPayments, 2),
                    'average_purchase_value' => $totalPurchases > 0 ? round($totalRevenue / $totalPurchases, 2) : 0,
                    'insurance_coverage_percentage' => $totalRevenue > 0 ? round(($totalInsuranceCoverage / $totalRevenue) * 100, 2) : 0
                ],
                'medicines_sold' => $medicinesSold,
                'category_breakdown' => $medicineCategories,
                'insurance_breakdown' => $insuranceBreakdown,
                'purchases' => $purchases->map(function ($purchase) {
                    return [
                        'id' => $purchase->id,
                        'purchase_number' => $purchase->purchase_number,
                        'purchase_date' => $purchase->purchase_date,
                        'patient_name' => $purchase->user ? $purchase->user->name : $purchase->patient_name,
                        'insurance' => $purchase->insurance ? $purchase->insurance->name : 'None',
                        'payment_method' => $purchase->payment_method,
                        'payment_status' => $purchase->payment_status,
                        'total_amount' => round($purchase->total_amount, 2),
                        'insurance_coverage' => round($purchase->insurance_coverage, 2),
                        'patient_payment' => round($purchase->patient_payment, 2),
                        'items' => $purchase->purchaseItems->map(function ($item) {
                            return [
                                'medicine_name' => $item->medicine->name ?: $item->medicine->medicine_name ?: 'Unknown',
                                'category' => $item->medicine->category,
                                'quantity' => $item->quantity,
                                'unit_price' => round($item->unit_price, 2),
                                'total_price' => round($item->total_price, 2)
                            ];
                        })
                    ];
                })
            ]
        ]);
    }
}
