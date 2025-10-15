<?php

namespace App\Http\Controllers;

use App\Models\Pharmacy;
use App\Models\Insurance;
use App\Models\WorkingHour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PharmacyController extends Controller
{
    /**
     * STORE (Create) a pharmacy + insurances + working hours
     * Route: POST /api/pharmacy  (auth required)
     */
    public function store(Request $request)
    {
        // 1) Ensure only logged-in pharmacy owners can create
        if (!Auth::check() || Auth::user()->role !== 'pharmacy_owner') {
            return response()->json(['message' => 'Only pharmacy owners can create pharmacies'], 403);
        }

        // 2) Validate request payload
        $validated = $request->validate([
            'pharmacy_name' => ['required','string','max:255'],
            'location'      => ['required','string','max:255'],
            'latitude'      => ['nullable','numeric','between:-90,90'],
            'longitude'     => ['nullable','numeric','between:-180,180'],
            'email'         => ['nullable','email','max:255'],
            'phone_number'  => ['nullable','string','max:30'],

            // Insurances can be:
            // - array of IDs: [1,2,3]
            // - array of names: ["RSSB","Radiant"]
            'insurances'    => ['nullable','array'],
            'insurances.*'  => [], // keep simple; we’ll resolve to IDs below

            // Working hours: array of objects per day
            // [{ day_of_week, open_time, close_time, closed }]
            'working_hours'                 => ['nullable','array'],
            'working_hours.*.day_of_week'   => ['required_with:working_hours', Rule::in([
                'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
            ])],
            'working_hours.*.open_time'     => ['nullable','date_format:H:i'],
            'working_hours.*.close_time'    => ['nullable','date_format:H:i'],
            'working_hours.*.closed'        => ['nullable','boolean'],
        ]);

        // 3) Do everything in a DB transaction so it’s all-or-nothing
        $pharmacy = DB::transaction(function () use ($validated) {

            // 3a) Create pharmacy row (linked to the current user) - AUTO-APPROVED
            $pharmacy = Pharmacy::create([
                'user_id'       => Auth::id(),
                'pharmacy_name' => $validated['pharmacy_name'],
                'location'      => $validated['location'],
                'latitude'      => $validated['latitude'] ?? null,
                'longitude'     => $validated['longitude'] ?? null,
                'email'         => $validated['email'] ?? null,
                'phone_number'  => $validated['phone_number'] ?? null,
                'status'        => 'active', // Auto-approve - visible to users immediately
                'verification_status' => 'pending', // Mark for admin verification
            ]);

            // 3b) Attach insurances (if provided)
            if (!empty($validated['insurances'])) {
                // Convert each provided item (name or id) into a valid insurance ID
                $insuranceIds = $this->resolveInsuranceIds($validated['insurances']);
                $pharmacy->insurances()->sync($insuranceIds);
            }

            // 3c) Save working hours (if provided)
            if (!empty($validated['working_hours'])) {
                foreach ($validated['working_hours'] as $wh) {
                    WorkingHour::create([
                        'pharmacy_id' => $pharmacy->id,
                        'day_of_week' => $wh['day_of_week'],
                        'open_time'   => $wh['open_time']   ?? null,
                        'close_time'  => $wh['close_time']  ?? null,
                        'closed'      => $wh['closed']      ?? false,
                    ]);
                }
            }

            return $pharmacy;
        });

        // 4) Return the created pharmacy with relations
        $pharmacy->load(['insurances', 'workingHours']);

        return response()->json([
            'message'  => 'Pharmacy created successfully',
            'pharmacy' => $pharmacy
        ], 201);
    }
    public function getMyPharmacy(Request $request)
{
    // Load the full pharmacy model with relationships
    $pharmacy = Pharmacy::with([
            'insurances:id,name',
            'workingHours:id,pharmacy_id,day_of_week,open_time,close_time,closed'
        ])
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$pharmacy) {
        return response()->json(['message' => 'No pharmacy found for this user'], 404);
    }
    
    // Calculate if pharmacy is open
    $isOpen = $pharmacy->isCurrentlyOpen();


            return response()->json([
            'id' => $pharmacy->id,
            'name' => $pharmacy->pharmacy_name,
            'pharmacy_name' => $pharmacy->pharmacy_name,
            'address' => $pharmacy->location,
            'location' => $pharmacy->location,
            'phone_number' => $pharmacy->phone_number,
            'email' => $pharmacy->email,
            'latitude' => $pharmacy->latitude,
            'longitude' => $pharmacy->longitude,
            'is_open' => $isOpen,
            'insurances' => $pharmacy->insurances->pluck('name'),
            'working_hours' => $pharmacy->workingHours->map(fn($wh) => [
                'day_of_week' => $wh->day_of_week,
                'open_time' => $wh->open_time,
                'close_time' => $wh->close_time,
                'is_closed' => $wh->closed,
            ]),
        ]);
}

    /**
     * SHOW a single pharmacy with relations
     * Route: GET /api/pharmacy/{id}
     */
    public function show($id)
    {
        // Eager-load insurances + working hours
        $pharmacy = Pharmacy::with(['insurances','workingHours'])->find($id);

        if (!$pharmacy) {
            return response()->json(['message' => 'Pharmacy not found'], 404);
        }

        // Calculate if pharmacy is open
        $pharmacy->is_open = $pharmacy->isCurrentlyOpen();

        return response()->json($pharmacy);
    }

    /**
     * UPDATE a pharmacy + insurances + working hours
     * Route: PUT /api/pharmacy/{id}  (auth owner-only)
     */
    public function update(Request $request, $id)
    {
        $pharmacy = Pharmacy::with(['insurances','workingHours'])->find($id);
        if (!$pharmacy) {
            return response()->json(['message' => 'Pharmacy not found'], 404);
        }

        // Only the owner can update
        if (Auth::id() !== $pharmacy->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Validate incoming update
        $validated = $request->validate([
            'pharmacy_name' => ['sometimes','string','max:255'],
            'location'      => ['sometimes','string','max:255'],
            'latitude'      => ['nullable','numeric','between:-90,90'],
            'longitude'     => ['nullable','numeric','between:-180,180'],
            'email'         => ['nullable','email','max:255'],
            'phone_number'  => ['nullable','string','max:30'],

            'insurances'    => ['nullable','array'],
            'insurances.*'  => ['string'],

            'working_hours'                 => ['nullable','array'],
            'working_hours.*.day_of_week'   => ['required_with:working_hours', Rule::in([
                'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
            ])],
            'working_hours.*.open_time'     => ['nullable','date_format:H:i'],
            'working_hours.*.close_time'    => ['nullable','date_format:H:i'],
            'working_hours.*.closed'        => ['nullable'],
        ]);

        DB::transaction(function () use (&$pharmacy, $validated) {
            // Update basic fields if present
            $pharmacy->fill([
                'pharmacy_name' => $validated['pharmacy_name'] ?? $pharmacy->pharmacy_name,
                'location'      => $validated['location']      ?? $pharmacy->location,
                'latitude'      => array_key_exists('latitude', $validated)  ? $validated['latitude']  : $pharmacy->latitude,
                'longitude'     => array_key_exists('longitude',$validated)  ? $validated['longitude'] : $pharmacy->longitude,
                'email'         => array_key_exists('email', $validated)     ? $validated['email']     : $pharmacy->email,
                'phone_number'  => array_key_exists('phone_number',$validated)? $validated['phone_number'] : $pharmacy->phone_number,
            ])->save();

            // Update insurances if provided
            if (array_key_exists('insurances', $validated)) {
                $insuranceIds = $this->resolveInsuranceIds($validated['insurances'] ?? []);
                $pharmacy->insurances()->sync($insuranceIds);
            }

            // Update working hours if provided:
            // strategy = simple replace: delete old then insert new
            if (array_key_exists('working_hours', $validated)) {
                $pharmacy->workingHours()->delete();
                foreach ($validated['working_hours'] ?? [] as $wh) {
                    WorkingHour::create([
                        'pharmacy_id' => $pharmacy->id,
                        'day_of_week' => $wh['day_of_week'],
                        'open_time'   => $wh['open_time']   ?? null,
                        'close_time'  => $wh['close_time']  ?? null,
                        'closed'      => $wh['closed']      ?? false,
                    ]);
                }
            }
        });

        // Return latest
        $pharmacy->load(['insurances','workingHours']);

        return response()->json([
            'message'  => 'Pharmacy updated successfully',
            'pharmacy' => $pharmacy
        ]);
    }

    /**
     * Helper: resolve an array of insurance inputs (IDs or names) into valid IDs.
     * - If value looks like an integer ID and exists -> use it.
     * - Otherwise treat as a name -> firstOrCreate then use ID.
     */
    private function resolveInsuranceIds(array $inputs): array
    {
        $ids = [];
        foreach ($inputs as $item) {
            // If numeric like "3" or 3, try to use as ID if exists
            if (is_numeric($item)) {
                $found = Insurance::find((int)$item);
                if ($found) {
                    $ids[] = $found->id;
                    continue;
                }
            }

            // Otherwise treat as name (trim spaces), create if missing
            $name = trim((string)$item);
            if ($name === '') continue;

            $insurance = Insurance::firstOrCreate(['name' => $name]);
            $ids[] = $insurance->id;
        }

        // Return unique IDs (avoid duplicates)
        return array_values(array_unique($ids));
    }
    public function index(Request $request)
{
    $query = Pharmacy::with(['insurances', 'workingHours']);

    // ✅ Filter by insurance name
    if ($request->has('insurance')) {
        $insurance = $request->insurance;
        $query->whereHas('insurances', function ($q) use ($insurance) {
            $q->where('name', 'LIKE', "%{$insurance}%");
        });
    }

    // ✅ Filter by location
    if ($request->has('location')) {
        $location = $request->location;
        $query->where('location', 'LIKE', "%{$location}%");
    }

    // ✅ Filter by pharmacy name
    if ($request->has('name')) {
        $name = $request->name;
        $query->where('pharmacy_name', 'LIKE', "%{$name}%");
    }
    // ✅ Nearby search using lat/lng
    if ($request->has(['latitude', 'longitude'])) {
        $lat = $request->latitude;
        $lng = $request->longitude;
        $radius = $request->radius ?? 5;

        $haversine = "(6371 * acos(cos(radians($lat)) 
                        * cos(radians(latitude)) 
                        * cos(radians(longitude) - radians($lng)) 
                        + sin(radians($lat)) 
                        * sin(radians(latitude))))";

        $query->select('*')
              ->selectRaw("$haversine AS distance")
              ->having('distance', '<=', $radius)
              ->orderBy('distance');
    }
     $pharmacies = $query->get();
    // ✅ Add "is_open" field to each pharmacy
    $pharmacies->transform(function ($pharmacy) {
        $pharmacy->is_open = $pharmacy->isCurrentlyOpen();
        return $pharmacy;
    });


    

     return response()->json($pharmacies);
 }

 /**
  * GET nearby pharmacies by location
  * Route: GET /api/pharmacies/nearby?lat=...&lng=...&radius=...&insurance=...
  */
 public function nearby(Request $request)
 {
     $validated = $request->validate([
         'lat' => 'required|numeric|between:-90,90',
         'lng' => 'required|numeric|between:-180,180',
         'radius' => 'nullable|numeric|min:0.1|max:100', // km
         'insurance' => 'nullable|string',
         'limit' => 'nullable|integer|min:1|max:20', // max 20 results
     ]);

     $lat = $validated['lat'];
     $lng = $validated['lng'];
     $radius = $validated['radius'] ?? 10; // default 10km
     $insurance = $validated['insurance'] ?? null;
     $limit = $validated['limit'] ?? 10; // default 10 results

     // Use Haversine formula for accurate distance calculation
     $haversine = "(6371 * acos(cos(radians($lat)) 
                     * cos(radians(latitude)) 
                     * cos(radians(longitude) - radians($lng)) 
                     + sin(radians($lat)) 
                     * sin(radians(latitude))))";

     $query = Pharmacy::with(['insurances:id,name', 'workingHours'])
         ->select('*')
         ->selectRaw("$haversine AS distance")
         ->having('distance', '<=', $radius)
         ->orderBy('distance');

     // Filter by insurance if provided
     if ($insurance) {
         $query->whereHas('insurances', function ($q) use ($insurance) {
             $q->where('name', 'like', "%{$insurance}%");
         });
     }

     $pharmacies = $query->get();

     // If we have fewer than 3 results and insurance filter is applied, 
     // expand search to ensure user gets at least 3 results
     if ($pharmacies->count() < 3 && $insurance) {
         $expandedQuery = Pharmacy::with(['insurances:id,name', 'workingHours'])
             ->select('*')
             ->selectRaw("$haversine AS distance")
             ->having('distance', '<=', 100) // 100km radius
             ->orderBy('distance');
         
         $expandedQuery->whereHas('insurances', function ($q) use ($insurance) {
             $q->where('name', 'like', "%{$insurance}%");
         });
         
         $expandedPharmacies = $expandedQuery->get();
         
         // If we still don't have enough results, get all pharmacies with this insurance
         if ($expandedPharmacies->count() < 3) {
             $allQuery = Pharmacy::with(['insurances:id,name', 'workingHours'])
                 ->select('*')
                 ->selectRaw("$haversine AS distance")
                 ->orderBy('distance');
             
             $allQuery->whereHas('insurances', function ($q) use ($insurance) {
                 $q->where('name', 'like', "%{$insurance}%");
             });
             
             $allPharmacies = $allQuery->get();
             
             // Take the first results up to the limit to ensure we have enough options
             $pharmacies = $allPharmacies->take($limit);
         } else {
             $pharmacies = $expandedPharmacies;
         }
     }

     // Format response
     $formattedPharmacies = $pharmacies->map(function ($pharmacy) {
         $isOpen = $pharmacy->isCurrentlyOpen();

         return [
             'id' => $pharmacy->id,
             'pharmacy_name' => $pharmacy->pharmacy_name,
             'name' => $pharmacy->pharmacy_name,
             'location' => $pharmacy->location,
             'address' => $pharmacy->location,
             'latitude' => $pharmacy->latitude,
             'longitude' => $pharmacy->longitude,
             'phone_number' => $pharmacy->phone_number,
             'email' => $pharmacy->email,
             'is_open' => $isOpen,
             'isOpen' => $isOpen,
             'distance_km' => round($pharmacy->distance, 2),
             'insurances' => $pharmacy->insurances->pluck('name'),
             'working_hours' => $pharmacy->workingHours->map(fn($wh) => [
                 'day_of_week' => $wh->day_of_week,
                 'open_time' => $wh->open_time,
                 'close_time' => $wh->close_time,
                 'is_closed' => $wh->closed,
             ]),
         ];
     });

     return response()->json($formattedPharmacies);
 }

}
