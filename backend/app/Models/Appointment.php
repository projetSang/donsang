<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id',
        'hospital_id',
        'appointment_date',
        'appointment_time',
        'status',
        'notes'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function hospital()
    {
        return $this->belongsTo(Hospital::class, 'hospital_id');
    }
}
