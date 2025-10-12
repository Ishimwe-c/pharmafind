<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'pharmacy_id',
        'name',
        'price',
        'stock_quantity',
        'category',
        'description',
        'manufacturer',
        'dosage_form',
        'strength',
        'requires_prescription',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'requires_prescription' => 'boolean',
        'is_active' => 'boolean',
    ];

    // A medicine belongs to one pharmacy
    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    // A medicine can be in many purchase items
    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    // Scope for active medicines
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for medicines in stock
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    // Scope for medicines by category
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Check if medicine is in stock
    public function isInStock()
    {
        return $this->stock_quantity > 0;
    }

    // Reduce stock quantity
    public function reduceStock($quantity)
    {
        if ($this->stock_quantity >= $quantity) {
            $this->stock_quantity -= $quantity;
            $this->save();
            return true;
        }
        return false;
    }
}
