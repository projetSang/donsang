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
        $alertsCount = Alert::where('status', '!=', 'Clôturée')->count();
        $patientsCount = Patient::count();
        $currentYear = date('Y');

        // Optimisation : récupérer toutes les données en deux requêtes au lieu de 24
        $donationsByMonth = BloodDonor::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', $currentYear)
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $requestsByMonth = Alert::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', $currentYear)
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        for ($m = 1; $m <= 12; $m++) {
            $donationsData[] = $donationsByMonth[$m] ?? 0;
            $requestsData[] = $requestsByMonth[$m] ?? 0;
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
        $validated = $request->validate($this->patientRules());

        $password = Str::random(10);// cree mdp auto avec 10 caracteres
        $validated['password'] = $password;

        $patient = Patient::create($validated);

        // Envoyer l'email HTML professionnel
        try {
            $emailData = [
                'patient' => $patient,
                'password' => $password,
                'appUrl' => 'http://localhost:8080',
            ];
            Mail::send('emails.welcome', $emailData, function ($message) use ($patient) {
                $message->to($patient->email)
                    ->subject('Bienvenue sur DonSang - Vos identifiants de connexion');
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
        $validated = $request->validate($this->patientRules($id));
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
        $query = BloodDonor::select('*')->selectRaw('0 as is_patient');

        if ($request->has('blood_type')) {
            $bloodType = $request->blood_type;
            // Normaliser les tirets (court vs long)
            $bloodType = str_replace(['−', '–'], '-', $bloodType);

            $query->where(function ($q) use ($bloodType) {
                $q->where('blood_type', $bloodType)
                    ->orWhere('blood_type', str_replace('-', '−', $bloodType));
            });
        }

        if ($request->has('city') && $request->city != '') {
            $query->where('city', 'LIKE', '%' . $request->city . '%');
        }

        // Location-based search
        if ($request->has('radius') && $request->radius != '') {
            $hospital = Hospital::first(); // Should be authenticated hospital
            if ($hospital && $hospital->latitude && $hospital->longitude) {
                $radius = (float) $request->radius;

                // Note: BloodDonor table needs latitude/longitude too for this to work accurately.
                // If it doesn't have them, we might want to search Patients who are donors.
                // Let's assume we want to search Patients who have blood_type.

                $query = Patient::select('*')->selectRaw('1 as is_patient');
                if ($request->has('blood_type')) {
                    $bloodType = $request->blood_type;
                    $bloodType = str_replace(['−', '–'], '-', $bloodType);
                    $query->where(function ($q) use ($bloodType) {
                        $q->where('blood_type', $bloodType)
                            ->orWhere('blood_type', str_replace('-', '−', $bloodType));
                    });
                }

                $query->selectRaw('(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance', [$hospital->latitude, $hospital->longitude, $hospital->latitude])
                    ->having('distance', '<', $radius)
                    ->orderBy('distance');
            }
        }

        return response()->json($query->get());
    }
    // modifier pour le dernier don
    public function updateDonor(Request $request, $id)
    {
        if ($request->is_patient || $request->has('is_patient') && $request->is_patient == 1) {
            $patient = Patient::findOrFail($id);
            $patient->update($request->only(['full_name', 'email', 'phone', 'address', 'blood_type', 'last_donation_date', 'donations_count']));
            $patient->is_patient = 1;
            return response()->json($patient);
        }

        $donor = BloodDonor::findOrFail($id);
        $donor->update($request->only(['full_name', 'email', 'phone', 'city', 'blood_type', 'last_donation_date', 'donations_count']));
        $donor->is_patient = 0;
        return response()->json($donor);
    }

    public function storeDonor(Request $request)
    {
        $validated = $request->validate($this->donorRules());

        $password = Str::random(10);
        $validated['password'] = \Illuminate\Support\Facades\Hash::make($password);

        $donor = BloodDonor::create($validated);

        if (!empty($donor->email)) {
            try {
                $emailData = [
                    'donor' => $donor,
                    'password' => $password,
                    'appUrl' => 'http://localhost:8080',
                ];
                Mail::send('emails.welcome_donor', $emailData, function ($message) use ($donor) {
                    $message->to($donor->email)
                        ->subject('Bienvenue sur DonSang - Vos identifiants de connexion donneur');
                });
            } catch (\Exception $e) {
                \Log::error("Erreur d'envoi d'email donneur : " . $e->getMessage());
            }
        }

        return response()->json($donor, 201);
    }

    public function getStatistiques()
    {
        $total = BloodDonor::count();
        $stats = BloodDonor::select('blood_type', \DB::raw('count(*) as count'))
            ->groupBy('blood_type')
            ->get()
            ->map(function ($item) use ($total) {
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
        $validated = $request->validate($this->alertRules());
        $alert = Alert::create($validated);

        // Notify nearby patients
        $this->notifyNearbyPatients($alert, $request->radius);

        return response()->json($alert->load('hospital'), 201);
    }

    private function notifyNearbyPatients($alert, $requestedRadius = null)
    {
        $hospital = Hospital::find($alert->hospital_id);
        if (!$hospital || !$hospital->latitude || !$hospital->longitude)
            return;

        // Radius in kilometers
        $radius = $requestedRadius ? (float) $requestedRadius : 20;

        $nearbyPatientsQuery = Patient::select('*')
            ->selectRaw('(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance', [$hospital->latitude, $hospital->longitude, $hospital->latitude])
            ->having('distance', '<', $radius);

        if ($alert->blood_type !== 'Tous groupes') {
            if (str_contains($alert->blood_type, ',')) {
                $rawGroups = array_map('trim', explode(',', $alert->blood_type));
                $groups = [];
                foreach ($rawGroups as $g) {
                    $groups[] = $g;
                    $groups[] = str_replace('−', '-', $g);
                    $groups[] = str_replace('-', '−', $g);
                }
                $nearbyPatientsQuery->whereIn('blood_type', $groups);
            } else {
                $nearbyPatientsQuery->where(function ($q) use ($alert) {
                    $q->where('blood_type', $alert->blood_type)
                        ->orWhere('blood_type', str_replace('−', '-', $alert->blood_type))
                        ->orWhere('blood_type', str_replace('-', '−', $alert->blood_type));
                });
            }
        }

        $nearbyPatients = $nearbyPatientsQuery->get();

        foreach ($nearbyPatients as $patient) {
            // Create app notification
            \App\Models\PatientNotification::create([
                'patient_id' => $patient->id,
                'title' => "Besoin urgent à proximité !",
                'message' => "L'hôpital {$hospital->name} a besoin de sang de type {$alert->blood_type}. Vous êtes à proximité !",
                'type' => 'urgent',
                'is_read' => false
            ]);

            // Send HTML Email
            try {
                $emailData = [
                    'patient' => $patient,
                    'alert' => $alert,
                    'hospital' => $hospital,
                    'appUrl' => 'http://localhost:8080',
                ];
                Mail::send('emails.alert', $emailData, function ($message) use ($patient) {
                    $message->to($patient->email)
                        ->subject('🚨 Alerte Urgente - Don de Sang à proximité');
                });
            } catch (\Exception $e) {
                \Log::error("Email error: " . $e->getMessage());
            }
        }
    }

    public function updateAlert(Request $request, $id)
    {
        $alert = Alert::findOrFail($id);
        $validated = $request->validate($this->alertRules($id));
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
            'password' => 'nullable|string|min:6',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric'
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        } else {
            unset($validated['password']);//annuler le chemps password si n'est pas vide pour n'enregestre pas vide
        }

        $hospital->update($validated);
        return response()->json($hospital);
    }

    public function getDocuments($id)
    {
        $documents = \App\Models\MedicalDocument::where('patient_id', $id)->orderBy('created_at', 'desc')->get();
        // Add full URL to file_path
        $documents->transform(function ($doc) {
            $doc->file_url = url('storage/' . $doc->file_path);
            return $doc;
        });
        return response()->json($documents);
    }

    public function uploadDocument(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'date' => 'nullable|date'
        ]);

        $file = $request->file('file');
        // Store in storage/app/public/documents
        $path = $file->store('documents', 'public');

        $doc = \App\Models\MedicalDocument::create([
            'patient_id' => $id,
            'name' => $request->name,
            'category' => $request->category ?: 'Autre',
            'type' => $file->getClientOriginalExtension(),
            'file_path' => $path,
            'date' => $request->date ?: now()->toDateString(),
        ]);

        $doc->file_url = url('storage/' . $doc->file_path);

        return response()->json($doc, 201);
    }

    public function deleteDocument($id)
    {
        $doc = \App\Models\MedicalDocument::findOrFail($id);

        // Delete file from storage
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($doc->file_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($doc->file_path);
        }

        $doc->delete();
        return response()->json(['message' => 'Document supprimé']);
    }

    public function getNotifications($id)
    {
        $patient = Patient::findOrFail($id);
        $patientBlood = str_replace('−', '-', trim($patient->blood_type));

        // Compatibility Map: Donor -> Recipients (Who can they donate TO?)
        $compatibility = [
            'A+' => ['A+', 'AB+'],
            'A-' => ['A+', 'A-', 'AB+', 'AB-'],
            'B+' => ['B+', 'AB+'],
            'B-' => ['B+', 'B-', 'AB+', 'AB-'],
            'AB+' => ['AB+'],
            'AB-' => ['AB+', 'AB-'],
            'O+' => ['O+', 'A+', 'B+', 'AB+'],
            'O-' => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        ];

        $compatibleGroups = $compatibility[$patientBlood] ?? [$patientBlood];

        // Add versions with the other minus sign just in case
        $altCompatibleGroups = array_map(fn($g) => str_replace('-', '−', $g), $compatibleGroups);
        $allCompatibleGroups = array_unique(array_merge($compatibleGroups, $altCompatibleGroups, ['Tous groupes']));

        // Fetch personal notifications
        $personal = \App\Models\PatientNotification::where('patient_id', $id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'time' => $n->created_at->diffForHumans(),
                'urgent' => $n->type === 'urgent',
                'is_read' => $n->is_read
            ]);

        // Fetch public urgent alerts that this patient can donate to
        $alerts = Alert::where('status', 'active')
            ->whereIn('blood_type', $allCompatibleGroups)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'id' => 'alert_' . $a->id,
                'alert_id' => $a->id,
                'title' => "Urgence : Besoin de donneur {$a->blood_type} à {$a->city}",
                'time' => $a->created_at->diffForHumans(),
                'urgent' => true,
                'is_read' => false
            ]);

        $allNotifications = collect($alerts)->merge($personal)->sortByDesc('time')->values()->all();

        return response()->json($allNotifications);
    }

    public function sendNotification(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'nullable|string',
            'type' => 'nullable|string|in:urgent,normal'
        ]);

        $notification = \App\Models\PatientNotification::create([
            'patient_id' => $id,
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type ?? 'normal',
            'is_read' => false
        ]);

        return response()->json(['status' => 'success', 'notification' => $notification]);
    }

    public function respondToAlert(Request $request)
    {
        $request->validate([
            'alert_id' => 'required|integer',
            'patient_id' => 'required|integer',
            'status' => 'required|string|in:available,unavailable'
        ]);

        $response = \App\Models\AlertResponse::updateOrCreate(
            ['alert_id' => $request->alert_id, 'patient_id' => $request->patient_id],
            ['status' => $request->status]
        );

        // Envoyer l'email si le patient est disponible
        if ($request->status === 'available') {
            $patient = Patient::find($request->patient_id);
            $alert = Alert::with('hospital')->find($request->alert_id);

            if ($patient && $alert) {
                $hospitalName = $alert->hospital ? $alert->hospital->name : 'CHU Casablanca';
                $hospitalCity = $alert->hospital ? $alert->hospital->city : ($alert->city ?? 'Casablanca');

                try {
                    $data = [
                        'patient' => $patient,
                        'hospitalName' => $hospitalName,
                        'hospitalCity' => $hospitalCity
                    ];

                    Mail::send('emails.appointment', $data, function ($message) use ($patient) {
                        $message->to($patient->email)
                            ->subject('Confirmation de rendez-vous - Don de Sang urgent');
                    });
                } catch (\Exception $e) {
                    \Log::error("Erreur d'envoi d'email de confirmation: " . $e->getMessage());
                }
            }
        }

        return response()->json(['status' => 'success', 'response' => $response]);
    }

    public function getAlertResponses($id)
    {
        $responses = \App\Models\AlertResponse::where('alert_id', $id)
            ->with('patient')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'patient_name' => $r->patient->full_name,
                'blood_type' => $r->patient->blood_type,
                'phone' => $r->patient->phone,
                'status' => $r->status,
                'time' => $r->created_at->diffForHumans()
            ]);

        return response()->json($responses);
    }

    private function patientRules($id = null)
    {
        return [
            'full_name' => ($id ? 'sometimes|' : '') . 'required|string|max:255',
            'email' => ($id ? 'sometimes|' : '') . 'required|email|unique:patients,email' . ($id ? ',' . $id : ''),
            'blood_type' => ($id ? 'sometimes|' : '') . 'required|string|max:10',
            'admission_date' => ($id ? 'sometimes|' : '') . 'required|date',
            'hospital_id' => ($id ? 'nullable|' : 'required|') . 'exists:hospitals,id',
            'cin' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'height' => 'nullable|string|max:10',
            'weight' => 'nullable|string|max:10',
            'chronic_diseases' => 'nullable|array',
            'allergies' => 'nullable|string',
            'current_treatments' => 'nullable|string',
            'medical_history' => 'nullable|string',
        ];
    }

    private function alertRules($id = null)
    {
        return [
            'hospital_id' => ($id ? 'nullable|' : 'required|') . 'exists:hospitals,id',
            'blood_type' => ($id ? 'sometimes|' : '') . 'required|string',
            'urgency_level' => ($id ? 'sometimes|' : '') . 'required|string',
            'city' => 'nullable|string',
            'quantity' => 'nullable|string',
            'description' => 'nullable|string',
            'direct_phone' => 'nullable|string',
            'status' => 'nullable|string',
            'radius' => 'nullable|numeric'
        ];
    }

    private function donorRules($id = null)
    {
        return [
            'full_name' => ($id ? 'sometimes|' : '') . 'required|string|max:255',
            'email' => ($id ? 'sometimes|' : '') . 'nullable|email|unique:blood_donors,email' . ($id ? ',' . $id : ''),
            'blood_type' => ($id ? 'sometimes|' : '') . 'required|string|max:10',
            'phone' => ($id ? 'sometimes|' : '') . 'required|string|max:50',
            'city' => ($id ? 'sometimes|' : '') . 'required|string|max:255',
            'last_donation_date' => 'nullable|date',
        ];
    }
    //fonction pour trouver les hopitaux proches en fonction de la localisation du patient
    public function getNearbyHospitals(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius' => 'nullable|numeric'
        ]);

        $lat = (float) $request->latitude;
        $lng = (float) $request->longitude;
        $radius = $request->radius ? (float) $request->radius : 100.0;

        $hospitals = Hospital::select('*')
            ->selectRaw('(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance', [$lat, $lng, $lat])
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->get();

        return response()->json($hospitals);
    }
}
