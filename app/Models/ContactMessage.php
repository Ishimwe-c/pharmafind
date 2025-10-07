<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'priority',
        'admin_notes',
        'assigned_to',
        'read_at',
        'replied_at'
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'replied_at' => 'datetime',
    ];

    // Relationship to assigned admin
    public function assignedAdmin()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Scopes for filtering
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    // Helper method to get priority color
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'urgent' => 'text-red-600 bg-red-100',
            'high' => 'text-orange-600 bg-orange-100',
            'medium' => 'text-yellow-600 bg-yellow-100',
            'low' => 'text-green-600 bg-green-100',
            default => 'text-gray-600 bg-gray-100'
        };
    }

    // Helper method to get status color
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'new' => 'text-blue-600 bg-blue-100',
            'read' => 'text-purple-600 bg-purple-100',
            'replied' => 'text-green-600 bg-green-100',
            'closed' => 'text-gray-600 bg-gray-100',
            default => 'text-gray-600 bg-gray-100'
        };
    }
}
