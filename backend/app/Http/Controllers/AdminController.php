<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hospital;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function getHospitals()
    {
        return response()->json(Hospital::all());
    }

    public function storeHospital(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'email' => 'required|email|unique:hospitals,email',
            'password' => 'required|string|min:6',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $hospital = Hospital::create($validated);

        return response()->json($hospital, 201);
    }

    public function updateHospital(Request $request, $id)
    {
        $hospital = Hospital::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:hospitals,email,' . $id,
            'password' => 'nullable|string|min:6',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $hospital->update($validated);

        return response()->json($hospital);
    }

    public function deleteHospital($id)
    {
        $hospital = Hospital::findOrFail($id);
        $hospital->delete();

        return response()->json(['message' => 'Hôpital supprimé avec succès']);
    }
}
