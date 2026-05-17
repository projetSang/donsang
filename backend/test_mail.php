<?php 
require 'vendor/autoload.php'; 
$app = require_once 'bootstrap/app.php'; 
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); 
try { 
    \Illuminate\Support\Facades\Mail::raw('Test', function($m) { 
        $m->to('elfalahhassania@gmail.com')->subject('Test'); 
    }); 
    echo 'SUCCESS'; 
} catch(\Exception $e) { 
    echo 'ERROR: ' . $e->getMessage(); 
}
