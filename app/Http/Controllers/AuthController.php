<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pharmacy;
use App\Models\WorkingHour;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetMail;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * ✅ Register a Pharmacy + its Owner user
     */
    public function registerPharmacy(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'owner_name'     => 'required|string|max:255',
            'email'          => 'required|string|email|max:255|unique:users,email',
            'phone_number'   => 'required|string|max:20|unique:users,phone_number',
            'password'       => 'required|string|min:6|confirmed',
            'pharmacy_name'  => 'required|string|max:255',
            'location'       => 'required|string|max:255',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
            // Insurances must be array of IDs
            'insurances'     => 'array',
            'insurances.*'   => 'integer|exists:insurances,id',
            'working_hours'  => 'array',
        ]);

        // ✅ Create pharmacy owner (User)
        $user = User::create([
            'name'         => $validated['owner_name'],
            'email'        => $validated['email'],       // fixed: use validated email
            'phone_number' => $validated['phone_number'],// fixed: use validated phone_number
            'password'     => Hash::make($validated['password']),
            'role'         => 'pharmacy_owner',
        ]);

        // ✅ Create Pharmacy record linked to owner
        $pharmacy = Pharmacy::create([
            'user_id'       => $user->id,
            'pharmacy_name' => $validated['pharmacy_name'],
            'location'      => $validated['location'],
            'latitude'      => $validated['latitude'] ?? null,
            'longitude'     => $validated['longitude'] ?? null,
            'email'         => $validated['email'],
            'phone_number'  => $validated['phone_number'],
        ]);

        // ✅ Sync selected insurances
        if (!empty($validated['insurances'])) {
            $pharmacy->insurances()->sync($validated['insurances']);
        }
        // Insert working hours
   // Insert working hours (array of objects)
if (!empty($validated['working_hours']) && is_array($validated['working_hours'])) {
    foreach ($validated['working_hours'] as $wh) {
        WorkingHour::create([
            'pharmacy_id' => $pharmacy->id,
            'day_of_week' => $wh['day_of_week'],                       // "Monday"...
            'open_time'   => array_key_exists('open_time', $wh) ? $wh['open_time'] : null,
            'close_time'  => array_key_exists('close_time', $wh) ? $wh['close_time'] : null,
            'closed'      => !empty($wh['closed']),
        ]);
    }
}

        // ✅ Issue token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'  => 'Pharmacy registered successfully',
            'user'     => $user,
            'pharmacy' => $pharmacy,
            'token'    => $token
        ], 201);
    }

    /**
     * ✅ Register a Patient
     */
    public function registerPatient(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|string|email|max:255|unique:users,email',
            'phone_number'   => 'required|string|max:20|unique:users,phone_number',
            'date_of_birth'  => 'required|date_format:Y-m-d|before:today',
            'password'       => 'required|string|min:6|confirmed',
            'gender'         => 'nullable|string',
            'marital_status' => 'nullable|in:Single,Married,Divorced,Widowed',
            'insurances'     => 'nullable|array',
            'insurances.*'   => 'exists:insurances,id'
        ]);

        $user = User::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'phone_number'   => $validated['phone_number'],
            'date_of_birth'  => $validated['date_of_birth'],
            'gender'         => $validated['gender'] ?? null,
            'marital_status' => $validated['marital_status'] ?? null,
            'password'       => Hash::make($validated['password']),
            'role'           => 'patient',
        ]);

        // Attach insurances if provided
        if (!empty($validated['insurances'])) {
            $user->insurances()->attach($validated['insurances'], [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Patient registered successfully',
            'user'    => $user,
            'token'   => $token
        ], 201);
    }

    /**
     * ✅ Login for both patients & pharmacy owners
     * Now includes suspended user check
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Find user including soft deleted (suspended) users
        $user = User::withTrashed()->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is suspended (soft deleted)
        if ($user->deleted_at) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended. Please contact support for assistance.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'phone_number'=> $user->phone_number,
                'role'        => $user->role,
            ],
            'token'   => $token
        ]);
    }

    /**
     * ✅ Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * ✅ Update Pharmacy details
     */
    public function updatePharmacy(Request $request, $id)
    {
        $pharmacy = Pharmacy::findOrFail($id);
        
        $validated = $request->validate([
            'pharmacy_name' => 'required|string|max:255',
            'location'      => 'required|string|max:255',
            'latitude'      => 'nullable|numeric',
            'longitude'     => 'nullable|numeric',
            'email'         => 'required|string|email|max:255',
            'phone_number'  => 'required|string|max:20',
            'insurances'    => 'array',
            'insurances.*'  => 'integer|exists:insurances,id',
        ]);

        $pharmacy->update($validated);

        // Sync insurances
        if (isset($validated['insurances'])) {
            $pharmacy->insurances()->sync($validated['insurances']);
        }

        return response()->json([
            'message' => 'Pharmacy updated successfully',
            'pharmacy' => $pharmacy
        ]);
    }

    /**
     * ✅ Update user profile (for both patients and pharmacy owners)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20|unique:users,phone_number,' . $user->id,
            'address' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * ✅ Change user password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * ✅ Send password reset link
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $email = $request->email;
        
        // Generate a random token
        $token = Str::random(64);
        
        // Store the token in the database
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        try {
            // Send the password reset email
            Mail::to($email)->send(new PasswordResetMail($token, $email));
            
            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to send password reset link: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * ✅ Reset password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $email = $request->email;
        $token = $request->token;
        $password = $request->password;

        // Find the password reset record
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token'
            ], 400);
        }

        // Check if token is valid (within 60 minutes)
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            // Delete expired token
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Reset token has expired'
            ], 400);
        }

        // Verify the token
        if (!Hash::check($token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid reset token'
            ], 400);
        }

        // Find the user
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 400);
        }

        // Update the user's password
        $user->update([
            'password' => Hash::make($password)
        ]);

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully'
        ]);
    }
}