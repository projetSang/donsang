<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;
use App\Models\Patient;
use App\Models\Alert;
use App\Models\Hospital;

try {
    // Récupérer un patient avec email
    $patient = Patient::whereNotNull('email')->first();
    if (!$patient) {
        echo "ERROR: Aucun patient trouvé avec un email.\n";
        exit;
    }

    // Récupérer un hôpital
    $hospital = Hospital::first();
    if (!$hospital) {
        echo "ERROR: Aucun hôpital trouvé.\n";
        exit;
    }

    // Récupérer ou créer une alerte de test
    $alert = Alert::latest()->first();
    if (!$alert) {
        // Créer une alerte fictive
        $alert = new Alert();
        $alert->blood_type = 'O-';
        $alert->urgency_level = 'Critique';
        $alert->quantity = '3 poches';
        $alert->description = 'Besoin urgent pour intervention chirurgicale';
        $alert->direct_phone = '0661234567';
        $alert->hospital_id = $hospital->id;
        $alert->city = $hospital->city;
    }

    echo "=== Test Email Alerte Urgente ===\n";
    echo "Patient: {$patient->full_name} ({$patient->email})\n";
    echo "Hôpital: {$hospital->name} ({$hospital->city})\n";
    echo "Groupe sanguin: {$alert->blood_type}\n";
    echo "Urgence: {$alert->urgency_level}\n";
    echo "================================\n\n";

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

    echo "SUCCESS! Email envoyé à {$patient->email}\n";
    echo "Lien dans l'email: " . config('app.frontend_url', 'http://localhost:8080') . "/UrgentAlerts\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
