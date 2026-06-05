<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\BloodDonor;
use App\Models\Hospital;
use App\Models\Alert;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DonorWorkflowTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();

        // Clean tables
        BloodDonor::query()->delete();
        Hospital::query()->delete();
        Alert::query()->delete();
    }

    public function test_donor_can_login_with_correct_credentials()
    {
        $donor = BloodDonor::create([
            'full_name' => 'Ahmed Test',
            'email' => 'ahmed.test@example.com',
            'password' => Hash::make('secret123'),
            'blood_type' => 'O+',
            'city' => 'Casablanca',
            'phone' => '0600000000',
            'donations_count' => 3
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'ahmed.test@example.com',
            'password' => 'secret123'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'user_type' => 'donor',
                'user' => [
                    'email' => 'ahmed.test@example.com',
                    'full_name' => 'Ahmed Test'
                ]
            ]);

        $this->assertNotNull($response->json('token'));
    }

    public function test_donor_login_fails_with_incorrect_credentials()
    {
        $donor = BloodDonor::create([
            'full_name' => 'Sara Test',
            'email' => 'sara.test@example.com',
            'password' => Hash::make('secret123'),
            'blood_type' => 'A-',
            'city' => 'Rabat',
            'phone' => '0611111111'
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'sara.test@example.com',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Identifiants invalides'
            ]);
    }

    public function test_donor_notifications_filtered_by_compatibility_and_city()
    {
        $hospital = Hospital::create([
            'name' => 'Hopital Casablanca',
            'city' => 'Casablanca',
            'email' => 'hopital@casa.com',
            'password' => Hash::make('password')
        ]);

        // Ahmed Ali is O+, Casablanca
        $donorAhmed = BloodDonor::create([
            'full_name' => 'Ahmed Ali',
            'email' => 'ahmed@test.com',
            'password' => Hash::make('password'),
            'blood_type' => 'O+',
            'city' => 'Casablanca',
            'phone' => '0600000000',
            'donations_count' => 5
        ]);

        // Sara Nouri is A-, Rabat
        $donorSara = BloodDonor::create([
            'full_name' => 'Sara Nouri',
            'email' => 'sara@test.com',
            'password' => Hash::make('password'),
            'blood_type' => 'A-',
            'city' => 'Rabat',
            'phone' => '0611111111',
            'donations_count' => 12
        ]);

        // Alert 1: A+ needed in Casablanca (Compatible with Ahmed O+, matches Casablanca) -> Ahmed should see it, Sara shouldn't (different city)
        $alert1 = Alert::create([
            'hospital_id' => $hospital->id,
            'blood_type' => 'A+',
            'urgency_level' => 'Critique',
            'city' => 'Casablanca',
            'status' => 'active'
        ]);

        // Alert 2: O- needed in Casablanca (Ahmed O+ is not compatible with O- recipient) -> Ahmed shouldn't see it
        $alert2 = Alert::create([
            'hospital_id' => $hospital->id,
            'blood_type' => 'O-',
            'urgency_level' => 'Critique',
            'city' => 'Casablanca',
            'status' => 'active'
        ]);

        // Alert 3: AB+ needed in Rabat (Compatible with Sara A-, matches Rabat) -> Sara should see it, Ahmed shouldn't (different city)
        $alert3 = Alert::create([
            'hospital_id' => $hospital->id,
            'blood_type' => 'AB+',
            'urgency_level' => 'Moyenne',
            'city' => 'Rabat',
            'status' => 'active'
        ]);

        // Fetch notifications for Ahmed
        $responseAhmed = $this->getJson("/api/donors/{$donorAhmed->id}/notifications");
        $responseAhmed->assertStatus(200);
        $notificationsAhmed = $responseAhmed->json();

        // Ahmed should see Alert 1 (need A+ in Casablanca) but not Alert 2 (need O-) or Alert 3 (in Rabat)
        $alertIdsAhmed = collect($notificationsAhmed)->pluck('alert_id')->filter()->all();
        $this->assertContains($alert1->id, $alertIdsAhmed);
        $this->assertNotContains($alert2->id, $alertIdsAhmed);
        $this->assertNotContains($alert3->id, $alertIdsAhmed);

        // Fetch notifications for Sara
        $responseSara = $this->getJson("/api/donors/{$donorSara->id}/notifications");
        $responseSara->assertStatus(200);
        $notificationsSara = $responseSara->json();

        // Sara should see Alert 3 (need AB+ in Rabat) but not Alert 1 (in Casablanca)
        $alertIdsSara = collect($notificationsSara)->pluck('alert_id')->filter()->all();
        $this->assertContains($alert3->id, $alertIdsSara);
        $this->assertNotContains($alert1->id, $alertIdsSara);
    }

    public function test_donor_profile_and_password_update()
    {
        $donor = BloodDonor::create([
            'full_name' => 'Original Name',
            'email' => 'update@test.com',
            'password' => Hash::make('oldpassword'),
            'blood_type' => 'B+',
            'city' => 'Fes',
            'phone' => '0622222222'
        ]);

        // Test profile update (sending user_type => donor fallback)
        $responseProfile = $this->postJson('/api/update-profile', [
            'email' => 'update@test.com',
            'user_type' => 'donor',
            'full_name' => 'Updated Name',
            'phone' => '0633333333',
            'address' => 'Marrakech',
            'blood_type' => 'B+'
        ]);

        $responseProfile->assertStatus(200);
        $this->assertDatabaseHas('blood_donors', [
            'email' => 'update@test.com',
            'full_name' => 'Updated Name',
            'phone' => '0633333333',
            'city' => 'Marrakech'
        ]);

        // Test password update (sending user_type => donor fallback)
        $responsePassword = $this->postJson('/api/update-password', [
            'email' => 'update@test.com',
            'user_type' => 'donor',
            'current_password' => 'oldpassword',
            'new_password' => 'newsecretpassword'
        ]);

        $responsePassword->assertStatus(200);

        // Verify login works with the new password
        $responseLogin = $this->postJson('/api/login', [
            'email' => 'update@test.com',
            'password' => 'newsecretpassword'
        ]);
        $responseLogin->assertStatus(200);
    }

    public function test_appointment_status_update_creates_notification()
    {
        $hospital = Hospital::create([
            'name' => 'Hopital Casablanca',
            'city' => 'Casablanca',
            'email' => 'hopital@casa.com',
            'password' => Hash::make('password')
        ]);

        $donor = BloodDonor::create([
            'full_name' => 'Ahmed Test Notification',
            'email' => 'notification@test.com',
            'password' => Hash::make('password'),
            'blood_type' => 'O+',
            'city' => 'Casablanca',
            'phone' => '0600000000',
            'donations_count' => 0
        ]);

        $appointment = \App\Models\Appointment::create([
            'blood_donor_id' => $donor->id,
            'hospital_id' => $hospital->id,
            'appointment_date' => '2026-06-06',
            'appointment_time' => '10:00',
            'status' => 'En attente'
        ]);

        $response = $this->putJson("/api/appointments/{$appointment->id}/status", [
            'status' => 'Confirmé',
            'notes' => 'Tout est OK'
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('donor_notifications', [
            'blood_donor_id' => $donor->id,
            'title' => 'Rendez-vous confirmé'
        ]);
    }
}
