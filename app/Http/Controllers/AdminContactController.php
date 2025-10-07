<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class AdminContactController extends Controller
{
    /**
     * Get all contact messages for admin dashboard
     * This endpoint provides paginated contact messages with filtering options
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
            // Start building the query with relationships
            $query = ContactMessage::with('assignedAdmin');

            // Apply status filter
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Apply priority filter
            if ($request->has('priority') && $request->priority !== 'all') {
                $query->where('priority', $request->priority);
            }

            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            }

            // Get paginated results ordered by newest first
            $messages = $query->orderBy('created_at', 'desc')
                             ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $messages
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch contact messages: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch contact messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a contact message as read
     * This automatically assigns the message to the current admin
     */
    public function markAsRead($id)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $message = ContactMessage::findOrFail($id);
            
            // Update message status and assignment
            $message->update([
                'status' => 'read',
                'read_at' => now(),
                'assigned_to' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Message marked as read',
                'data' => $message->load('assignedAdmin')
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to mark message as read: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update message status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update contact message status, priority, and admin notes
     * This allows admins to manage message workflow
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $message = ContactMessage::findOrFail($id);
            
            // Prepare update data
            $updateData = [];
            
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
                // Set replied_at timestamp when status changes to replied
                if ($request->status === 'replied') {
                    $updateData['replied_at'] = now();
                }
            }
            
            if ($request->has('priority')) {
                $updateData['priority'] = $request->priority;
            }
            
            if ($request->has('admin_notes')) {
                $updateData['admin_notes'] = $request->admin_notes;
            }
            
            if ($request->has('assigned_to')) {
                $updateData['assigned_to'] = $request->assigned_to;
            }

            // Update the message
            $message->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Message updated successfully',
                'data' => $message->load('assignedAdmin')
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to update contact message: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a contact message
     * This permanently removes the message from the system
     */
    public function destroy($id)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $message = ContactMessage::findOrFail($id);
            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to delete contact message: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get contact message statistics for admin dashboard
     * This provides counts for different message statuses and priorities
     */
    public function getStats()
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        try {
            $stats = [
                'total_messages' => ContactMessage::count(),
                'new_messages' => ContactMessage::where('status', 'new')->count(),
                'read_messages' => ContactMessage::where('status', 'read')->count(),
                'replied_messages' => ContactMessage::where('status', 'replied')->count(),
                'closed_messages' => ContactMessage::where('status', 'closed')->count(),
                'urgent_messages' => ContactMessage::where('priority', 'urgent')->count(),
                'high_priority_messages' => ContactMessage::where('priority', 'high')->count(),
                'recent_messages' => ContactMessage::where('created_at', '>=', now()->subDays(7))->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch contact message stats: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
