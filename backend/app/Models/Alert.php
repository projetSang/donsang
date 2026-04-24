<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $fillable = ['hospital_id', 'blood_type', 'urgency_level', 'status'];

    public function hospital() {
        return $this->belongsTo(Hospital::class);
    }
}
