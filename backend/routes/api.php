<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\AssistantController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/update-password', [AuthController::class, 'updatePassword']);
Route::post('/update-profile', [AuthController::class, 'updateProfile']);
Route::post('/generate-share-token', [AuthController::class, 'generateShareToken']);
Route::post('/disable-share-token', [AuthController::class, 'disableShareToken']);
Route::get('/shared-dossier/{token}', [AuthController::class, 'getSharedDossier']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/hospital/stats', [DashboardController::class, 'getStats']);
Route::get('/hospital/patients', [DashboardController::class, 'getPatients']);
Route::post('/hospital/patients', [DashboardController::class, 'storePatient']);
Route::put('/hospital/patients/{id}', [DashboardController::class, 'updatePatient']);
Route::delete('/hospital/patients/{id}', [DashboardController::class, 'deletePatient']);
Route::get('/hospital/search-donors', [DashboardController::class, 'searchDonors']);
Route::post('/hospital/donors', [DashboardController::class, 'storeDonor']);
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

Route::get('/patients/{id}/documents', [DashboardController::class, 'getDocuments']);
Route::post('/patients/{id}/documents', [DashboardController::class, 'uploadDocument']);
Route::delete('/documents/{id}', [DashboardController::class, 'deleteDocument']);
Route::get('/patients/{id}/notifications', [DashboardController::class, 'getNotifications']);
Route::post('/patients/{id}/notifications', [DashboardController::class, 'sendNotification']);
Route::post('/alerts/respond', [DashboardController::class, 'respondToAlert']);
Route::get('/hospital/alerts/{id}/responses', [DashboardController::class, 'getAlertResponses']);

Route::post('/assistant/chat', [AssistantController::class, 'chat']);
