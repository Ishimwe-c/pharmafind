<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Purchase;

class CheckPurchaseNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'purchase:check-notification {purchase_number}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check why a purchase notification was not sent';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $purchaseNumber = $this->argument('purchase_number');
        
        $this->info("🔍 Checking purchase: {$purchaseNumber}");
        $this->newLine();
        
        // Get the purchase
        $purchase = Purchase::where('purchase_number', $purchaseNumber)->first();
        
        if (!$purchase) {
            $this->error("❌ Purchase not found!");
            return 1;
        }
        
        $this->info("✅ Purchase found!");
        $this->line("   Patient Name: {$purchase->patient_name}");
        $this->line("   Patient Phone: {$purchase->patient_phone}");
        $this->line("   User ID: " . ($purchase->user_id ?? 'NULL'));
        $this->newLine();
        
        // Check if there's a user with this phone number
        $this->info("🔍 Looking for users with phone: {$purchase->patient_phone}");
        $this->newLine();
        
        $users = User::where('phone_number', $purchase->patient_phone)->get();
        
        if ($users->isEmpty()) {
            $this->error("❌ No users found with this phone number!");
            $this->newLine();
            
            // Check all patient users
            $this->info("📋 All patient users in database:");
            $allPatients = User::where('role', 'patient')->get();
            foreach ($allPatients as $patient) {
                $this->line("   - {$patient->name} ({$patient->email}) - Phone: {$patient->phone_number}");
            }
        } else {
            $this->info("✅ Found {$users->count()} user(s) with this phone:");
            foreach ($users as $user) {
                $this->line("   - ID: {$user->id}");
                $this->line("     Name: {$user->name}");
                $this->line("     Email: {$user->email}");
                $this->line("     Phone: {$user->phone_number}");
                $this->line("     Role: {$user->role}");
                
                // Check notifications for this user
                $notifications = $user->notifications()->where('data->purchase_id', $purchase->id)->get();
                if ($notifications->isEmpty()) {
                    $this->warn("     ⚠ No notifications found for this purchase!");
                } else {
                    $this->info("     ✅ Has {$notifications->count()} notification(s) for this purchase");
                }
                $this->newLine();
            }
        }
        
        // Check if purchase has a user_id
        if ($purchase->user_id) {
            $this->info("🔍 Checking user linked to purchase (ID: {$purchase->user_id})");
            $linkedUser = User::find($purchase->user_id);
            if ($linkedUser) {
                $this->line("   Name: {$linkedUser->name}");
                $this->line("   Email: {$linkedUser->email}");
                $this->line("   Phone: {$linkedUser->phone_number}");
                
                $notifications = $linkedUser->notifications()->where('data->purchase_id', $purchase->id)->get();
                if ($notifications->isEmpty()) {
                    $this->warn("   ⚠ No notifications found for this purchase!");
                } else {
                    $this->info("   ✅ Has {$notifications->count()} notification(s) for this purchase");
                }
            }
        }
        
        return 0;
    }
}
