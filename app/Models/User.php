<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ← ADD THIS LINE

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes; // ← ADD SoftDeletes HERE

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'date_of_birth',
        'email',
        'password',
        'phone_number',
        'role',
        'gender',
        'marital_status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'deleted_at' => 'datetime', // Add this for soft deletes
        ];
        
    }
    
    public function pharmacies()
    {
        return $this->hasMany(Pharmacy::class);
    }

    // A user (patient) can have many insurances
    public function insurances()
    {
        return $this->belongsToMany(Insurance::class, 'insurance_patient')
                    ->withPivot(['policy_number', 'member_id', 'coverage_start_date', 'coverage_end_date', 'is_active', 'notes'])
                    ->withTimestamps();
    }

    // A user (patient) can have many purchases
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    /**
     * Check if user is suspended (soft deleted)
     */
    public function isSuspended()
    {
        return !is_null($this->deleted_at);
    }

    /**
     * Get user status
     */
    public function getStatusAttribute()
    {
        return $this->isSuspended() ? 'suspended' : 'active';
    }
}