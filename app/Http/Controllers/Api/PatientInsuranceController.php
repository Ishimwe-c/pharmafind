<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insurance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PatientInsuranceController extends Controller
{
    /**
     * Display a listing of patient's insurances.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->get('user_id', Auth::id());
        $activeOnly = $request->get('active_only', true);

        // Check if user can view other user's insurances (admin or same user)
        if ($userId !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view other user\'s insurance information'
            ], 403);
        }

        $query = User::findOrFail($userId)->insurances();

        if ($activeOnly) {
            $query->wherePivot('is_active', true);
        }

        $insurances = $query->withPivot([
            'policy_number', 
            'member_id', 
            'coverage_start_date', 
            'coverage_end_date', 
            'is_active', 
            'notes',
            'created_at',
            'updated_at'
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $insurances
        ]);
    }

    /**
     * Store a newly created patient insurance.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'insurance_id' => 'required|exists:insurances,id',
            'policy_number' => 'nullable|string|max:255',
            'member_id' => 'nullable|string|max:255',
            'coverage_start_date' => 'nullable|date',
            'coverage_end_date' => 'nullable|date|after_or_equal:coverage_start_date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = Auth::id();
        $insuranceId = $request->insurance_id;

        // Check if user already has this insurance
        $existingInsurance = DB::table('insurance_patient')
            ->where('user_id', $userId)
            ->where('insurance_id', $insuranceId)
            ->first();

        if ($existingInsurance) {
            return response()->json([
                'success' => false,
                'message' => 'You already have this insurance registered. Use update to modify it.'
            ], 400);
        }

        $user = User::findOrFail($userId);
        $insurance = Insurance::findOrFail($insuranceId);

        $user->insurances()->attach($insuranceId, [
            'policy_number' => $request->policy_number,
            'member_id' => $request->member_id,
            'coverage_start_date' => $request->coverage_start_date,
            'coverage_end_date' => $request->coverage_end_date,
            'is_active' => true,
            'notes' => $request->notes,
        ]);

        // Get the updated insurance with pivot data
        $updatedInsurance = $user->insurances()
            ->where('insurances.id', $insuranceId)
            ->withPivot([
                'policy_number', 
                'member_id', 
                'coverage_start_date', 
                'coverage_end_date', 
                'is_active', 
                'notes',
                'created_at',
                'updated_at'
            ])
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Insurance added successfully',
            'data' => $updatedInsurance
        ], 201);
    }

    /**
     * Display the specified patient insurance.
     */
    public function show(string $id): JsonResponse
    {
        $insurance = Auth::user()->insurances()
            ->where('insurances.id', $id)
            ->withPivot([
                'policy_number', 
                'member_id', 
                'coverage_start_date', 
                'coverage_end_date', 
                'is_active', 
                'notes',
                'created_at',
                'updated_at'
            ])
            ->first();

        if (!$insurance) {
            return response()->json([
                'success' => false,
                'message' => 'Insurance not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $insurance
        ]);
    }

    /**
     * Update the specified patient insurance.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'policy_number' => 'nullable|string|max:255',
            'member_id' => 'nullable|string|max:255',
            'coverage_start_date' => 'nullable|date',
            'coverage_end_date' => 'nullable|date|after_or_equal:coverage_start_date',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        
        // Check if user has this insurance
        $insurance = $user->insurances()->where('insurances.id', $id)->first();
        
        if (!$insurance) {
            return response()->json([
                'success' => false,
                'message' => 'Insurance not found'
            ], 404);
        }

        // Update pivot data
        $updateData = $request->only([
            'policy_number', 
            'member_id', 
            'coverage_start_date', 
            'coverage_end_date', 
            'is_active', 
            'notes'
        ]);

        $user->insurances()->updateExistingPivot($id, $updateData);

        // Get updated insurance with pivot data
        $updatedInsurance = $user->insurances()
            ->where('insurances.id', $id)
            ->withPivot([
                'policy_number', 
                'member_id', 
                'coverage_start_date', 
                'coverage_end_date', 
                'is_active', 
                'notes',
                'created_at',
                'updated_at'
            ])
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Insurance updated successfully',
            'data' => $updatedInsurance
        ]);
    }

    /**
     * Remove the specified patient insurance.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user has this insurance
        $insurance = $user->insurances()->where('insurances.id', $id)->first();
        
        if (!$insurance) {
            return response()->json([
                'success' => false,
                'message' => 'Insurance not found'
            ], 404);
        }

        $user->insurances()->detach($id);

        return response()->json([
            'success' => true,
            'message' => 'Insurance removed successfully'
        ]);
    }

    /**
     * Get available insurances that user doesn't have.
     */
    public function available(): JsonResponse
    {
        $userInsuranceIds = Auth::user()->insurances()->pluck('insurances.id');
        
        $availableInsurances = Insurance::whereNotIn('id', $userInsuranceIds)->get();

        return response()->json([
            'success' => true,
            'data' => $availableInsurances
        ]);
    }

    /**
     * Check insurance coverage for a pharmacy.
     */
    public function checkCoverage(Request $request, string $pharmacyId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pharmacy_id' => 'required|exists:pharmacies,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $userInsurances = $user->insurances()
            ->wherePivot('is_active', true)
            ->get();

        $pharmacy = \App\Models\Pharmacy::with('insurances')->findOrFail($pharmacyId);
        $pharmacyInsurances = $pharmacy->insurances;

        $matchingInsurances = $userInsurances->intersect($pharmacyInsurances);

        return response()->json([
            'success' => true,
            'data' => [
                'pharmacy' => $pharmacy,
                'user_insurances' => $userInsurances,
                'pharmacy_insurances' => $pharmacyInsurances,
                'matching_insurances' => $matchingInsurances,
                'has_coverage' => $matchingInsurances->isNotEmpty()
            ]
        ]);
    }
}
