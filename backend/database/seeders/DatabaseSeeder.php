<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Hospital;
use App\Models\BloodDonor;
use App\Models\Patient;
use App\Models\Alert;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $hospital = Hospital::create([
            'name' => 'CHU Casablanca',
            'city' => 'Casablanca',
            'email' => 'admin@chu.com',
            'password' => bcrypt('password'),
        ]);

        User::create([
            'name' => 'Super Admin',
            'email' => 'Donsang@donsang.ma',
            'password' => bcrypt('admin123'),
        ]);

        BloodDonor::create(['full_name' => 'Ahmed Ali', 'blood_type' => 'O+', 'city' => 'Casablanca', 'phone' => '0600000000']);
        BloodDonor::create(['full_name' => 'Sara Nouri', 'blood_type' => 'A-', 'city' => 'Rabat', 'phone' => '0611111111']);


        Alert::create([
            'hospital_id' => $hospital->id,
            'blood_type' => 'O-',
            'urgency_level' => 'Critique',
        ]);

        Patient::create([
            'hospital_id' => $hospital->id,
            'full_name' => 'Jean Dupont',
            'email' => 'patient@test.com',
            'password' => bcrypt('password'),
            'cin' => 'AB123456',
            'blood_type' => 'A+',
            'status' => 'Stable',
            'admission_date' => now(),
        ]);
    }
}
