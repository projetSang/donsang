<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientNotification extends Model
{
    protected $fillable = ['patient_id', 'title', 'message', 'type', 'is_read'];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
