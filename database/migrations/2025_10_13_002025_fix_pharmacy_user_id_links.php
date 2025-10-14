<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration fixes any pharmacy records that might be missing
     * the user_id link by matching pharmacy email with user email
     */
    public function up(): void
    {
        // Find pharmacies with NULL or 0 user_id and try to link them
        $pharmacies = DB::table('pharmacies')
            ->whereNull('user_id')
            ->orWhere('user_id', 0)
            ->get();
        
        foreach ($pharmacies as $pharmacy) {
            // Try to find a user with matching email
            $user = DB::table('users')
                ->where('email', $pharmacy->email)
                ->where('role', 'pharmacy_owner')
                ->first();
            
            if ($user) {
                // Update the pharmacy with the correct user_id
                DB::table('pharmacies')
                    ->where('id', $pharmacy->id)
                    ->update(['user_id' => $user->id]);
                    
                echo "✓ Linked pharmacy '{$pharmacy->pharmacy_name}' to user '{$user->name}'\n";
            } else {
                echo "⚠ Could not find user for pharmacy '{$pharmacy->pharmacy_name}' (email: {$pharmacy->email})\n";
            }
        }
        
        // Also check for pharmacy_owner users without pharmacies and create a basic entry if needed
        $orphanedUsers = DB::table('users')
            ->where('role', 'pharmacy_owner')
            ->whereNotIn('id', function($query) {
                $query->select('user_id')
                    ->from('pharmacies')
                    ->whereNotNull('user_id');
            })
            ->get();
            
        foreach ($orphanedUsers as $user) {
            echo "⚠ User '{$user->name}' (ID: {$user->id}) is a pharmacy_owner but has no pharmacy record.\n";
            echo "  This user needs to complete pharmacy registration.\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration only fixes data, no schema changes to reverse
    }
};
