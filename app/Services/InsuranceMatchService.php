<?php

namespace App\Services;

use App\Models\User;
use App\Models\Pharmacy;
use App\Models\Insurance;
use App\Notifications\InsuranceMatchAlert;
use Illuminate\Support\Facades\Log;

class InsuranceMatchService
{
    /**
     * Check for insurance matches when a user is near a pharmacy
     */
    public function checkInsuranceMatches(User $user, $latitude, $longitude, $radiusKm = 5)
    {
        try {
            // Get user's active insurances
            $userInsurances = $user->insurances()
                ->wherePivot('is_active', true)
                ->get();

            if ($userInsurances->isEmpty()) {
                return;
            }

            // Find nearby pharmacies
            $nearbyPharmacies = $this->findNearbyPharmacies($latitude, $longitude, $radiusKm);

            foreach ($nearbyPharmacies as $pharmacyData) {
                $pharmacy = $pharmacyData['pharmacy'];
                $distance = $pharmacyData['distance'];

                // Check if pharmacy accepts any of user's insurances
                $matchingInsurances = $pharmacy->insurances()
                    ->whereIn('insurances.id', $userInsurances->pluck('id'))
                    ->get();

                foreach ($matchingInsurances as $insurance) {
                    // Send notification to user
                    $user->notify(new InsuranceMatchAlert($pharmacy, $insurance, $distance));
                    
                    Log::info("Insurance match notification sent", [
                        'user_id' => $user->id,
                        'pharmacy_id' => $pharmacy->id,
                        'insurance_id' => $insurance->id,
                        'distance' => $distance
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("Error checking insurance matches", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Find pharmacies within a certain radius
     */
    private function findNearbyPharmacies($latitude, $longitude, $radiusKm)
    {
        $pharmacies = Pharmacy::active()
            // Removed ->verified() to include pending pharmacies
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $nearbyPharmacies = [];

        foreach ($pharmacies as $pharmacy) {
            $distance = $this->calculateDistance(
                $latitude, $longitude,
                $pharmacy->latitude, $pharmacy->longitude
            );

            if ($distance <= $radiusKm) {
                $nearbyPharmacies[] = [
                    'pharmacy' => $pharmacy,
                    'distance' => round($distance, 2)
                ];
            }
        }

        // Sort by distance
        usort($nearbyPharmacies, function ($a, $b) {
            return $a['distance'] <=> $b['distance'];
        });

        return $nearbyPharmacies;
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);

        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return $earthRadius * $c;
    }

    /**
     * Check insurance match for a specific pharmacy
     */
    public function checkPharmacyInsuranceMatch(User $user, Pharmacy $pharmacy)
    {
        $userInsurances = $user->insurances()
            ->wherePivot('is_active', true)
            ->get();

        $matchingInsurances = $pharmacy->insurances()
            ->whereIn('insurances.id', $userInsurances->pluck('id'))
            ->get();

        foreach ($matchingInsurances as $insurance) {
            $user->notify(new InsuranceMatchAlert($pharmacy, $insurance));
        }

        return $matchingInsurances;
    }

    /**
     * Get pharmacies that accept user's insurance
     */
    public function getPharmaciesForUserInsurance(User $user, $latitude = null, $longitude = null, $radiusKm = 10)
    {
        $userInsurances = $user->insurances()
            ->wherePivot('is_active', true)
            ->get();

        if ($userInsurances->isEmpty()) {
            return collect();
        }

        $pharmacies = Pharmacy::active()
            ->verified()
            ->whereHas('insurances', function ($query) use ($userInsurances) {
                $query->whereIn('insurances.id', $userInsurances->pluck('id'));
            })
            ->with(['insurances' => function ($query) use ($userInsurances) {
                $query->whereIn('insurances.id', $userInsurances->pluck('id'));
            }])
            ->get();

        // If coordinates provided, calculate distances and filter by radius
        if ($latitude && $longitude) {
            $pharmacies = $pharmacies->map(function ($pharmacy) use ($latitude, $longitude) {
                if ($pharmacy->latitude && $pharmacy->longitude) {
                    $pharmacy->distance = $this->calculateDistance(
                        $latitude, $longitude,
                        $pharmacy->latitude, $pharmacy->longitude
                    );
                } else {
                    $pharmacy->distance = null;
                }
                return $pharmacy;
            })->filter(function ($pharmacy) use ($radiusKm) {
                // Only include pharmacies with valid coordinates and within radius
                return $pharmacy->distance !== null && $pharmacy->distance <= $radiusKm;
            })->sortBy('distance');
        }

        return $pharmacies;
    }
}





