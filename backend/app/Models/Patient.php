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
        'latitude', 'longitude'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'chronic_diseases' => 'array',
        'password' => 'hashed',
    ];
    
    public function hospital() {
        return $this->belongsTo(Hospital::class);
    }
}
