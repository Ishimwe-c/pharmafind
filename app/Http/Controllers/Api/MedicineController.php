<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Pharmacy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MedicineController extends Controller
{
    /**
     * Display a listing of medicines for a pharmacy.
     */
    public function index(Request $request): JsonResponse
    {
        $pharmacyId = $request->get('pharmacy_id');
        $category = $request->get('category');
        $search = $request->get('search');
        $inStock = $request->get('in_stock');

        $query = Medicine::with('pharmacy');

        if ($pharmacyId) {
            $query->where('pharmacy_id', $pharmacyId);
        }

        if ($category) {
            $query->byCategory($category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('manufacturer', 'like', "%{$search}%");
            });
        }

        if ($inStock === 'true') {
            $query->inStock();
        }

        $medicines = $query->active()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pharmacy_id' => 'required|exists:pharmacies,id',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'dosage_form' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:255',
            'requires_prescription' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user owns the pharmacy
        $pharmacy = Pharmacy::findOrFail($request->pharmacy_id);
        if ($pharmacy->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only add medicines to your own pharmacy.'
            ], 403);
        }

        $medicine = Medicine::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Medicine created successfully',
            'data' => $medicine->load('pharmacy')
        ], 201);
    }

    /**
     * Display the specified medicine.
     */
    public function show(string $id): JsonResponse
    {
        $medicine = Medicine::with('pharmacy')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $medicine
        ]);
    }

    /**
     * Update the specified medicine.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $medicine = Medicine::findOrFail($id);

        // Check if user owns the pharmacy
        if ($medicine->pharmacy->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only update medicines in your own pharmacy.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'dosage_form' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:255',
            'requires_prescription' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $medicine->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Medicine updated successfully',
            'data' => $medicine->load('pharmacy')
        ]);
    }

    /**
     * Remove the specified medicine.
     */
    public function destroy(string $id): JsonResponse
    {
        $medicine = Medicine::findOrFail($id);

        // Check if user owns the pharmacy
        if ($medicine->pharmacy->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only delete medicines from your own pharmacy.'
            ], 403);
        }

        $medicine->delete();

        return response()->json([
            'success' => true,
            'message' => 'Medicine deleted successfully'
        ]);
    }

    /**
     * Get medicine categories.
     */
    public function categories(): JsonResponse
    {
        $categories = Medicine::active()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Update stock quantity.
     */
    public function updateStock(Request $request, string $id): JsonResponse
    {
        $medicine = Medicine::findOrFail($id);

        // Check if user owns the pharmacy
        if ($medicine->pharmacy->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only update stock in your own pharmacy.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:0',
            'operation' => 'required|in:add,subtract,set'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $quantity = $request->quantity;
        $operation = $request->operation;

        switch ($operation) {
            case 'add':
                $medicine->stock_quantity += $quantity;
                break;
            case 'subtract':
                if ($medicine->stock_quantity < $quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient stock. Current stock: ' . $medicine->stock_quantity
                    ], 400);
                }
                $medicine->stock_quantity -= $quantity;
                break;
            case 'set':
                $medicine->stock_quantity = $quantity;
                break;
        }

        $medicine->save();

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully',
            'data' => $medicine
        ]);
    }
}
