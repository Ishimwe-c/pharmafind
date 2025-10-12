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
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained()->onDelete('cascade');
            $table->foreignId('medicine_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2); // price at time of purchase
            $table->decimal('total_price', 10, 2); // quantity * unit_price
            $table->decimal('insurance_coverage_amount', 10, 2)->default(0);
            $table->decimal('patient_payment_amount', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['purchase_id']);
            $table->index(['medicine_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
