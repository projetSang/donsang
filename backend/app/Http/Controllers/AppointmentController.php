<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Hospital;
use App\Models\Patient;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        \Log::info('Appointment creation attempt', ['request' => $request->all()]);
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'patient_id' => 'required|integer',
            'hospital_id' => 'required|exists:hospitals,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string'
        ], [
            'patient_id.required' => 'L\'identifiant du patient est requis.',
            'hospital_id.required' => 'L\'identifiant de l\'hôpital est requis.',
            'hospital_id.exists' => 'L\'hôpital spécifié n\'existe pas.',
            'appointment_date.required' => 'La date du rendez-vous est requise.',
            'appointment_date.date' => 'Le format de la date est incorrect.',
            'appointment_time.required' => 'L\'heure du rendez-vous est requise.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Resolve the actual patient_id - auto-detect from patients or blood_donors table
        $resolvedPatientId = $validated['patient_id'];

        // First, check if the ID exists in the patients table
        $patient = Patient::find($validated['patient_id']);
        
        if (!$patient) {
            // ID not found in patients, try blood_donors table
            $donor = \App\Models\BloodDonor::find($validated['patient_id']);
            if (!$donor) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'L\'utilisateur spécifié n\'existe pas.'
                ], 422);
            }

            // Found in blood_donors - look for or create a matching patient record
            $patient = Patient::where('email', $donor->email)->first();
            if (!$patient) {
                // Create a patient record from the blood donor data
                $patient = new Patient();
                $patient->full_name = $donor->full_name;
                $patient->email = $donor->email;
                $patient->phone = $donor->phone;
                $patient->blood_type = $donor->blood_type;
                $patient->address = $donor->city;
                $patient->donations_count = $donor->donations_count ?? 0;
                $patient->last_donation_date = $donor->last_donation_date;
                $patient->admission_date = now()->toDateString();
                $patient->status = 'active';
                // Set password raw to avoid double-hashing (it's already hashed from BloodDonor)
                $patient->setRawAttributes(array_merge($patient->getAttributes(), ['password' => $donor->getRawOriginal('password')]));
                $patient->save();
            }
            $resolvedPatientId = $patient->id;
        }

        // Optional: Check if patient already has a pending/confirmed appointment on the same date/time
        $existing = Appointment::where('patient_id', $resolvedPatientId)
            ->where('appointment_date', $validated['appointment_date'])
            ->whereIn('status', ['En attente', 'Confirmé'])
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous avez déjà un rendez-vous planifié pour cette journée.'
            ], 422);
        }

        // Check if the time slot is already taken for this hospital
        $slotTaken = Appointment::where('hospital_id', $validated['hospital_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->whereIn('status', ['En attente', 'Confirmé'])
            ->first();

        if ($slotTaken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ce créneau horaire est déjà réservé. Veuillez en choisir un autre.'
            ], 422);
        }

        $appointment = Appointment::create([
            'patient_id' => $resolvedPatientId,
            'hospital_id' => $validated['hospital_id'],
            'appointment_date' => $validated['appointment_date'],
            'appointment_time' => $validated['appointment_time'],
            'status' => 'En attente',
            'notes' => $validated['notes'] ?? null
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Votre rendez-vous a été enregistré avec succès !',
            'appointment' => $appointment
        ], 201);
    }

    public function getPatientAppointments(Request $request, $patientId)
    {
        $resolvedPatientId = $patientId;

        // Auto-detect: if ID doesn't exist in patients, check blood_donors
        $patient = Patient::find($patientId);
        if (!$patient) {
            $donor = \App\Models\BloodDonor::find($patientId);
            if ($donor) {
                $matchedPatient = Patient::where('email', $donor->email)->first();
                if ($matchedPatient) {
                    $resolvedPatientId = $matchedPatient->id;
                }
            }
        }

        $appointments = Appointment::with('hospital')
            ->where('patient_id', $resolvedPatientId)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'appointments' => $appointments
        ]);
    }

    public function getHospitalAppointments($hospitalId)
    {
        $appointments = Appointment::with('patient')
            ->where('hospital_id', $hospitalId)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'appointments' => $appointments
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:En attente,Confirmé,Annulé,Terminé',
            'notes' => 'nullable|string'
        ]);

        $appointment->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $appointment->notes
        ]);

        // Send email confirmation to the patient if status is Confirmé
        if ($validated['status'] === 'Confirmé') {
            $patient = $appointment->patient;
            $hospital = $appointment->hospital;

            if ($patient && $hospital && !empty($patient->email)) {
                try {
                    $emailData = [
                        'patient' => $patient,
                        'hospitalName' => $hospital->name,
                        'hospitalCity' => $hospital->city,
                    ];
                    \Illuminate\Support\Facades\Mail::send('emails.appointment', $emailData, function ($message) use ($patient) {
                        $message->to($patient->email)
                            ->subject('Confirmation de votre rendez-vous - Don de Sang 🩸');
                    });
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Erreur d'envoi d'email de rendez-vous: " . $e->getMessage());
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Le statut du rendez-vous a été mis à jour avec succès.',
            'appointment' => $appointment
        ]);
    }

    public function hospitalsList()
    {
        // Return active hospitals with name, city, address
        $hospitals = Hospital::select('id', 'name', 'city', 'address', 'phone')->get();

        return response()->json([
            'status' => 'success',
            'hospitals' => $hospitals
        ]);
    }
}
