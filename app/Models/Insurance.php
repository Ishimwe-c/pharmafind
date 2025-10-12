<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Insurance extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    // An insurance can be accepted by many pharmacies
    public function pharmacies()
    {
        return $this->belongsToMany(Pharmacy::class, 'insurance_pharmacy');
    }

    // An insurance can be used by many patients
    public function patients()
    {
        return $this->belongsToMany(User::class, 'insurance_patient')
                    ->withPivot(['policy_number', 'member_id', 'coverage_start_date', 'coverage_end_date', 'is_active', 'notes'])
                    ->withTimestamps();
    }

    // An insurance can be used in many purchases
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
