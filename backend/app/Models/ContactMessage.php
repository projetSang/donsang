<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = ['type', 'name', 'email', 'phone', 'hospital_name', 'city', 'address', 'subject', 'message', 'status'];
}
