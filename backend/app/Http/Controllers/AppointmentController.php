<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Hospital;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'hospital_id' => 'required|exists:hospitals,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        // Optional: Check if patient already has a pending/confirmed appointment on the same date/time
        $existing = Appointment::where('patient_id', $validated['patient_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->whereIn('status', ['En attente', 'Confirmé'])
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous avez déjà un rendez-vous planifié pour cette journée.'
            ], 422);
        }

        $appointment = Appointment::create([
            'patient_id' => $validated['patient_id'],
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

    public function getPatientAppointments($patientId)
    {
        $appointments = Appointment::with('hospital')
            ->where('patient_id', $patientId)
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
