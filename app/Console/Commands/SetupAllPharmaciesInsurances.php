<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pharmacy;
use App\Models\Insurance;
use Illuminate\Support\Facades\DB;

class SetupAllPharmaciesInsurances extends Command
{
    protected $signature = 'pharmacy:setup-all-pharmacies-insurances {coverage_percentage=80}';
    protected $description = 'Setup all insurances for all pharmacies with the same coverage percentage';

    public function handle()
    {
        $coveragePercentage = $this->argument('coverage_percentage');
        
        $this->info("🏥 Setting up ALL insurances for ALL pharmacies...");
        $this->newLine();
        
        // Get all pharmacies and insurances
        $pharmacies = Pharmacy::all();
        $insurances = Insurance::all();
        
        if ($pharmacies->isEmpty()) {
            $this->error("❌ No pharmacies found in the database!");
            return 1;
        }
        
        if ($insurances->isEmpty()) {
            $this->error("❌ No insurances found in the database!");
            return 1;
        }
        
        $this->info("📊 Found {$pharmacies->count()} pharmacy(ies) and {$insurances->count()} insurance(s)");
        $this->newLine();
        
        $totalCreated = 0;
        $totalUpdated = 0;
        $totalFailed = 0;
        
        foreach ($pharmacies as $pharmacy) {
            $this->line("🏥 {$pharmacy->pharmacy_name} (ID: {$pharmacy->id})");
            
            $created = 0;
            $updated = 0;
            
            foreach ($insurances as $insurance) {
                try {
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
                        
                        $updated++;
                        $totalUpdated++;
                    } else {
                        // Create new relationship
                        DB::table('insurance_pharmacy')->insert([
                            'pharmacy_id' => $pharmacy->id,
                            'insurance_id' => $insurance->id,
                            'coverage_percentage' => $coveragePercentage,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                        
                        $created++;
                        $totalCreated++;
                    }
                } catch (\Exception $e) {
                    $this->error("  ❌ Failed: {$insurance->name} - {$e->getMessage()}");
                    $totalFailed++;
                }
            }
            
            $this->line("  ✅ Created: {$created}, Updated: {$updated}");
        }
        
        $this->newLine();
        $this->info("✅ Complete!");
        $this->line("  📊 Total Created: {$totalCreated}");
        $this->line("  🔄 Total Updated: {$totalUpdated}");
        if ($totalFailed > 0) {
            $this->line("  ❌ Total Failed: {$totalFailed}");
        }
        
        $this->newLine();
        $this->info("🎉 All pharmacies now accept all insurances with {$coveragePercentage}% coverage!");
        
        return 0;
    }
}
