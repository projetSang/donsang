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
    public function getStats(Request $request)
    {
        $hospitalId = $request->query('hospital_id');
        // nombre de donneurs dans la region
        $donorsCount = BloodDonor::count();
        // nombre de demandes d'alertes en cours
        $alertsQuery = Alert::where('status', '!=', 'Clôturée');
        if ($hospitalId) {
            $alertsQuery->where('hospital_id', $hospitalId);
        }
        $alertsCount = $alertsQuery->count();
        // nombre de réponses disponibles pour les alertes
        $establishedContacts = \App\Models\AlertResponse::where('status', 'available')->count();//les reponse disponible pour les alertes
        $patientsCount = 0;

        $currentYear = date('Y');

        // Optimisation : récupérer toutes les données en deux requêtes 
        $donationsByMonth = BloodDonor::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', $currentYear)
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $requestsQuery = Alert::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', $currentYear);
        if ($hospitalId) {
            $requestsQuery->where('hospital_id', $hospitalId);
        }
        $requestsByMonth = $requestsQuery->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        for ($m = 1; $m <= 12; $m++) {
            $donationsData[] = $donationsByMonth[$m] ?? 0;
            $requestsData[] = $requestsByMonth[$m] ?? 0;
        }

        $requestsMonthQuery = Alert::whereMonth('created_at', date('m'))->whereYear('created_at', $currentYear);
        if ($hospitalId) {
            $requestsMonthQuery->where('hospital_id', $hospitalId);
        }
        $requestsMonthCount = $requestsMonthQuery->count();

        return response()->json([
            'donors_region' => $donorsCount,
            'requests_month' => $requestsMonthCount,
            'established_contacts' => $establishedContacts,
            'critical_stocks' => "2/8",
            'alerts' => $alertsCount,
            'patients' => $patientsCount,
            'chart_data' => [
                'donations' => $donationsData,
                'requests' => $requestsData
            ]
        ]);
    }

    public function getPatients(Request $request)
    {
        $hospitalId = $request->query('hospital_id');
        if ($hospitalId) {
            return response()->json(Patient::where('hospital_id', $hospitalId)->get());
        }
        return response()->json(Patient::all());
    }

    public function storePatient(Request $request)
    {
        // Check if patient already exists by CIN or Email
        $existingPatient = null;
        if ($request->filled('cin')) {
            $existingPatient = Patient::where('cin', $request->cin)->first();
        }
        if (!$existingPatient && $request->filled('email')) {
            $existingPatient = Patient::where('email', $request->email)->first();
        }

        if ($existingPatient) {
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:patients,email,' . $existingPatient->id,
                'blood_type' => 'required|string|max:10',
                'admission_date' => 'required|date',
                'hospital_id' => 'required|exists:hospitals,id',
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
            ]);

            $existingPatient->update($validated);

            return response()->json([
                'patient' => $existingPatient,
                'temporary_password' => null
            ], 200);
        }

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
        $bloodType = $request->blood_type;
        $city = $request->city;
        $cin = trim((string) $request->cin);

        if ($bloodType) {
            $bloodType = str_replace(['−', '–'], '-', $bloodType);
        }

        // If CIN is provided, search directly by CIN (priority search)
        if ($cin !== '') {
            $normalizedCin = strtoupper($cin);
            $compactCin = str_replace(' ', '', $normalizedCin);

            $donor = BloodDonor::whereRaw('UPPER(TRIM(cin)) = ?', [$normalizedCin])->first();

            if (!$donor) {
                $donor = BloodDonor::whereRaw('REPLACE(UPPER(TRIM(cin)), " ", "") = ?', [
                    $compactCin
                ])->first();
            }

            if (!$donor) {
                $donor = BloodDonor::whereRaw('UPPER(TRIM(cin)) LIKE ?', ['%' . $normalizedCin . '%'])->first();
            }

            if (!$donor) {
                $donor = BloodDonor::whereRaw('REPLACE(UPPER(TRIM(cin)), " ", "") LIKE ?', [
                    '%' . $compactCin . '%'
                ])->first();
            }

            if ($donor) {
                $donor->is_patient = 0;
                return response()->json([$donor]);
            }

            return response()->json([]);
        }

        // Initialize blood donors query
        $donorsQuery = BloodDonor::select('*')->selectRaw('0 as is_patient');

        if ($bloodType) {
            $donorsQuery->where(function ($q) use ($bloodType) {
                $q->where('blood_type', $bloodType)
                  ->orWhere('blood_type', str_replace('-', '−', $bloodType));
            });
        }

        if ($city && $city != '') {
            $donorsQuery->where('city', 'LIKE', '%' . $city . '%');
        }

        $donors = $donorsQuery->get();

        foreach ($donors as $d) {
            $d->is_patient = 0;
        }

        return response()->json($donors);
    }

    public function updateDonor(Request $request, $id)
    {
        $donor = BloodDonor::findOrFail($id);
        $donor->update($request->only(['full_name', 'cin', 'email', 'phone', 'city', 'blood_type', 'last_donation_date', 'donations_count']));
        $donor->is_patient = 0;
        return response()->json($donor);
    }

    public function storeDonor(Request $request)
    {
        $existingDonor = null;
        if ($request->filled('email')) {
            $existingDonor = BloodDonor::where('email', $request->email)->first();
        }

        if ($existingDonor) {
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:blood_donors,email,' . $existingDonor->id,
                'blood_type' => 'required|string|max:10',
                'phone' => 'required|string|max:50',
                'city' => 'required|string|max:255',
                'last_donation_date' => 'nullable|date',
            ]);

            $existingDonor->update($validated);
            return response()->json($existingDonor, 200);
        }

        $validated = $request->validate($this->donorRules());

        $password = Str::random(10);
        $validated['password'] = \Illuminate\Support\Facades\Hash::make($password);

        $donor = BloodDonor::create($validated);

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

    public function getAlerts(Request $request)
    {
        $hospitalId = $request->query('hospital_id');
        if ($hospitalId) {
            return response()->json(Alert::with('hospital')->where('hospital_id', $hospitalId)->get());
        }
        return response()->json(Alert::with('hospital')->get());
    }

    public function storeAlert(Request $request)
    {
        $validated = $request->validate($this->alertRules());
        $alert = Alert::create($validated);

        // Notify matching donors
        $this->notifyNearbyPatients($alert);

        return response()->json($alert->load('hospital'), 201);
    }

    private function notifyNearbyPatients($alert)
    {
        $hospital = Hospital::find($alert->hospital_id);
        if (!$hospital)
            return;

        $nearbyDonorsQuery = BloodDonor::query();

        if ($hospital->latitude && $hospital->longitude) {
            $nearbyDonorsQuery->select('*')
                ->selectRaw('(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance', [$hospital->latitude, $hospital->longitude, $hospital->latitude])
                ->orderBy('distance');
        }

        if ($hospital->city) {
            $nearbyDonorsQuery->where('city', 'LIKE', '%' . $hospital->city . '%');
        }

        if ($alert->blood_type !== 'Tous groupes') {
            if (str_contains($alert->blood_type, ',')) {
                $rawGroups = array_map('trim', explode(',', $alert->blood_type));
                $groups = [];
                foreach ($rawGroups as $g) {
                    $groups[] = $g;
                    $groups[] = str_replace('−', '-', $g);
                    $groups[] = str_replace('-', '−', $g);
                }
                $nearbyDonorsQuery->whereIn('blood_type', $groups);
            } else {
                $nearbyDonorsQuery->where(function ($q) use ($alert) {
                    $q->where('blood_type', $alert->blood_type)
                        ->orWhere('blood_type', str_replace('−', '-', $alert->blood_type))
                        ->orWhere('blood_type', str_replace('-', '−', $alert->blood_type));
                });
            }
        }

        $nearbyDonors = $nearbyDonorsQuery->get();

        foreach ($nearbyDonors as $donor) {
            if (empty($donor->email)) {
                continue;
            }
            // Send HTML Email
            try {
                $emailData = [
                    'patient' => $donor, // Keep name as patient to work with existing email templates
                    'alert' => $alert,
                    'hospital' => $hospital,
                    'appUrl' => 'http://localhost:8080',
                ];
                Mail::send('emails.alert', $emailData, function ($message) use ($donor) {
                    $message->to($donor->email)
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

    public function getHospitalSettings(Request $request)
    {
        $hospitalId = $request->query('hospital_id') ?: 1;
        $hospital = Hospital::findOrFail($hospitalId);
        return response()->json($hospital);
    }

    public function updateHospitalSettings(Request $request)
    {
        $hospitalId = $request->input('hospital_id') ?: 1;
        $hospital = Hospital::findOrFail($hospitalId);

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
            unset($validated['password']);
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
        $donor = BloodDonor::find($id);
        if (!$donor) {
            $donor = Patient::find($id);
        }

        if (!$donor) {
            return response()->json([]);
        }

        $donorBlood = str_replace('−', '-', trim($donor->blood_type));

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

        $compatibleGroups = $compatibility[$donorBlood] ?? [$donorBlood];

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

        // Fetch public urgent alerts that this donor can donate to (filtered by compatibility and city)
        $alertsQuery = Alert::whereIn('status', ['active', 'Active'])
            ->whereIn('blood_type', $allCompatibleGroups);

        $donorCity = trim((string) $donor->city);
        if (!empty($donorCity) && !str_contains($donorCity, '@') && strtolower($donorCity) !== 'city') {
            $alertsQuery->where(function($q) use ($donorCity) {
                $q->where('city', 'LIKE', '%' . $donorCity . '%')
                  ->orWhere('city', '')
                  ->orWhereNull('city');
            });
        }

        $alerts = $alertsQuery->orderBy('created_at', 'desc')
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
            'patient_id' => 'nullable|integer',
            'blood_donor_id' => 'nullable|integer',
            'status' => 'required|string|in:available,unavailable',
        ]);

        $donorId = $request->blood_donor_id ?? $request->patient_id;

        if (!$donorId) {
            return response()->json(['status' => 'error', 'message' => 'Identifiant du donneur requis'], 400);
        }

        $donor = BloodDonor::find($donorId);
        $isPatient = false;

        if (!$donor) {
            $donor = Patient::find($donorId);
            $isPatient = true;
        }

        if (!$donor) {
            return response()->json(['status' => 'error', 'message' => 'Donneur introuvable'], 404);
        }

        $matchCondition = ['alert_id' => $request->alert_id];
        if ($isPatient) {
            $matchCondition['patient_id'] = $donor->id;
        } else {
            $matchCondition['blood_donor_id'] = $donor->id;
        }

        $response = \App\Models\AlertResponse::updateOrCreate(
            $matchCondition,
            ['status' => $request->status]
        );

        // L'email a été retiré à la demande de l'utilisateur


        return response()->json(['status' => 'success', 'response' => $response]);
    }

    public function getAlertResponses($id)
    {
        $responses = \App\Models\AlertResponse::where('alert_id', $id)
            ->with('bloodDonor')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'patient_name' => $r->bloodDonor ? $r->bloodDonor->full_name : 'Donneur anonyme',
                    'blood_type' => $r->bloodDonor ? $r->bloodDonor->blood_type : 'Non spécifié',
                    'phone' => $r->bloodDonor ? $r->bloodDonor->phone : 'Non disponible',
                    'status' => $r->status,
                    'time' => $r->created_at->diffForHumans()
                ];
            });

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
            'status' => 'nullable|string'
        ];
    }

    private function donorRules($id = null)
    {
        return [
            'full_name' => ($id ? 'sometimes|' : '') . 'required|string|max:255',
            'cin' => 'nullable|string|max:20|unique:blood_donors,cin' . ($id ? ',' . $id : ''),
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
