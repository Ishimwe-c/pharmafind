<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pharmacy extends Model
{
  use HasFactory;

    protected $fillable = [
        'user_id',
        'pharmacy_name',
        'location',
        'email',
        'phone_number',
        'latitude',
        'longitude',
        'status',
        'verification_status',
        'verified_at',
        'verification_notes',
        'verified_by'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];
    // A pharmacy belongs to one user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A pharmacy can accept many insurances
    public function insurances()
    {
        return $this->belongsToMany(Insurance::class, 'insurance_pharmacy');
    }

    // A pharmacy has many working hours entries
    public function workingHours()
    {
        return $this->hasMany(WorkingHour::class);
    }

    // A pharmacy can be verified by a user (admin)
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Scope for active pharmacies (visible to users)
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Scope for verified pharmacies
    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    // Scope for pending verification
    public function scopePendingVerification($query)
    {
        return $query->where('verification_status', 'pending');
    }
}
