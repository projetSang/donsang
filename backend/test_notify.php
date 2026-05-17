<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Simulate the logic in DashboardController
$hospital = App\Models\Hospital::find(1);
$alert = new App\Models\Alert();
$alert->hospital_id = 1;
$alert->blood_type = 'Tous groupes'; // Test with Tous groupes
$radius = 20;

$nearbyPatientsQuery = App\Models\Patient::select('*')
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
        $nearbyPatientsQuery->where(function($q) use ($alert) {
            $q->where('blood_type', $alert->blood_type)
              ->orWhere('blood_type', str_replace('−', '-', $alert->blood_type))
              ->orWhere('blood_type', str_replace('-', '−', $alert->blood_type));
        });
    }
}

$nearbyPatients = $nearbyPatientsQuery->get();
echo 'Found patients: ' . $nearbyPatients->count() . "\n";
foreach ($nearbyPatients as $patient) {
    echo 'Patient: ' . $patient->full_name . ' (' . $patient->email . ')' . "\n";
}
