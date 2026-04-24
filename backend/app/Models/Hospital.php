<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hospital extends Model
{
    protected $fillable = ['name', 'city', 'email', 'password'];
    
    public function patients() {
        return $this->hasMany(Patient::class);
    }
    
    public function alerts() {
        return $this->hasMany(Alert::class);
    }
}
