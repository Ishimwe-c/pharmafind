<?php

namespace App\Http\Controllers;

use App\Models\Insurance;
use Illuminate\Http\Request;

class InsuranceController extends Controller
{
    /**
     * Return all insurances as JSON.
     */
    public function index()
    {
        return response()->json(Insurance::all());
    }

    /**
     * Store a new insurance (optional, if admin adds new insurances).
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:insurances,name'
        ]);

        $insurance = Insurance::create([
            'name' => $request->name
        ]);

        return response()->json($insurance, 201);
    }
}
