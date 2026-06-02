<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hospital extends Model
{
    protected $fillable = ['name', 'city', 'email', 'password', 'address', 'phone', 'latitude', 'longitude'];

    protected $casts = [
        'password' => 'hashed',
    ];
    
    public function alerts() {
        return $this->hasMany(Alert::class);
    }
}
