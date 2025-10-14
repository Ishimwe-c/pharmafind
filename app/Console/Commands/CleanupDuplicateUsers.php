<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CleanupDuplicateUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:cleanup-duplicates {--phone= : Specific phone number to clean up}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove duplicate patient users with the same phone number';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("🧹 Cleaning up duplicate users...");
        $this->newLine();
        
        $specificPhone = $this->option('phone');
        
        // Find duplicate phone numbers
        $duplicatePhones = User::select('phone_number', DB::raw('COUNT(*) as count'))
            ->where('role', 'patient')
            ->whereNotNull('phone_number')
            ->when($specificPhone, function($query) use ($specificPhone) {
                return $query->where('phone_number', $specificPhone);
            })
            ->groupBy('phone_number')
            ->having('count', '>', 1)
            ->get();
        
        if ($duplicatePhones->isEmpty()) {
            $this->info("✅ No duplicate users found!");
            return 0;
        }
        
        $this->info("📋 Found " . $duplicatePhones->count() . " phone number(s) with duplicates:");
        $this->newLine();
        
        $totalToDelete = 0;
        $deleteList = [];
        
        foreach ($duplicatePhones as $duplicate) {
            $users = User::where('phone_number', $duplicate->phone_number)
                ->where('role', 'patient')
                ->orderBy('id', 'asc')
                ->get();
            
            $this->info("Phone: {$duplicate->phone_number} ({$duplicate->count} users)");
            
            // Keep the first (oldest) user
            $keepUser = $users->first();
            $this->line("  ✅ KEEP: ID {$keepUser->id} - {$keepUser->name} ({$keepUser->email})");
            
            // Mark others for deletion
            $deleteUsers = $users->skip(1);
            foreach ($deleteUsers as $user) {
                $this->line("  ❌ DELETE: ID {$user->id} - {$user->name} ({$user->email})");
                $deleteList[] = $user;
                $totalToDelete++;
            }
            
            $this->newLine();
        }
        
        if ($totalToDelete === 0) {
            $this->info("✅ No duplicates to delete!");
            return 0;
        }
        
        $this->warn("⚠️  Total users to delete: {$totalToDelete}");
        
        if (!$this->confirm('Do you want to proceed with deleting these duplicate users?', true)) {
            $this->info("❌ Deletion cancelled.");
            return 0;
        }
        
        // Delete duplicates
        $this->info("🗑️  Deleting duplicate users...");
        $deletedCount = 0;
        
        foreach ($deleteList as $user) {
            try {
                $user->delete();
                $this->line("  ✅ Deleted: {$user->name} (ID: {$user->id})");
                $deletedCount++;
            } catch (\Exception $e) {
                $this->error("  ❌ Failed to delete user ID {$user->id}: {$e->getMessage()}");
            }
        }
        
        $this->newLine();
        $this->info("✅ Successfully deleted {$deletedCount} duplicate user(s)!");
        
        return 0;
    }
}
