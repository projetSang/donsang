<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'hospital_id', 'full_name', 'email', 'password', 'cin', 'birth_date', 'phone', 'address',
        'height', 'weight', 'chronic_diseases', 'blood_type', 'status', 'admission_date',
        'allergies', 'current_treatments', 'medical_history', 'share_token', 'share_token_expires_at',
        'emergency_contact_name', 'emergency_contact_relation', 'emergency_contact_phone',
        'latitude', 'longitude', 'donations_count', 'last_donation_date'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'chronic_diseases' => 'array',
        'password' => 'hashed',
    ];

    protected $appends = ['is_king'];
    
    public function getIsKingAttribute()
    {
        $maxPatient = \App\Models\Patient::max('donations_count') ?? 0;
        $maxDonor = \App\Models\BloodDonor::max('donations_count') ?? 0;
        $max = max($maxPatient, $maxDonor);
        return $this->donations_count >= $max && $max > 0;
    }
    
    public function hospital() {
        return $this->belongsTo(Hospital::class);
    }
}
