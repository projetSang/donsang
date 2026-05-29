<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Hospital;
use App\Models\BloodDonor;
use App\Models\User;
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

        

        // Check for Admin (User model)
        $admin = User::where('email', $request->email)->first();
        if ($admin && Hash::check($request->password, $admin->password)) {
            $token = bin2hex(random_bytes(32));
            $admin->user_type = 'admin';
            return response()->json([
                'status' => 'success',
                'user_type' => 'admin',
                'user' => $admin,
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

        // Check for Blood Donor
        $donor = BloodDonor::where('email', $request->email)->first();
        if ($donor && Hash::check($request->password, $donor->password)) {
            $token = bin2hex(random_bytes(32));
            $donor->user_type = 'donor';
            return response()->json([
                'status' => 'success',
                'user_type' => 'donor',
                'user' => $donor,
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
            'email' => 'required|email|unique:blood_donors,email',
            'password' => 'required|min:6|confirmed',
            'phone' => 'required|string',
            'city' => 'required|string|max:255',
            'blood_type' => 'required|string|max:10',
            'cin' => 'nullable|string|max:20|unique:blood_donors,cin',
        ]);

        $donor = BloodDonor::create([
            'full_name' => $request->full_name,
            'cin' => $request->cin,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'city' => $request->city,
            'blood_type' => $request->blood_type,
            'donations_count' => 0,
        ]);

        $token = bin2hex(random_bytes(32));

        return response()->json([
            'status' => 'success',
            'message' => 'Compte créé avec succès',
            'user' => $donor,
            'user_type' => 'donor',
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
            $patient = Patient::where('email', $request->email)->first();
            $donor = BloodDonor::where('email', $request->email)->first();

            if ($patient) {
                $patient->update($request->only([
                    'full_name', 'phone', 'address', 'birth_date', 'blood_type',
                    'emergency_contact_name', 'emergency_contact_relation', 'emergency_contact_phone',
                    'latitude', 'longitude'
                ]));
            }

            if ($donor) {
                $donorData = $request->only(['full_name', 'phone', 'blood_type']);
                if ($request->filled('address')) {
                    $donorData['city'] = $request->address;
                }
                $donor->update($donorData);
            }

            $user = $donor ?: $patient;
        } else {
            $user = Hospital::where('email', $request->email)->first();
            if ($user) {
                $user->update($request->only([
                    'name', 'city', 'email', 'address', 'phone', 'latitude', 'longitude'
                ]));
            }
        }

        if ($user) {
            $user->is_patient = ($user instanceof Patient) ? 1 : 0;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Profil mis à jour avec succès',
            'user' => $user
        ]);
    }

    public function getProfile(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'user_type' => 'required|in:patient,hospital',
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

        if ($user && $request->user_type === 'patient') {
            $user->is_patient = ($user instanceof Patient) ? 1 : 0;
        }

        return response()->json([
            'status' => 'success',
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
        try {
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

            $emailData = [
                'name' => $name,
                'resetUrl' => $resetUrl,
            ];
            Mail::send('emails.reset_password', $emailData, function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('Réinitialisation de votre mot de passe - DonSang');
            });
        } catch (\Throwable $e) {
            \Log::error("Erreur dans sendResetLinkEmail : " . $e->getMessage());
            // Pour le développement local, si le serveur de mail ou la DB échoue, on peut aussi retourner le token pour faciliter le test
            $fallbackToken = isset($token) ? $token : bin2hex(random_bytes(32));
            $fallbackResetUrl = 'http://localhost:8080/reset-password?token=' . $fallbackToken . '&email=' . urlencode($request->email);
            return response()->json([
                'status' => 'success',
                'message' => 'Lien de réinitialisation généré (erreur d\'envoi email ou base de données)',
                'dev_reset_url' => $fallbackResetUrl
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
