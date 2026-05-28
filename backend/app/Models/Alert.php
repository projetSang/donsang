<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $fillable = ['hospital_id', 'city', 'blood_type', 'urgency_level', 'status', 'quantity', 'description', 'direct_phone'];
    public function hospital() {
        return $this->belongsTo(Hospital::class);
    }
}
