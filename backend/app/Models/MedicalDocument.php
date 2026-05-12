<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalDocument extends Model
{
    protected $fillable = [
        'patient_id', 'name', 'type', 'category', 'file_path', 'date'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
