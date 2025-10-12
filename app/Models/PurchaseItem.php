<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'medicine_id',
        'quantity',
        'unit_price',
        'total_price',
        'insurance_coverage_amount',
        'patient_payment_amount',
        'notes'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'insurance_coverage_amount' => 'decimal:2',
        'patient_payment_amount' => 'decimal:2',
    ];

    // A purchase item belongs to one purchase
    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    // A purchase item belongs to one medicine
    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    // Calculate total price based on quantity and unit price
    public function calculateTotalPrice()
    {
        $this->total_price = $this->quantity * $this->unit_price;
        return $this->total_price;
    }

    // Calculate insurance and patient payment amounts
    public function calculatePaymentAmounts($insuranceCoveragePercentage = 0)
    {
        $totalPrice = $this->calculateTotalPrice();
        $this->insurance_coverage_amount = $totalPrice * ($insuranceCoveragePercentage / 100);
        $this->patient_payment_amount = $totalPrice - $this->insurance_coverage_amount;
    }
}
