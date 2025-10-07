<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InsuranceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //public function run()
{
    \App\Models\Insurance::insert([
        ['name' => 'NHIF'],
        ['name' => 'Jubilee Insurance'],
        ['name' => 'AAR Insurance'],
        ['name' => 'Britam Insurance'],
        ['name' => 'CIC Insurance'],
    ]);
}
    }
    
}
