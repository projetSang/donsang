<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/hospital/stats', [DashboardController::class, 'getStats']);
Route::get('/hospital/patients', [DashboardController::class, 'getPatients']);
Route::post('/hospital/patients', [DashboardController::class, 'storePatient']);
Route::get('/hospital/search-donors', [DashboardController::class, 'searchDonors']);
Route::get('/hospital/alerts', [DashboardController::class, 'getAlerts']);
