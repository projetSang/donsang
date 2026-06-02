<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalDocument extends Model
{
    protected $fillable = [
        'blood_donor_id', 'name', 'type', 'category', 'file_path', 'date'
    ];

    public function bloodDonor()
    {
        return $this->belongsTo(BloodDonor::class);
    }
}
