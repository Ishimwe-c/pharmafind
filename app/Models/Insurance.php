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
}
