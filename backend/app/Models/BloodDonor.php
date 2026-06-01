<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodDonor extends Model
{
    protected $fillable = ['full_name', 'cin', 'email', 'password', 'blood_type', 'city', 'phone', 'last_donation_date', 'donations_count', 'latitude', 'longitude'];
}
