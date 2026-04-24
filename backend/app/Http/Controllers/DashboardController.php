<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\BloodDonor;
use App\Models\Alert;

class DashboardController extends Controller
{
    public function getStats()
    {
        $donorsCount = BloodDonor::count();
        $alertsCount = Alert::count();
        $patientsCount = Patient::count();
        
        return response()->json([
            'donors_region' => $donorsCount,
            'requests_month' => 38, // mock for now
            'established_contacts' => 156, // mock
            'critical_stocks' => "2/8", // mock
            'alerts' => $alertsCount,
            'patients' => $patientsCount
        ]);
    }

    public function getPatients()
    {
        return response()->json(Patient::all());
    }

    public function storePatient(Request $request)
    {
        $validated = $request->validate([
            'hospital_id' => 'required|exists:hospitals,id',
            'full_name' => 'required|string|max:255',
            'cin' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'height' => 'nullable|string|max:10',
            'weight' => 'nullable|string|max:10',
            'chronic_diseases' => 'nullable|array',
            'blood_type' => 'required|string|max:10',
            'admission_date' => 'required|date'
        ]);

        $patient = Patient::create($validated);
        return response()->json($patient, 201);
    }

    public function searchDonors(Request $request)
    {
        $query = BloodDonor::query();

        if ($request->has('blood_type')) {
            $query->where('blood_type', $request->blood_type);
        }

        if ($request->has('city')) {
            $query->where('city', $request->city);
        }

        return response()->json($query->get());
    }

    public function getAlerts()
    {
        return response()->json(Alert::with('hospital')->get());
    }
}
