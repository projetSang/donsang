<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Hospital;
use App\Models\BloodDonor;
use App\Models\DonorNotification;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        \Log::info('Appointment creation attempt', ['request' => $request->all()]);
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'blood_donor_id' => 'required|integer|exists:blood_donors,id',
            'hospital_id' => 'required|exists:hospitals,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string'
        ], [
            'blood_donor_id.required' => 'L\'identifiant du donneur est requis.',
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

        // Optional: Check if donor already has a pending/confirmed appointment on the same date/time
        $existing = Appointment::where('blood_donor_id', $validated['blood_donor_id'])
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
            'blood_donor_id' => $validated['blood_donor_id'],
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

    public function getDonorAppointments(Request $request, $donorId)
    {
        $appointments = Appointment::with('hospital')
            ->where('blood_donor_id', $donorId)
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
        $appointments = Appointment::with('bloodDonor')
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

        $donor = $appointment->bloodDonor;
        $hospital = $appointment->hospital;

        // Send email confirmation to the donor if status is Confirmé
        if ($validated['status'] === 'Confirmé') {
            if ($donor && $hospital && !empty($donor->email)) {
                try {
                    $emailData = [
                        'donor' => $donor,
                        'hospitalName' => $hospital->name,
                        'hospitalCity' => $hospital->city,
                    ];
                    \Illuminate\Support\Facades\Mail::send('emails.appointment', $emailData, function ($message) use ($donor) {
                        $message->to($donor->email)
                            ->subject('Confirmation de votre rendez-vous - Don de Sang 🩸');
                    });
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Erreur d'envoi d'email de rendez-vous: " . $e->getMessage());
                }
            }
        }

        // Create a private notification in the system
        if ($donor && $hospital) {
            try {
                $status = $validated['status'];
                $dateFormatted = date('d/m/Y', strtotime($appointment->appointment_date));
                $timeFormatted = $appointment->appointment_time;

                $title = "Le statut de votre rdv est modifié";
                $message = "Le statut de votre rendez-vous à l'hôpital {$hospital->name} prévu le {$dateFormatted} à {$timeFormatted} a été mis à jour : {$status}.";

                if ($status === 'Confirmé') {
                    $title = "Rendez-vous confirmé";
                    $message = "Votre rendez-vous pour le don de sang à l'hôpital {$hospital->name} le {$dateFormatted} à {$timeFormatted} a été confirmé.";
                } elseif ($status === 'Annulé') {
                    $title = "Rendez-vous annulé";
                    $message = "Votre rendez-vous pour le don de sang à l'hôpital {$hospital->name} le {$dateFormatted} à {$timeFormatted} a été annulé.";
                } elseif ($status === 'Terminé') {
                    $title = "Merci pour votre don";
                    $message = "Votre rendez-vous du {$dateFormatted} à {$timeFormatted} à l'hôpital {$hospital->name} est terminé. Merci pour votre don de sang !";
                }

                DonorNotification::create([
                    'blood_donor_id' => $donor->id,
                    'title' => $title,
                    'message' => $message,
                    'type' => 'normal',
                    'is_read' => false
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Erreur de création de la notification de rendez-vous: " . $e->getMessage());
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
    public function getReservedSlots(Request $request, $hospitalId)
    {
        $date = $request->query('date');
        
        if (!$date) {
            return response()->json([
                'status' => 'error',
                'message' => 'Date is required.'
            ], 400);
        }

        $reservedSlots = Appointment::where('hospital_id', $hospitalId)
            ->where('appointment_date', $date)
            ->whereIn('status', ['En attente', 'Confirmé'])
            ->pluck('appointment_time');

        return response()->json([
            'status' => 'success',
            'reserved_slots' => $reservedSlots
        ]);
    }
}
