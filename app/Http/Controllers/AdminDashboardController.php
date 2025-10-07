<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Pharmacy;
use App\Models\Insurance;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard statistics
     * 
     * Returns key metrics for the admin dashboard:
     * - Total users count
     * - Total pharmacies count
     * - Pending pharmacy approvals
     * - Approved pharmacies count
     * - Total insurances count
     * - Recent registrations (last 7 days)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats()
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
            // Get total users count
            $totalUsers = User::count();
            
            // Get total pharmacies count
            $totalPharmacies = Pharmacy::count();
            
            // Get pharmacy verification statistics
            $pendingVerification = Pharmacy::where('verification_status', 'pending')->count();
            $verifiedPharmacies = Pharmacy::where('verification_status', 'verified')->count();
            $suspendedPharmacies = Pharmacy::where('status', 'suspended')->count();
            
            // Get total insurances count
            $totalInsurances = Insurance::count();
            
            // Get recent registrations (last 7 days)
            $recentRegistrations = User::where('created_at', '>=', Carbon::now()->subDays(7))->count();
            
            // Get recent pharmacy registrations (last 7 days)
            $recentPharmacyRegistrations = Pharmacy::where('created_at', '>=', Carbon::now()->subDays(7))->count();
            
            // Get contact message statistics
            $totalContactMessages = ContactMessage::count();
            $newContactMessages = ContactMessage::where('status', 'new')->count();
            $urgentContactMessages = ContactMessage::where('priority', 'urgent')->count();
            $recentContactMessages = ContactMessage::where('created_at', '>=', Carbon::now()->subDays(7))->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'totalUsers' => $totalUsers,
                    'totalPharmacies' => $totalPharmacies,
                    'pendingVerification' => $pendingVerification,
                    'verifiedPharmacies' => $verifiedPharmacies,
                    'suspendedPharmacies' => $suspendedPharmacies,
                    'totalInsurances' => $totalInsurances,
                    'recentRegistrations' => $recentRegistrations,
                    'recentPharmacyRegistrations' => $recentPharmacyRegistrations,
                    'totalContactMessages' => $totalContactMessages,
                    'newContactMessages' => $newContactMessages,
                    'urgentContactMessages' => $urgentContactMessages,
                    'recentContactMessages' => $recentContactMessages,
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get recent activities
     * 
     * Returns recent platform activities including:
     * - Recent user registrations
     * - Recent pharmacy registrations
     * - Recent pharmacy approvals
     * - Recent insurance additions
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecentActivities()
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
            $activities = collect();
            
            // Get recent user registrations (last 5)
            $recentUsers = User::whereNotNull('created_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => 'user_' . $user->id,
                        'type' => 'user_registration',
                        'message' => "New {$user->role} \"{$user->name}\" registered",
                        'time' => $user->created_at ? $user->created_at->diffForHumans() : 'Unknown',
                        'status' => 'completed',
                        'created_at' => $user->created_at
                    ];
                });
            
            // Get recent pharmacy registrations (last 5)
            $recentPharmacies = Pharmacy::whereNotNull('created_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($pharmacy) {
                    return [
                        'id' => 'pharmacy_' . $pharmacy->id,
                        'type' => 'pharmacy_registration',
                        'message' => "New pharmacy \"{$pharmacy->pharmacy_name}\" registered",
                        'time' => $pharmacy->created_at ? $pharmacy->created_at->diffForHumans() : 'Unknown',
                        'status' => 'completed', // All pharmacies are considered completed since no status field
                        'created_at' => $pharmacy->created_at
                    ];
                });
            
            // Get recent insurance additions (last 3)
            $recentInsurances = Insurance::whereNotNull('created_at')
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get()
                ->map(function ($insurance) {
                    return [
                        'id' => 'insurance_' . $insurance->id,
                        'type' => 'insurance_update',
                        'message' => "New insurance \"{$insurance->name}\" added to system",
                        'time' => $insurance->created_at ? $insurance->created_at->diffForHumans() : 'Unknown',
                        'status' => 'completed',
                        'created_at' => $insurance->created_at
                    ];
                });
            
            // Combine all activities and sort by creation date
            $allActivities = $activities
                ->merge($recentUsers)
                ->merge($recentPharmacies)
                ->merge($recentInsurances)
                ->sortByDesc('created_at')
                ->take(10)
                ->values();
            
            return response()->json([
                'success' => true,
                'data' => $allActivities
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get platform health status
     * 
     * Returns system health information:
     * - Database connection status
     * - API status
     * - Email service status (if configured)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlatformHealth()
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
            $health = [
                'database' => 'connected',
                'api' => 'operational',
                'email' => 'configured'
            ];
            
            // Test database connection
            try {
                DB::connection()->getPdo();
                $health['database'] = 'connected';
            } catch (\Exception $e) {
                $health['database'] = 'disconnected';
            }
            
            // Check email configuration
            $mailConfig = config('mail.default');
            if ($mailConfig && $mailConfig !== 'log') {
                $health['email'] = 'configured';
            } else {
                $health['email'] = 'log_only';
            }
            
            return response()->json([
                'success' => true,
                'data' => $health
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check platform health',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
