<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Pharmacy;
use App\Models\Medicine;

class DiagnosePharmacyUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pharmacy:diagnose {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Diagnose pharmacy user issues and show their pharmacy and medicine data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        if ($email) {
            $this->diagnoseUser($email);
        } else {
            $this->showAllPharmacyOwners();
        }
    }
    
    protected function diagnoseUser($email)
    {
        $this->info("Diagnosing user: {$email}");
        $this->newLine();
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("❌ User not found with email: {$email}");
            return;
        }
        
        $this->info("✓ User found:");
        $this->line("  ID: {$user->id}");
        $this->line("  Name: {$user->name}");
        $this->line("  Email: {$user->email}");
        $this->line("  Role: {$user->role}");
        $this->newLine();
        
        if ($user->role !== 'pharmacy_owner' && $user->role !== 'pharmacy') {
            $this->warn("⚠ User is not a pharmacy owner");
            return;
        }
        
        $pharmacy = Pharmacy::where('user_id', $user->id)->first();
        
        if (!$pharmacy) {
            $this->error("❌ No pharmacy found for this user!");
            $this->newLine();
            
            // Check if there's a pharmacy with matching email
            $pharmacyByEmail = Pharmacy::where('email', $user->email)->first();
            if ($pharmacyByEmail) {
                $this->warn("⚠ Found pharmacy with matching email but wrong user_id:");
                $this->line("  Pharmacy ID: {$pharmacyByEmail->id}");
                $this->line("  Pharmacy Name: {$pharmacyByEmail->pharmacy_name}");
                $this->line("  Current user_id: " . ($pharmacyByEmail->user_id ?? 'NULL'));
                $this->newLine();
                
                if ($this->confirm("Do you want to link this pharmacy to the user?")) {
                    $pharmacyByEmail->user_id = $user->id;
                    $pharmacyByEmail->save();
                    $this->info("✓ Pharmacy linked successfully!");
                    $pharmacy = $pharmacyByEmail;
                }
            } else {
                $this->warn("No pharmacy found with matching email either.");
                $this->info("The user needs to complete pharmacy registration.");
            }
        }
        
        if ($pharmacy) {
            $this->info("✓ Pharmacy found:");
            $this->line("  ID: {$pharmacy->id}");
            $this->line("  Name: {$pharmacy->pharmacy_name}");
            $this->line("  Location: {$pharmacy->location}");
            $this->line("  Email: {$pharmacy->email}");
            $this->line("  User ID: {$pharmacy->user_id}");
            $this->newLine();
            
            $medicines = Medicine::where('pharmacy_id', $pharmacy->id)->get();
            $this->info("Medicines: " . $medicines->count());
            
            if ($medicines->count() > 0) {
                $this->table(
                    ['ID', 'Name', 'Category', 'Stock', 'Price'],
                    $medicines->map(function ($medicine) {
                        return [
                            $medicine->id,
                            $medicine->medicine_name,
                            $medicine->category,
                            $medicine->stock_quantity,
                            '$' . number_format($medicine->unit_price, 2)
                        ];
                    })
                );
            } else {
                $this->warn("⚠ No medicines found for this pharmacy");
            }
        }
    }
    
    protected function showAllPharmacyOwners()
    {
        $this->info("All Pharmacy Owners:");
        $this->newLine();
        
        $users = User::where('role', 'pharmacy_owner')->get();
        
        $data = [];
        foreach ($users as $user) {
            $pharmacy = Pharmacy::where('user_id', $user->id)->first();
            $medicineCount = $pharmacy ? Medicine::where('pharmacy_id', $pharmacy->id)->count() : 0;
            
            $data[] = [
                $user->id,
                $user->name,
                $user->email,
                $pharmacy ? "✓ {$pharmacy->pharmacy_name}" : "❌ No pharmacy",
                $pharmacy ? $pharmacy->id : '-',
                $medicineCount
            ];
        }
        
        $this->table(
            ['User ID', 'Name', 'Email', 'Pharmacy', 'Pharmacy ID', 'Medicines'],
            $data
        );
        
        $this->newLine();
        $this->info("To diagnose a specific user, run: php artisan pharmacy:diagnose user@example.com");
    }
}
