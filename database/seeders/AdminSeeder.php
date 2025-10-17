<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * AdminSeeder
 * 
 * Creates the initial super admin user for the PharmaFind system.
 * This seeder should be run after the main database seeder to ensure
 * the users table exists and has the proper structure.
 * 
 * Usage:
 * php artisan db:seed --class=AdminSeeder
 * 
 * Or add to DatabaseSeeder.php to run automatically
 */
class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates a super admin user with the following credentials:
     * Email: admin@pharmafind.com
     * Password: admin123
     * Role: super_admin
     * 
     * @return void
     */
    public function run()
    {
        // Check if admin user already exists
        $existingAdmin = User::where('email', 'admin@pharmafind.com')->first();
        
        if ($existingAdmin) {
            $this->command->info('Admin user already exists. Skipping creation.');
            return;
        }

        // Create super admin user
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@pharmafind.com',
            'password' => Hash::make('admin123'),
            'role' => 'super_admin',
            'email_verified_at' => now(),
            'phone_number' => '+250 788 000 000', // Default admin phone
            'date_of_birth' => '1990-01-01', // Default admin DOB
            'gender' => 'Other', // Default admin gender
        ]);

        $this->command->info('Super Admin user created successfully!');
        $this->command->info('Email: admin@pharmafind.com');
        $this->command->info('Password: admin123');
        $this->command->warn('Please change the password after first login for security!');

        // Create additional admin users if needed
        $this->createAdditionalAdmins();
    }

    /**
     * Create additional admin users for testing/development
     * 
     * @return void
     */
    private function createAdditionalAdmins()
    {
        // Create a regular admin user
        $regularAdmin = User::where('email', 'admin2@pharmafind.com')->first();
        
        if (!$regularAdmin) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin2@pharmafind.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'phone_number' => '+250 788 000 001',
                'date_of_birth' => '1990-01-01',
                'gender' => 'Other',
            ]);
            
            $this->command->info('Regular Admin user created: admin2@pharmafind.com');
        }
    }
}
































