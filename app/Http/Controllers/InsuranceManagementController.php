<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Insurance;
use Illuminate\Support\Facades\DB;

class InsuranceManagementController extends Controller
{
    /**
     * Get all insurances with pagination and filtering
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Check if user is admin or super_admin
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $query = Insurance::query();

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%");
            }

            // Get paginated results with pharmacy count
            $insurances = $query->withCount('pharmacies')
                               ->orderBy('created_at', 'desc')
                               ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $insurances
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch insurances',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new insurance
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Check if user is admin or super_admin
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:insurances,name',
            ]);

            $insurance = Insurance::create([
                'name' => $request->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Insurance created successfully.',
                'data' => $insurance
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create insurance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update insurance
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Check if user is admin or super_admin
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $insurance = Insurance::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255|unique:insurances,name,' . $id,
            ]);

            $insurance->update([
                'name' => $request->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Insurance updated successfully.',
                'data' => $insurance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update insurance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete insurance
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        // Check if user is admin or super_admin
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $insurance = Insurance::findOrFail($id);

            // Check if insurance is being used by any pharmacies
            $pharmacyCount = DB::table('insurance_pharmacy')
                              ->where('insurance_id', $id)
                              ->count();

            if ($pharmacyCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete insurance. It is being used by ' . $pharmacyCount . ' pharmacy(ies).'
                ], 400);
            }

            $insurance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Insurance deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete insurance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk actions on insurances
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkAction(Request $request)
    {
        // Check if user is admin or super_admin
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $request->validate([
                'action' => 'required|in:delete',
                'insurance_ids' => 'required|array|min:1',
                'insurance_ids.*' => 'integer|exists:insurances,id'
            ]);

            $insuranceIds = $request->insurance_ids;
            $action = $request->action;

            if ($action === 'delete') {
                // Check if any insurance is being used by pharmacies
                $usedInsurances = DB::table('insurance_pharmacy')
                                   ->whereIn('insurance_id', $insuranceIds)
                                   ->distinct()
                                   ->pluck('insurance_id');

                if ($usedInsurances->count() > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot delete some insurances. They are being used by pharmacies.'
                    ], 400);
                }

                Insurance::whereIn('id', $insuranceIds)->delete();
                $message = 'Insurances deleted successfully.';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'affected_count' => count($insuranceIds)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform bulk action',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
