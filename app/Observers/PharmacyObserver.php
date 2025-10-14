<?php

namespace App\Observers;

use App\Models\Pharmacy;

class PharmacyObserver
{
    /**
     * Handle the Pharmacy "created" event.
     */
    public function created(Pharmacy $pharmacy): void
    {
        // Automatically sync all insurances with 80% default coverage
        $pharmacy->syncAllInsurances(80);
        
        \Log::info('🏥 New pharmacy created - auto-synced with all insurances', [
            'pharmacy_id' => $pharmacy->id,
            'pharmacy_name' => $pharmacy->pharmacy_name
        ]);
    }
}
