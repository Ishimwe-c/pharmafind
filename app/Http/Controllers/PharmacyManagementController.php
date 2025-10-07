<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PharmacyManagementController extends Controller
{
    /**
     * Get all pharmacies with pagination and filtering
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
            $query = Pharmacy::with(['user', 'verifier']);

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                if ($request->status === 'pending_verification') {
                    $query->where('verification_status', 'pending');
                } elseif ($request->status === 'verified') {
                    $query->where('verification_status', 'verified');
                } elseif ($request->status === 'rejected') {
                    $query->where('verification_status', 'rejected');
                } elseif ($request->status === 'suspended') {
                    $query->where('status', 'suspended');
                } elseif ($request->status === 'active') {
                    $query->where('status', 'active');
                }
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('pharmacy_name', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%");
                });
            }

            // Get paginated results
            $pharmacies = $query->orderBy('created_at', 'desc')
                               ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $pharmacies
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pharmacies',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify pharmacy (new method for verification)
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify($id)
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
            $pharmacy = Pharmacy::findOrFail($id);

            // Update verification status
            $pharmacy->update([
                'verification_status' => 'verified',
                'verified_at' => now(),
                'verified_by' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pharmacy verified successfully.',
                'data' => $pharmacy->load('verifier')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify pharmacy',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve pharmacy (legacy method - now just verifies)
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve($id)
    {
        return $this->verify($id);
    }

    /**
     * Reject pharmacy verification
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject($id)
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
            $pharmacy = Pharmacy::findOrFail($id);

            // Update verification status to rejected and suspend the pharmacy
            $pharmacy->update([
                'verification_status' => 'rejected',
                'status' => 'suspended',
                'verified_at' => now(),
                'verified_by' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pharmacy verification rejected and suspended.',
                'data' => $pharmacy->load('verifier')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject pharmacy',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suspend/Activate pharmacy
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleStatus($id)
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
            $pharmacy = Pharmacy::findOrFail($id);

            // Toggle status between active and suspended
            $newStatus = $pharmacy->status === 'active' ? 'suspended' : 'active';
            $pharmacy->update(['status' => $newStatus]);

            $action = $newStatus === 'active' ? 'activated' : 'suspended';
            return response()->json([
                'success' => true,
                'message' => "Pharmacy {$action} successfully.",
                'data' => $pharmacy
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update pharmacy status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete pharmacy
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
            $pharmacy = Pharmacy::findOrFail($id);
            $pharmacy->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Pharmacy deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete pharmacy',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk actions on pharmacies
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
                'action' => 'required|in:approve,reject,delete',
                'pharmacy_ids' => 'required|array|min:1',
                'pharmacy_ids.*' => 'integer|exists:pharmacies,id'
            ]);

            $pharmacyIds = $request->pharmacy_ids;
            $action = $request->action;

            switch ($action) {
                case 'approve':
                    Pharmacy::whereIn('id', $pharmacyIds)->update(['updated_at' => now()]);
                    $message = 'Pharmacies approved successfully.';
                    break;
                case 'reject':
                    Pharmacy::whereIn('id', $pharmacyIds)->delete();
                    $message = 'Pharmacies rejected successfully.';
                    break;
                case 'delete':
                    Pharmacy::whereIn('id', $pharmacyIds)->forceDelete();
                    $message = 'Pharmacies deleted successfully.';
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'affected_count' => count($pharmacyIds)
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
