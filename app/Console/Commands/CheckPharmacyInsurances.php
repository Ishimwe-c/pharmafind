<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pharmacy;
use Illuminate\Support\Facades\DB;

class CheckPharmacyInsurances extends Command
{
    protected $signature = 'pharmacy:check-insurances {pharmacy_name?}';
    protected $description = 'Check pharmacy insurance relationships';

    public function handle()
    {
        $pharmacyName = $this->argument('pharmacy_name');
        
        if ($pharmacyName) {
            $pharmacies = Pharmacy::where('pharmacy_name', 'LIKE', "%{$pharmacyName}%")->get();
        } else {
            $pharmacies = Pharmacy::all();
        }
        
        foreach ($pharmacies as $pharmacy) {
            $this->info("🏥 {$pharmacy->pharmacy_name} (ID: {$pharmacy->id})");
            
            $insurances = DB::table('insurance_pharmacy')
                ->where('pharmacy_id', $pharmacy->id)
                ->get();
            
            if ($insurances->isEmpty()) {
                $this->line("  ❌ No insurance relationships");
            } else {
                foreach ($insurances as $ins) {
                    $insurance = \App\Models\Insurance::find($ins->insurance_id);
                    $this->line("  ✅ {$insurance->name} - Coverage: {$ins->coverage_percentage}%");
                }
            }
            $this->newLine();
        }
        
        return 0;
    }
}
