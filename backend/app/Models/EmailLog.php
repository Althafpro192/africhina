<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class EmailLog extends Model
{
    use HasUuids;

    protected $table = 'email_logs';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'sender_id',
        'receiver_email',
        'subject',
        'body',
    ];

    public function request()
    {
        return $this->belongsTo(Request::class, 'request_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
