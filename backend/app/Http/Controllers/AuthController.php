<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Hospital;
use App\Models\BloodDonor;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        

        // Check for BloodDonor
        $donor = BloodDonor::where('email', $request->email)->first();
        if ($donor && $donor->password && Hash::check($request->password, $donor->password)) {
            $token = bin2hex(random_bytes(32));
            $donor->user_type = 'patient';
            return response()->json([
                'status' => 'success',
                'user_type' => 'patient',
                'user' => $donor,
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
            if (!$user) {
                $user = BloodDonor::where('email', $request->email)->first();
            }
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
            if (!$user) {
                $user = BloodDonor::where('email', $request->email)->first();
            }
        } else {
            $user = Hospital::where('email', $request->email)->first();
        }

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur introuvable'
            ], 404);
        }

        if ($user instanceof BloodDonor) {
            $dataToUpdate = $request->only(['full_name', 'phone', 'blood_type']);
            if ($request->has('address')) {
                $dataToUpdate['city'] = $request->address;
            }
            $user->update($dataToUpdate);
        } else {
            $user->update($request->only([
                'full_name', 'phone', 'address', 'birth_date', 'blood_type',
                'emergency_contact_name', 'emergency_contact_relation', 'emergency_contact_phone',
                'latitude', 'longitude'
            ]));
        }

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

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = null;
        $name = '';
        $patient = Patient::where('email', $request->email)->first();
        if ($patient) {
            $user = $patient;
            $name = $patient->full_name;
        } else {
            $donor = BloodDonor::where('email', $request->email)->first();
            if ($donor) {
                $user = $donor;
                $name = $donor->full_name;
            } else {
                $hospital = Hospital::where('email', $request->email)->first();
                if ($hospital) {
                    $user = $hospital;
                    $name = $hospital->name;
                }
            }
        }

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun utilisateur trouvé avec cette adresse email.'
            ], 404);
        }
//generer le token 
        $token = bin2hex(random_bytes(32));

        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => now()
            ]
        );

        $resetUrl = 'http://localhost:8080/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        try {
            $emailData = [
                'name' => $name,
                'resetUrl' => $resetUrl,
            ];
            Mail::send('emails.reset_password', $emailData, function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('Réinitialisation de votre mot de passe - DonSang');
            });
        } catch (\Exception $e) {
            \Log::error("Erreur d'envoi d'email de réinitialisation : " . $e->getMessage());
            // Pour le développement local, si le serveur de mail échoue, on peut aussi retourner le token pour faciliter le test
            return response()->json([
                'status' => 'success',
                'message' => 'Lien de réinitialisation généré (erreur d\'envoi email)',
                'dev_reset_url' => $resetUrl
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Un email de réinitialisation de mot de passe a été envoyé.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:6|confirmed',
        ]);

        $record = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json([
                'status' => 'error',
                'message' => 'Le lien de réinitialisation est invalide ou a expiré.'
            ], 400);
        }

        // Vérification de l'expiration (par exemple 60 minutes)
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            \DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'status' => 'error',
                'message' => 'Le lien de réinitialisation a expiré.'
            ], 400);
        }

        // Mettre à jour le mot de passe
        $user = Patient::where('email', $request->email)->first();
        if (!$user) {
            $user = BloodDonor::where('email', $request->email)->first();
        }
        if (!$user) {
            $user = Hospital::where('email', $request->email)->first();
        }

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur introuvable.'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Supprimer le jeton utilisé
        \DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Votre mot de passe a été réinitialisé avec succès.'
        ]);
    }
}
