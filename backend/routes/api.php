<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactMessageController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/update-password', [AuthController::class, 'updatePassword']);
Route::post('/update-profile', [AuthController::class, 'updateProfile']);

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
Route::post('/hospital/alerts', [DashboardController::class, 'storeAlert']);
Route::put('/hospital/alerts/{id}', [DashboardController::class, 'updateAlert']);
Route::delete('/hospital/alerts/{id}', [DashboardController::class, 'deleteAlert']);
Route::get('/hospital/settings', [DashboardController::class, 'getHospitalSettings']);
Route::put('/hospital/settings', [DashboardController::class, 'updateHospitalSettings']);
Route::post('/contact-messages', [ContactMessageController::class, 'store']);
Route::get('/hospital/contact-messages', [ContactMessageController::class, 'index']);
