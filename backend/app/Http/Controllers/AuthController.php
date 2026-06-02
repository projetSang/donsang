<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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
            'user_type' => 'required|in:donor,hospital',
            'current_password' => 'required',
            'new_password' => 'required|min:6',
        ]);

        $user = null;
        if ($request->user_type === 'donor') {
            $user = BloodDonor::where('email', $request->email)->first();
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
            'user_type' => 'required|in:donor,hospital',
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
        if ($request->user_type === 'donor') {
            $user = BloodDonor::where('email', $request->email)->first();

            if ($user) {
                // For donors, we map address to city if they use the same field in UI
                $donorData = $request->only(['full_name', 'phone', 'blood_type', 'latitude', 'longitude']);
                if ($request->filled('address')) {
                    $donorData['city'] = $request->address;
                }
                $user->update($donorData);
            }
        } else {
            $user = Hospital::where('email', $request->email)->first();
            if ($user) {
                $user->update($request->only([
                    'name', 'city', 'email', 'address', 'phone', 'latitude', 'longitude'
                ]));
            }
        }

        if ($user && $request->user_type === 'donor') {
            $user->is_donor = 1;
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
            'user_type' => 'required|in:donor,hospital',
        ]);

        $user = null;
        if ($request->user_type === 'donor') {
            $user = BloodDonor::where('email', $request->email)->first();
        } else {
            $user = Hospital::where('email', $request->email)->first();
        }

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur introuvable'
            ], 404);
        }

        if ($user && $request->user_type === 'donor') {
            $user->is_donor = 1;
        }

        return response()->json([
            'status' => 'success',
            'user' => $user
        ]);
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = null;
        $name = '';
        
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

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun utilisateur trouvé avec cette adresse email.'
            ], 404);
        }
        // generer le token
        $token = bin2hex(random_bytes(32));

        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => now()
            ]
        );

        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

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
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible d\'envoyer l\'email de réinitialisation pour le moment.'
            ], 500);
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
        $user = BloodDonor::where('email', $request->email)->first();
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
