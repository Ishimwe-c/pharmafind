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
        Schema::table('working_hours', function (Blueprint $table) {
            
            
            // Composite index for day_of_week + pharmacy_id (for finding specific day schedules)
            $table->index(['day_of_week', 'pharmacy_id']);
            
            // Index for closed status (for filtering open/closed pharmacies)
            $table->index('closed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('working_hours', function (Blueprint $table) {
            //
        });
    }
};
