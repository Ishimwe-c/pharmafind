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
        Schema::create('insurance_pharmacy', function (Blueprint $table) {
             $table->id();

        // Link to pharmacy
        $table->foreignId('pharmacy_id')
              ->constrained('pharmacies')
              ->onDelete('cascade');

        // Link to insurance provider
        $table->foreignId('insurance_id')
              ->constrained('insurances')
              ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insurance_pharmacy');
    }
};
