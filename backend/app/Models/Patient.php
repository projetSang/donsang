<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'hospital_id', 'full_name', 'cin', 'birth_date', 'phone', 'address',
        'height', 'weight', 'chronic_diseases', 'blood_type', 'status', 'admission_date'
    ];

    protected $casts = [
        'chronic_diseases' => 'array',
    ];
    
    public function hospital() {
        return $this->belongsTo(Hospital::class);
    }
}
