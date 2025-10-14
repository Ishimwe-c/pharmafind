<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pharmacy;
use App\Models\Insurance;
use Illuminate\Support\Facades\DB;

class SetupAllInsurances extends Command
{
    protected $signature = 'pharmacy:setup-all-insurances {pharmacy_name} {coverage_percentage}';
    protected $description = 'Setup all insurances for a pharmacy with the same coverage percentage';

    public function handle()
    {
        $pharmacyName = $this->argument('pharmacy_name');
        $coveragePercentage = $this->argument('coverage_percentage');
        
        $this->info("🏥 Setting up ALL insurances for pharmacy...");
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
        $this->newLine();
        
        // Get all insurances
        $insurances = Insurance::all();
        
        if ($insurances->isEmpty()) {
            $this->error("❌ No insurances found in the database!");
            return 1;
        }
        
        $this->info("📋 Found {$insurances->count()} insurance(s):");
        $this->newLine();
        
        $created = 0;
        $updated = 0;
        $failed = 0;
        
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
                    
                    $this->line("  🔄 Updated: {$insurance->name} → {$coveragePercentage}%");
                    $updated++;
                } else {
                    // Create new relationship
                    DB::table('insurance_pharmacy')->insert([
                        'pharmacy_id' => $pharmacy->id,
                        'insurance_id' => $insurance->id,
                        'coverage_percentage' => $coveragePercentage,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    
                    $this->line("  🆕 Created: {$insurance->name} → {$coveragePercentage}%");
                    $created++;
                }
            } catch (\Exception $e) {
                $this->error("  ❌ Failed: {$insurance->name} - {$e->getMessage()}");
                $failed++;
            }
        }
        
        $this->newLine();
        $this->info("✅ Complete!");
        $this->line("  📊 Created: {$created}");
        $this->line("  🔄 Updated: {$updated}");
        if ($failed > 0) {
            $this->line("  ❌ Failed: {$failed}");
        }
        
        $this->newLine();
        $this->info("🎉 {$pharmacy->pharmacy_name} now accepts all insurances with {$coveragePercentage}% coverage!");
        
        return 0;
    }
}
