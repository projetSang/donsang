<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$donors = \App\Models\BloodDonor::all();
foreach ($donors as $d) {
    echo "ID: {$d->id}, Name: {$d->full_name}, Email: {$d->email}, Blood: {$d->blood_type}\n";
}
