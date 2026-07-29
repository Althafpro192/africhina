<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PasswordResetRequest extends Model
{
    use HasUuids;

    protected $table = 'password_reset_requests';

    protected $fillable = [
        'user_id',
        'email',
        'status',
        'token',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
