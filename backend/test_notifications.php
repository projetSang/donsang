<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$patients = \App\Models\Patient::all();
foreach ($patients as $p) {
    echo "ID: {$p->id}, Name: {$p->full_name}, Email: {$p->email}, Blood: {$p->blood_type}\n";
}
