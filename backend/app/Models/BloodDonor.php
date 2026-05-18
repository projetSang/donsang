<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodDonor extends Model
{
    protected $fillable = ['full_name', 'email', 'blood_type', 'city', 'phone', 'last_donation_date', 'donations_count'];
}
