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
Route::put('/hospital/patients/{id}', [DashboardController::class, 'updatePatient']);
Route::delete('/hospital/patients/{id}', [DashboardController::class, 'deletePatient']);
Route::get('/hospital/search-donors', [DashboardController::class, 'searchDonors']);
Route::put('/hospital/donors/{id}', [DashboardController::class, 'updateDonor']);
Route::get('/hospital/statistiques', [DashboardController::class, 'getStatistiques']);
Route::get('/hospital/alerts', [DashboardController::class, 'getAlerts']);
