<?php

namespace App\Observers;

use App\Models\Insurance;
use App\Models\Pharmacy;
use Illuminate\Support\Facades\DB;

class InsuranceObserver
{
    /**
     * Handle the Insurance "created" event.
     */
    public function created(Insurance $insurance): void
    {
        // Automatically add this insurance to all existing pharmacies with 80% coverage
        $pharmacies = Pharmacy::all();
        
        foreach ($pharmacies as $pharmacy) {
            // Check if relationship already exists
            $exists = DB::table('insurance_pharmacy')
                ->where('pharmacy_id', $pharmacy->id)
                ->where('insurance_id', $insurance->id)
                ->exists();
            
            if (!$exists) {
                DB::table('insurance_pharmacy')->insert([
                    'pharmacy_id' => $pharmacy->id,
                    'insurance_id' => $insurance->id,
                    'coverage_percentage' => 80,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
        
        \Log::info('🏥 New insurance created - auto-synced with all pharmacies', [
            'insurance_id' => $insurance->id,
            'insurance_name' => $insurance->name,
            'pharmacies_count' => $pharmacies->count()
        ]);
    }
}
