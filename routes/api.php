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

// Public routes
Route::get('/insurances', [InsuranceController::class, 'index']);
Route::post('/register/patient', [AuthController::class, 'registerPatient']);
Route::post('/register/pharmacy', [AuthController::class, 'registerPharmacy']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/pharmacies', [PharmacyController::class, 'index']);
Route::get('/pharmacies/nearby', [PharmacyController::class, 'nearby']);
Route::post('/contact', [ContactController::class, 'store']); // Public contact form

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
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