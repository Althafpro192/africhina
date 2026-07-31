<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Supplier extends Model
{
    use HasUuids;

    protected $table = 'suppliers';
    public $timestamps = false; // database handles created_at default timestamp

    protected $fillable = [
        'user_id',
        'company_name',
        'category',
        'contact_person',
        'phone_china',
        'email',
        'factory_address',
        'certificates',
        'verification_level',
        'avg_rating',
        'notes',
        'is_blocked',
    ];

    protected $casts = [
        'is_blocked' => 'boolean',
        'avg_rating' => 'float',
    ];

    public function requests()
    {
        return $this->hasMany(Request::class, 'assigned_supplier_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'supplier_id');
    }
}
