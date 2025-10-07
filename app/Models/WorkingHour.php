<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkingHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'pharmacy_id',
        'day_of_week',
        'open_time',
        'close_time',
        'closed'
    ];

    // Each working hour belongs to one pharmacy
    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }
}
