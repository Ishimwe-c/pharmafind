<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Medicine;
use App\Models\Pharmacy;

class MedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pharmacies = Pharmacy::all();
        
        if ($pharmacies->isEmpty()) {
            $this->command->warn('No pharmacies found. Please run PharmacySeeder first.');
            return;
        }

        $medicines = [
            [
                'name' => 'Paracetamol 500mg',
                'price' => 500,
                'stock_quantity' => 100,
                'category' => 'Pain Relief',
                'description' => 'Pain reliever and fever reducer',
                'manufacturer' => 'PharmaCorp',
                'dosage_form' => 'Tablet',
                'strength' => '500mg',
                'requires_prescription' => false,
            ],
            [
                'name' => 'Amoxicillin 250mg',
                'price' => 1200,
                'stock_quantity' => 50,
                'category' => 'Antibiotic',
                'description' => 'Broad-spectrum antibiotic',
                'manufacturer' => 'MediLife',
                'dosage_form' => 'Capsule',
                'strength' => '250mg',
                'requires_prescription' => true,
            ],
            [
                'name' => 'Ibuprofen 400mg',
                'price' => 800,
                'stock_quantity' => 75,
                'category' => 'Anti-inflammatory',
                'description' => 'Non-steroidal anti-inflammatory drug',
                'manufacturer' => 'HealthPlus',
                'dosage_form' => 'Tablet',
                'strength' => '400mg',
                'requires_prescription' => false,
            ],
            [
                'name' => 'Omeprazole 20mg',
                'price' => 1500,
                'stock_quantity' => 60,
                'category' => 'Gastrointestinal',
                'description' => 'Proton pump inhibitor for acid reflux',
                'manufacturer' => 'DigestCare',
                'dosage_form' => 'Capsule',
                'strength' => '20mg',
                'requires_prescription' => true,
            ],
            [
                'name' => 'Cetirizine 10mg',
                'price' => 600,
                'stock_quantity' => 80,
                'category' => 'Antihistamine',
                'description' => 'Antihistamine for allergies',
                'manufacturer' => 'AllergyFree',
                'dosage_form' => 'Tablet',
                'strength' => '10mg',
                'requires_prescription' => false,
            ],
            [
                'name' => 'Metformin 500mg',
                'price' => 900,
                'stock_quantity' => 40,
                'category' => 'Diabetes',
                'description' => 'Oral antidiabetic medication',
                'manufacturer' => 'DiabCare',
                'dosage_form' => 'Tablet',
                'strength' => '500mg',
                'requires_prescription' => true,
            ],
            [
                'name' => 'Lisinopril 10mg',
                'price' => 1100,
                'stock_quantity' => 35,
                'category' => 'Cardiovascular',
                'description' => 'ACE inhibitor for blood pressure',
                'manufacturer' => 'CardioMed',
                'dosage_form' => 'Tablet',
                'strength' => '10mg',
                'requires_prescription' => true,
            ],
            [
                'name' => 'Vitamin D3 1000IU',
                'price' => 700,
                'stock_quantity' => 90,
                'category' => 'Vitamin',
                'description' => 'Vitamin D supplement',
                'manufacturer' => 'VitaLife',
                'dosage_form' => 'Softgel',
                'strength' => '1000IU',
                'requires_prescription' => false,
            ],
            [
                'name' => 'Cough Syrup',
                'price' => 400,
                'stock_quantity' => 25,
                'category' => 'Cough & Cold',
                'description' => 'Expectorant cough syrup',
                'manufacturer' => 'RespiraCare',
                'dosage_form' => 'Syrup',
                'strength' => '100ml',
                'requires_prescription' => false,
            ],
            [
                'name' => 'Insulin Glargine',
                'price' => 3500,
                'stock_quantity' => 15,
                'category' => 'Diabetes',
                'description' => 'Long-acting insulin',
                'manufacturer' => 'InsulinPro',
                'dosage_form' => 'Injection',
                'strength' => '100 units/ml',
                'requires_prescription' => true,
            ],
        ];

        foreach ($pharmacies as $pharmacy) {
            // Add 3-7 random medicines to each pharmacy
            $medicineCount = rand(3, 7);
            $selectedMedicines = collect($medicines)->random($medicineCount);

            foreach ($selectedMedicines as $medicineData) {
                // Randomize stock quantity and price slightly
                $medicineData['pharmacy_id'] = $pharmacy->id;
                $medicineData['stock_quantity'] = rand(10, 150);
                $medicineData['price'] = $medicineData['price'] + rand(-100, 200);

                Medicine::create($medicineData);
            }
        }

        $this->command->info('Medicines seeded successfully!');
    }
}
