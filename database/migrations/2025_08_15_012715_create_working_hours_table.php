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
        Schema::create('working_hours', function (Blueprint $table) {
             $table->id();

        $table->foreignId('pharmacy_id')
              ->constrained('pharmacies')
              ->onDelete('cascade');

        $table->string('day_of_week'); // Monday, Tuesday...
        $table->time('open_time')->nullable();
        $table->time('close_time')->nullable();
        $table->boolean('closed')->default(false); // true if pharmacy closed that day

        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('working_hours');
    }
};
