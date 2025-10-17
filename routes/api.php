<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\PharmacyManagementController;
use App\Http\Controllers\InsuranceManagementController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AdminContactController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\PatientInsuranceController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\NotificationController;

// Public routes
Route::get('/insurances', [InsuranceController::class, 'index']);
Route::post('/register/patient', [AuthController::class, 'registerPatient']);
Route::post('/register/pharmacy', [AuthController::class, 'registerPharmacy']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/pharmacies', [PharmacyController::class, 'index']);
Route::get('/pharmacies/nearby', [PharmacyController::class, 'nearby']);
Route::post('/contact', [ContactController::class, 'store']); // Public contact form

// Public medicine viewing routes (for patients to browse)
Route::get('/medicines', [MedicineController::class, 'index']);
Route::get('/medicines/categories', [MedicineController::class, 'categories']);
Route::get('/medicines/{id}', [MedicineController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        
        // Load pharmacy relationship for pharmacy owners
        if ($user && ($user->role === 'pharmacy_owner' || $user->role === 'pharmacy')) {
            $user->load(['pharmacies' => function ($query) {
                $query->with(['insurances', 'workingHours']);
            }]);
            
            // Get the first pharmacy (most users will have only one)
            $pharmacy = $user->pharmacies->first();
            
            // Add pharmacy as a single object for easier access
            $userData = $user->toArray();
            $userData['pharmacy'] = $pharmacy;
            
            return response()->json($userData);
        }
        
        return response()->json($user);
    });
    
    // User profile routes
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/change-password', [AuthController::class, 'changePassword']);
    
    // Pharmacy routes - Specific routes must come BEFORE parameterized routes
    Route::get('/pharmacy/my-pharmacy', [PharmacyController::class, 'getMyPharmacy']);
    Route::post('/pharmacy', [PharmacyController::class, 'store']);
    Route::put('/pharmacy/{id}', [PharmacyController::class, 'update']);
    Route::get('/my-pharmacies', [PharmacyController::class, 'myPharmacies']);
    Route::get('/dashboard/stats', [PharmacyController::class, 'getDashboardStats']);
    
    // Public pharmacy route (moved here to avoid conflicts)
    Route::get('/pharmacy/{id}', [PharmacyController::class, 'show']);
    
    // Medicine management routes (protected - pharmacy owners only)
    Route::prefix('medicines')->group(function () {
        Route::post('/', [MedicineController::class, 'store']);
        Route::put('/{id}', [MedicineController::class, 'update']);
        Route::delete('/{id}', [MedicineController::class, 'destroy']);
        Route::post('/{id}/stock', [MedicineController::class, 'updateStock']);
    });
    
    // Patient insurance management routes
    Route::prefix('patient-insurances')->group(function () {
        Route::get('/', [PatientInsuranceController::class, 'index']);
        Route::post('/', [PatientInsuranceController::class, 'store']);
        Route::get('/available', [PatientInsuranceController::class, 'available']);
        Route::get('/{id}', [PatientInsuranceController::class, 'show']);
        Route::put('/{id}', [PatientInsuranceController::class, 'update']);
        Route::delete('/{id}', [PatientInsuranceController::class, 'destroy']);
        Route::post('/check-coverage/{pharmacyId}', [PatientInsuranceController::class, 'checkCoverage']);
    });
    
    // Purchase management routes
    Route::prefix('purchases')->group(function () {
        Route::get('/', [PurchaseController::class, 'index']);
        Route::post('/', [PurchaseController::class, 'store']);
        Route::get('/{id}', [PurchaseController::class, 'show']);
        Route::put('/{id}', [PurchaseController::class, 'update']);
        Route::delete('/{id}', [PurchaseController::class, 'destroy']);
        Route::get('/reports/pharmacy', [PurchaseController::class, 'pharmacyReports']);
        Route::get('/reports/insurance', [PurchaseController::class, 'insuranceReports']);
        Route::get('/reports/printable', [PurchaseController::class, 'getPrintableReport']);
        Route::get('/pharmacy/patients', [PurchaseController::class, 'getPharmacyPatients']);
    });
    
    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/mark-read/{id}', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
    
    // Insurance match alert route - Enhanced to return matches
    Route::post('/check-insurance-match', function (Request $request) {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_km' => 'nullable|numeric|min:0.1|max:50',
            'notify' => 'nullable|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        $latitude = $request->latitude;
        $longitude = $request->longitude;
        $radiusKm = $request->get('radius_km', 1);
        $shouldNotify = $request->get('notify', true);
        
        $insuranceMatchService = new \App\Services\InsuranceMatchService();
        
        // Get pharmacies that match user's insurance
        $pharmacies = $insuranceMatchService->getPharmaciesForUserInsurance(
            $user, 
            $latitude, 
            $longitude, 
            $radiusKm
        );
        
        $matches = [];
        foreach ($pharmacies as $pharmacy) {
            foreach ($pharmacy->insurances as $insurance) {
                $matches[] = [
                    'pharmacy_id' => $pharmacy->id,
                    'pharmacy_name' => $pharmacy->pharmacy_name,
                    'pharmacy_location' => $pharmacy->location,
                    'pharmacy_latitude' => $pharmacy->latitude,
                    'pharmacy_longitude' => $pharmacy->longitude,
                    'insurance_id' => $insurance->id,
                    'insurance_name' => $insurance->name,
                    'distance_km' => round($pharmacy->distance, 2),
                    'is_open' => $pharmacy->is_open ?? false
                ];
            }
        }
        
        // Optionally send database notifications
        if ($shouldNotify && count($matches) > 0) {
            $insuranceMatchService->checkInsuranceMatches($user, $latitude, $longitude, $radiusKm);
        }
        
        return response()->json([
            'success' => true,
            'matches' => $matches,
            'count' => count($matches),
            'message' => count($matches) > 0 
                ? 'Found ' . count($matches) . ' pharmacy matches with your insurance!' 
                : 'No nearby pharmacies found that accept your insurance.'
        ]);
    });
    
    // Admin dashboard routes
    Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::get('/admin/dashboard/stats', [AdminDashboardController::class, 'getStats']);
        Route::get('/admin/dashboard/activities', [AdminDashboardController::class, 'getRecentActivities']);
        Route::get('/admin/dashboard/health', [AdminDashboardController::class, 'getPlatformHealth']);
    });
    
    // Admin management routes
    Route::prefix('admin')->middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
        // User management
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::put('/users/{id}/status', [UserManagementController::class, 'updateStatus']);
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
        Route::post('/users/bulk-action', [UserManagementController::class, 'bulkAction']);
        
        // Pharmacy management
        Route::get('/pharmacies', [PharmacyManagementController::class, 'index']);
        Route::post('/pharmacies/{id}/verify', [PharmacyManagementController::class, 'verify']);
        Route::post('/pharmacies/{id}/approve', [PharmacyManagementController::class, 'approve']); // Legacy
        Route::post('/pharmacies/{id}/reject', [PharmacyManagementController::class, 'reject']);
        Route::post('/pharmacies/{id}/toggle-status', [PharmacyManagementController::class, 'toggleStatus']);
        Route::delete('/pharmacies/{id}', [PharmacyManagementController::class, 'destroy']);
        Route::post('/pharmacies/bulk-action', [PharmacyManagementController::class, 'bulkAction']);
        
        // Insurance management
        Route::get('/insurances', [InsuranceManagementController::class, 'index']);
        Route::post('/insurances', [InsuranceManagementController::class, 'store']);
        Route::put('/insurances/{id}', [InsuranceManagementController::class, 'update']);
        Route::delete('/insurances/{id}', [InsuranceManagementController::class, 'destroy']);
        Route::post('/insurances/bulk-action', [InsuranceManagementController::class, 'bulkAction']);
        
        // Contact messages management
        Route::get('/contact-messages', [AdminContactController::class, 'index']);
        Route::get('/contact-messages/stats', [AdminContactController::class, 'getStats']);
        Route::post('/contact-messages/{id}/read', [AdminContactController::class, 'markAsRead']);
        Route::put('/contact-messages/{id}', [AdminContactController::class, 'update']);
        Route::delete('/contact-messages/{id}', [AdminContactController::class, 'destroy']);
    });
});

// Optional: Add this if you want insurances to be protected
Route::middleware('auth:sanctum')->post('/insurances', [InsuranceController::class, 'store']);