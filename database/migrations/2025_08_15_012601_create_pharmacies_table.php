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
        Schema::create('pharmacies', function (Blueprint $table) {
           $table->id(); // Primary key

        // Link to 'users' table — this is the pharmacy owner account
        $table->foreignId('user_id')
              ->constrained('users') // points to users.id
              ->onDelete('cascade'); // delete pharmacy if user is deleted

        $table->string('pharmacy_name'); // Name of pharmacy
        $table->string('location'); // Human-readable address
        $table->string('email')->nullable(); // Optional email
        $table->string('phone_number'); // Contact number

        // GPS coordinates from Google Map picker
        $table->decimal('latitude', 10, 8)->nullable();
        $table->decimal('longitude', 10, 8)->nullable();

        $table->timestamps(); // created_at & updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacies');
    }
};
