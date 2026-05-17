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
            $token = bin2hex(random_bytes(32));
            $patient->user_type = 'patient';
            return response()->json([
                'status' => 'success',
                'user_type' => 'patient',
                'user' => $patient,
                'token' => $token
            ]);
        }

        // Check for Hospital
        $hospital = Hospital::where('email', $request->email)->first();
        if ($hospital && Hash::check($request->password, $hospital->password)) {
            $token = bin2hex(random_bytes(32));
            $hospital->user_type = 'hospital';
            return response()->json([
                'status' => 'success',
                'user_type' => 'hospital',
                'user' => $hospital,
                'token' => $token
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Identifiants invalides'
        ], 401);
    }

    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:patients,email',
            'password' => 'required|min:6|confirmed',
            'phone' => 'required|string',
            'blood_type' => 'sometimes|nullable|string',
        ]);

        $patient = Patient::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'blood_type' => $request->blood_type ?? 'Non spécifié',
            'hospital_id' => 1, // Default hospital
            'status' => 'Actif',
            'admission_date' => now(),
        ]);

        $token = bin2hex(random_bytes(32));
        $patient->user_type = 'patient';

        return response()->json([
            'status' => 'success',
            'message' => 'Compte créé avec succès',
            'user' => $patient,
            'user_type' => 'patient',
            'token' => $token
        ]);
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
            'blood_type' => 'sometimes|required|string|max:20',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relation' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
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

        $user->update($request->only([
            'full_name', 'phone', 'address', 'birth_date', 'blood_type',
            'emergency_contact_name', 'emergency_contact_relation', 'emergency_contact_phone',
            'latitude', 'longitude'
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Profil mis à jour avec succès',
            'user' => $user
        ]);
    }

    public function generateShareToken(Request $request)
    {
        $patient = Patient::where('email', $request->email)->first();
        if (!$patient) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }
        
        $token = \Illuminate\Support\Str::random(32);
        $patient->share_token = $token;
        $patient->share_token_expires_at = now()->addDays(30);
        $patient->save();

        return response()->json([
            'status' => 'success',
            'share_token' => $token,
            'expires_at' => $patient->share_token_expires_at
        ]);
    }

    public function disableShareToken(Request $request)
    {
        $patient = Patient::where('email', $request->email)->first();
        if ($patient) {
            $patient->share_token = null;
            $patient->share_token_expires_at = null;
            $patient->save();
        }
        return response()->json(['status' => 'success']);
    }

    public function getSharedDossier($token)
    {
        $patient = Patient::where('share_token', $token)
            ->where('share_token_expires_at', '>', now())
            ->first();

        if (!$patient) {
            return response()->json(['status' => 'error', 'message' => 'Lien invalide ou expiré'], 404);
        }

        $patient->load('hospital');
        $documents = \App\Models\MedicalDocument::where('patient_id', $patient->id)->orderBy('created_at', 'desc')->get();
        $documents->transform(function ($doc) {
            $doc->file_url = url('storage/' . $doc->file_path);
            return $doc;
        });
        $patient->documents = $documents;

        return response()->json([
            'status' => 'success',
            'patient' => $patient
        ]);
    }
}
