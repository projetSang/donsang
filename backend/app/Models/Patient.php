<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'hospital_id', 'full_name', 'email', 'password', 'cin', 'birth_date', 'phone', 'address',
        'height', 'weight', 'chronic_diseases', 'blood_type', 'status', 'admission_date'
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
