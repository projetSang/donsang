<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlertResponse extends Model
{
    protected $fillable = ['alert_id', 'patient_id', 'status'];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
