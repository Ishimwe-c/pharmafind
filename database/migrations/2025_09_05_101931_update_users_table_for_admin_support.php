<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add email_verified_at column
            $table->timestamp('email_verified_at')->nullable()->after('email');
            
            // Update role enum to include admin roles
            $table->enum('role', ['patient', 'pharmacy_owner', 'admin', 'super_admin'])
                  ->default('patient')
                  ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove email_verified_at column
            $table->dropColumn('email_verified_at');
            
            // Revert role enum to original values
            $table->enum('role', ['patient', 'pharmacy_owner'])
                  ->default('patient')
                  ->change();
        });
    }
};