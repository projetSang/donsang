<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\BloodDonor;
use App\Models\Alert;
use App\Models\Hospital;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class DashboardController extends Controller
{
    public function getStats()
    {
        $donorsCount = BloodDonor::count();
        $alertsCount = Alert::where('status','!=','Clôturée')-> count();
        $patientsCount = Patient::count();
        
        // Données pour le graphique (par mois de l'année en cours)
        $donationsData = [];
        $requestsData = [];
        $currentYear = date('Y');

        for ($m = 1; $m <= 12; $m++) {
            $donationsData[] = BloodDonor::whereYear('created_at', $currentYear)->whereMonth('created_at', $m)->count();
            $requestsData[] = Alert::whereYear('created_at', $currentYear)->whereMonth('created_at', $m)->count();
        }

        return response()->json([
            'donors_region' => $donorsCount,
            'requests_month' => Alert::whereMonth('created_at', date('m'))->whereYear('created_at', $currentYear)->count(),
            'established_contacts' => 156,
            'critical_stocks' => "2/8",
            'alerts' => $alertsCount,
            'patients' => $patientsCount,
            'chart_data' => [
                'donations' => $donationsData,
                'requests' => $requestsData
            ]
        ]);
    }

    public function getPatients()
    {
        return response()->json(Patient::all());
    }

    public function storePatient(Request $request)
    {
        $validated = $request->validate([
            'hospital_id' => 'required|exists:hospitals,id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:patients,email',
            'cin' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'height' => 'nullable|string|max:10',
            'weight' => 'nullable|string|max:10',
            'chronic_diseases' => 'nullable|array',
            'blood_type' => 'required|string|max:10',
            'admission_date' => 'required|date'
        ]);

        $password = Str::random(10);// cree mdp auto avec 10 caracteres
        $validated['password'] = $password;

        $patient = Patient::create($validated);

        // Envoyer l'email (sera enregistré dans storage/logs/laravel.log)
        try {
            Mail::raw("Bonjour {$patient->full_name},\n\nVotre dossier médical a été créé avec succès.\nVoici vos identifiants de connexion :\nEmail : {$patient->email}\nMot de passe : {$password}\n\nCordialement,\nL'équipe médicale.", function ($message) use ($patient) {
                $message->to($patient->email)
                    ->subject('Votre nouveau dossier médical - Mot de passe');
            });
        } catch (\Exception $e) {
            \Log::error("Erreur d'envoi d'email : " . $e->getMessage());
        }

        return response()->json([
            'patient' => $patient,
            'temporary_password' => $password
        ], 201);
    }

    public function updatePatient(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:patients,email,' . $id,
            'cin' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'height' => 'nullable|string|max:10',
            'weight' => 'nullable|string|max:10',
            'chronic_diseases' => 'nullable|array',
            'blood_type' => 'sometimes|required|string|max:10',
            'admission_date' => 'sometimes|required|date'
        ]);

        $patient->update($validated);
        return response()->json($patient);
    }

    public function deletePatient($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        return response()->json(['message' => 'Patient supprimé avec succès']);
    }

    public function searchDonors(Request $request)
    {
        $query = BloodDonor::query();

        if ($request->has('blood_type')) {
            $bloodType = $request->blood_type;
            // Normaliser les tirets (court vs long)
            $bloodType = str_replace(['−', '–'], '-', $bloodType);
            
            $query->where(function($q) use ($bloodType) {
                $q->where('blood_type', $bloodType)
                  ->orWhere('blood_type', str_replace('-', '−', $bloodType));
            });
        }

        if ($request->has('city') && $request->city != '') {
            $query->where('city', 'LIKE', '%' . $request->city . '%');
        }

        return response()->json($query->get());
    }
// modifier pour le dernier don
    public function updateDonor(Request $request, $id)
    {
        $donor = BloodDonor::findOrFail($id);
        $donor->update($request->only(['full_name', 'email', 'phone', 'city', 'blood_type', 'last_donation_date']));
        return response()->json($donor);
    }

    public function getStatistiques()
    {
        $total = BloodDonor::count();
        $stats = BloodDonor::select('blood_type', \DB::raw('count(*) as count'))
            ->groupBy('blood_type')
            ->get()
            ->map(function($item) use ($total) {
                return [
                    'group' => $item->blood_type,
                    'count' => $item->count,
                    'pct' => $total > 0 ? round(($item->count / $total) * 100) : 0
                ];
            });

        return response()->json($stats);
    }

    public function getAlerts()
    {
        return response()->json(Alert::with('hospital')->get());
    }

    public function storeAlert(Request $request)
    {
        $validated = $request->validate([
            'hospital_id' => 'required|exists:hospitals,id',
            'blood_type' => 'required|string',
            'urgency_level' => 'required|string',
            'quantity' => 'nullable|string',
            'description' => 'nullable|string',
            'direct_phone' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $alert = Alert::create($validated);
        return response()->json($alert->load('hospital'), 201);
    }

    public function updateAlert(Request $request, $id)
    {
        $alert = Alert::findOrFail($id);
        
        $validated = $request->validate([
            'blood_type' => 'sometimes|required|string',
            'urgency_level' => 'sometimes|required|string',
            'quantity' => 'nullable|string',
            'description' => 'nullable|string',
            'direct_phone' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $alert->update($validated);
        return response()->json($alert->load('hospital'));
    }

    public function deleteAlert($id)
    {
        $alert = Alert::findOrFail($id);
        $alert->delete();
        return response()->json(['message' => 'Alerte supprimée avec succès']);
    }

    public function getHospitalSettings()
    {
        // Pour l'instant on prend le premier hôpital (CHU Casablanca)
        // En prod, on prendrait l'utilisateur authentifié
        $hospital = Hospital::first();
        return response()->json($hospital);
    }

    public function updateHospitalSettings(Request $request)
    {
        $hospital = Hospital::first();
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:hospitals,email,' . $hospital->id,
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:6'
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        } else {
            unset($validated['password']);//annuler le chemps password si n'est pas vide pour n'enregestre pas vide
        }

        $hospital->update($validated);
        return response()->json($hospital);
    }
}
