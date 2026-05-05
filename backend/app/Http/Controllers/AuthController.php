<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Hospital;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Check for Patient
        $patient = Patient::where('email', $request->email)->first();
        if ($patient && Hash::check($request->password, $patient->password)) {
            return response()->json([
                'status' => 'success',
                'user_type' => 'patient',
                'user' => $patient
            ]);
        }

        // Check for Hospital
        $hospital = Hospital::where('email', $request->email)->first();
        if ($hospital && Hash::check($request->password, $hospital->password)) {
            return response()->json([
                'status' => 'success',
                'user_type' => 'hospital',
                'user' => $hospital
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Identifiants invalides'
        ], 401);
    }
    public function updatePassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'user_type' => 'required|in:patient,hospital',
            'current_password' => 'required',
            'new_password' => 'required|min:6',
        ]);

        $user = null;
        if ($request->user_type === 'patient') {
            $user = Patient::where('email', $request->email)->first();
        } else {
            $user = Hospital::where('email', $request->email)->first();
        }

        if (!$user || !Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ancien mot de passe incorrect'
            ], 401);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Mot de passe mis à jour avec succès'
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'user_type' => 'required|in:patient,hospital',
            'full_name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date',
            'blood_type' => 'sometimes|required|string|max:10',
        ]);

        $user = null;
        if ($request->user_type === 'patient') {
            $user = Patient::where('email', $request->email)->first();
        } else {
            $user = Hospital::where('email', $request->email)->first();
        }

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur introuvable'
            ], 404);
        }

        $user->update($request->only(['full_name', 'phone', 'address', 'birth_date', 'blood_type']));

        return response()->json([
            'status' => 'success',
            'message' => 'Profil mis à jour avec succès',
            'user' => $user
        ]);
    }
}
