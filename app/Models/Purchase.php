<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'pharmacy_id',
        'user_id',
        'insurance_id',
        'purchase_number',
        'total_amount',
        'insurance_coverage',
        'patient_payment',
        'payment_status',
        'payment_method',
        'notes',
        'purchase_date'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'insurance_coverage' => 'decimal:2',
        'patient_payment' => 'decimal:2',
        'purchase_date' => 'datetime',
    ];

    // A purchase belongs to one pharmacy
    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    // A purchase belongs to one user (patient)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A purchase can use one insurance
    public function insurance()
    {
        return $this->belongsTo(Insurance::class);
    }

    // A purchase has many purchase items
    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    // Scope for purchases by pharmacy
    public function scopeByPharmacy($query, $pharmacyId)
    {
        return $query->where('pharmacy_id', $pharmacyId);
    }

    // Scope for purchases by patient
    public function scopeByPatient($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Scope for purchases by insurance
    public function scopeByInsurance($query, $insuranceId)
    {
        return $query->where('insurance_id', $insuranceId);
    }

    // Scope for purchases by payment status
    public function scopeByPaymentStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    // Scope for purchases by date range
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('purchase_date', [$startDate, $endDate]);
    }

    // Generate unique purchase number
    public static function generatePurchaseNumber()
    {
        do {
            $number = 'PUR-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('purchase_number', $number)->exists());

        return $number;
    }

    // Calculate totals from purchase items
    public function calculateTotals()
    {
        $totalAmount = $this->purchaseItems->sum('total_price');
        $insuranceCoverage = $this->purchaseItems->sum('insurance_coverage_amount');
        $patientPayment = $this->purchaseItems->sum('patient_payment_amount');

        $this->update([
            'total_amount' => $totalAmount,
            'insurance_coverage' => $insuranceCoverage,
            'patient_payment' => $patientPayment
        ]);
    }
}
