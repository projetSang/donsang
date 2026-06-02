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

$nearbyDonorsQuery = App\Models\BloodDonor::select('*')
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
        $nearbyDonorsQuery->whereIn('blood_type', $groups);
    } else {
        $nearbyDonorsQuery->where(function($q) use ($alert) {
            $q->where('blood_type', $alert->blood_type)
              ->orWhere('blood_type', str_replace('−', '-', $alert->blood_type))
              ->orWhere('blood_type', str_replace('-', '−', $alert->blood_type));
        });
    }
}

$nearbyDonors = $nearbyDonorsQuery->get();
echo 'Found donors: ' . $nearbyDonors->count() . "\n";
foreach ($nearbyDonors as $donor) {
    echo 'Donor: ' . $donor->full_name . ' (' . $donor->email . ')' . "\n";
}
