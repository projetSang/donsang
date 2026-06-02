<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonorNotification extends Model
{
    protected $fillable = ['blood_donor_id', 'title', 'message', 'type', 'is_read'];

    public function bloodDonor()
    {
        return $this->belongsTo(BloodDonor::class);
    }
}
