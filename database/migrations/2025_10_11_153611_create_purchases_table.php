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
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // patient
            $table->foreignId('insurance_id')->nullable()->constrained()->onDelete('set null');
            $table->string('purchase_number')->unique(); // unique identifier for the purchase
            $table->decimal('total_amount', 10, 2);
            $table->decimal('insurance_coverage', 10, 2)->default(0); // amount covered by insurance
            $table->decimal('patient_payment', 10, 2); // amount paid by patient
            $table->enum('payment_status', ['pending', 'paid', 'partially_paid', 'cancelled'])->default('pending');
            $table->enum('payment_method', ['cash', 'insurance', 'mixed'])->default('cash');
            $table->text('notes')->nullable();
            $table->timestamp('purchase_date');
            $table->timestamps();
            
            $table->index(['pharmacy_id', 'purchase_date']);
            $table->index(['user_id', 'purchase_date']);
            $table->index(['insurance_id', 'purchase_date']);
            $table->index(['payment_status', 'purchase_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
