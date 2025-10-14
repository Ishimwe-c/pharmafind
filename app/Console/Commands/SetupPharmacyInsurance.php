<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pharmacy;
use App\Models\Insurance;
use Illuminate\Support\Facades\DB;

class SetupPharmacyInsurance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pharmacy:setup-insurance {pharmacy_name} {insurance_name} {coverage_percentage}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup insurance coverage for a pharmacy';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $pharmacyName = $this->argument('pharmacy_name');
        $insuranceName = $this->argument('insurance_name');
        $coveragePercentage = $this->argument('coverage_percentage');
        
        $this->info("🏥 Setting up pharmacy-insurance relationship...");
        $this->newLine();
        
        // Find pharmacy
        $pharmacy = Pharmacy::where('pharmacy_name', 'LIKE', "%{$pharmacyName}%")->first();
        if (!$pharmacy) {
            $this->error("❌ Pharmacy not found: {$pharmacyName}");
            $this->info("Available pharmacies:");
            Pharmacy::all()->each(function($p) {
                $this->line("  - {$p->pharmacy_name} (ID: {$p->id})");
            });
            return 1;
        }
        
        $this->info("✅ Found pharmacy: {$pharmacy->pharmacy_name} (ID: {$pharmacy->id})");
        
        // Find insurance
        $insurance = Insurance::where('name', 'LIKE', "%{$insuranceName}%")->first();
        if (!$insurance) {
            $this->error("❌ Insurance not found: {$insuranceName}");
            $this->info("Available insurances:");
            Insurance::all()->each(function($i) {
                $this->line("  - {$i->name} (ID: {$i->id})");
            });
            return 1;
        }
        
        $this->info("✅ Found insurance: {$insurance->name} (ID: {$insurance->id})");
        
        // Check if relationship already exists
        $existing = DB::table('insurance_pharmacy')
            ->where('pharmacy_id', $pharmacy->id)
            ->where('insurance_id', $insurance->id)
            ->first();
        
        if ($existing) {
            // Update existing relationship
            DB::table('insurance_pharmacy')
                ->where('pharmacy_id', $pharmacy->id)
                ->where('insurance_id', $insurance->id)
                ->update([
                    'coverage_percentage' => $coveragePercentage,
                    'updated_at' => now()
                ]);
            
            $this->info("🔄 Updated existing relationship");
        } else {
            // Create new relationship
            DB::table('insurance_pharmacy')->insert([
                'pharmacy_id' => $pharmacy->id,
                'insurance_id' => $insurance->id,
                'coverage_percentage' => $coveragePercentage,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            $this->info("🆕 Created new relationship");
        }
        
        $this->newLine();
        $this->info("✅ Success! {$pharmacy->pharmacy_name} now accepts {$insurance->name} with {$coveragePercentage}% coverage");
        
        return 0;
    }
}
