<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Get all users with pagination and filtering
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
            $query = User::withTrashed(); // Include soft deleted users

            // Apply filters
            if ($request->has('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }

            if ($request->has('status') && $request->status !== 'all') {
                if ($request->status === 'suspended') {
                    $query->whereNotNull('deleted_at'); // Only suspended users
                } elseif ($request->status === 'active') {
                    $query->whereNull('deleted_at'); // Only active users
                }
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%");
                });
            }

            // Get paginated results
            $users = $query->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 15));

            // Add status information to each user
            $users->getCollection()->transform(function ($user) {
                $user->status = $user->deleted_at ? 'suspended' : 'active';
                return $user;
            });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user status (activate/suspend)
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
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
                'status' => 'required|in:active,suspended'
            ]);

            $targetUser = User::withTrashed()->findOrFail($id);

            // Prevent admin from suspending themselves
            if ($targetUser->id === $user->id && $request->status === 'suspended') {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot suspend your own account.'
                ], 400);
            }

            if ($request->status === 'suspended') {
                // SUSPEND: Soft delete - user cannot login but data is preserved
                if (!$targetUser->deleted_at) {
                    $targetUser->delete();
                    $message = 'User suspended successfully. They cannot login but all data is preserved.';
                } else {
                    $message = 'User is already suspended.';
                }
            } else {
                // ACTIVATE: Restore soft deleted user
                if ($targetUser->deleted_at) {
                    $targetUser->restore();
                    $message = 'User activated successfully. They can now login again.';
                } else {
                    $message = 'User is already active.';
                }
            }

            // Refresh the user data
            $targetUser->refresh();
            $targetUser->status = $targetUser->deleted_at ? 'suspended' : 'active';

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $targetUser
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user (PERMANENT - cannot be restored)
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
            $targetUser = User::withTrashed()->findOrFail($id);

            // Prevent admin from deleting themselves
            if ($targetUser->id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account.'
                ], 400);
            }

            $pharmacyCount = 0;
            $message = 'User permanently deleted. This action cannot be undone.';

            // If user is a pharmacy owner, delete their pharmacies first
            if ($targetUser->role === 'pharmacy_owner') {
                $pharmacyCount = $targetUser->pharmacies()->count();
                
                if ($pharmacyCount > 0) {
                    // Force delete all pharmacies owned by this user
                    $targetUser->pharmacies()->forceDelete();
                    $message .= " {$pharmacyCount} pharmacy(ies) associated with this user were also permanently deleted.";
                }
            }

            // PERMANENT DELETE - Cannot be restored
            $targetUser->forceDelete();

            return response()->json([
                'success' => true,
                'message' => $message
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk actions on users
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
                'action' => 'required|in:activate,suspend,delete',
                'user_ids' => 'required|array|min:1',
                'user_ids.*' => 'integer|exists:users,id'
            ]);

            $userIds = $request->user_ids;
            $action = $request->action;

            // Prevent admin from performing bulk actions on themselves
            if (in_array($user->id, $userIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot perform bulk actions on your own account.'
                ], 400);
            }

            $users = User::withTrashed()->whereIn('id', $userIds)->get();
            $message = '';

            switch ($action) {
                case 'activate':
                    // Restore soft deleted users
                    $restoredCount = User::withTrashed()
                        ->whereIn('id', $userIds)
                        ->whereNotNull('deleted_at')
                        ->restore();
                    $message = "{$restoredCount} user(s) activated successfully. They can now login again.";
                    break;

                case 'suspend':
                    // Soft delete active users
                    $suspendedCount = User::whereIn('id', $userIds)
                        ->whereNull('deleted_at')
                        ->delete();
                    $message = "{$suspendedCount} user(s) suspended successfully. They cannot login but data is preserved.";
                    break;

                case 'delete':
                    // Handle pharmacy owners first
                    $pharmacyOwners = User::withTrashed()
                        ->whereIn('id', $userIds)
                        ->where('role', 'pharmacy_owner')
                        ->get();
                    
                    $totalPharmaciesDeleted = 0;
                    foreach ($pharmacyOwners as $pharmacyOwner) {
                        $pharmacyCount = $pharmacyOwner->pharmacies()->count();
                        if ($pharmacyCount > 0) {
                            $pharmacyOwner->pharmacies()->forceDelete();
                            $totalPharmaciesDeleted += $pharmacyCount;
                        }
                    }
                    
                    // PERMANENT DELETE - Cannot be restored
                    $deletedCount = User::withTrashed()
                        ->whereIn('id', $userIds)
                        ->forceDelete();
                    
                    $message = "{$deletedCount} user(s) permanently deleted. This action cannot be undone.";
                    if ($totalPharmaciesDeleted > 0) {
                        $message .= " {$totalPharmaciesDeleted} pharmacy(ies) associated with pharmacy owners were also permanently deleted.";
                    }
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'affected_count' => count($userIds)
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