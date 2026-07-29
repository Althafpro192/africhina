<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $table = 'users';
    
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'full_name',
        'email',
        'password_hash',
        'country',
        'phone',
        'company_name',
        'role',
        'avatar_url',
        'avatar_data',
        'avatar_mime_type',
        'country_code',
        'temp_password_hash',
        'temp_password_expires_at',
        'is_blocked',
    ];

    protected $hidden = [
        'password_hash',
        'temp_password_hash',
    ];

    protected $casts = [
        'temp_password_expires_at' => 'datetime',
        'is_blocked' => 'boolean',
    ];

    /**
     * Override default password column name for Auth.
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function requests()
    {
        return $this->hasMany(Request::class, 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'buyer_id');
    }
}
