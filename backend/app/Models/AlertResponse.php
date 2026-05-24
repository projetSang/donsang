<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlertResponse extends Model
{
    protected $fillable = ['alert_id', 'blood_donor_id', 'status'];

    public function bloodDonor()
    {
        return $this->belongsTo(BloodDonor::class);
    }
}
