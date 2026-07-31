<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Message extends Model
{
    use HasUuids;

    protected $table = 'messages';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'buyer_id',
        'sender_id',
        'content',
        'translations',
        'media_url',
        'media_type',
        'is_edited',
        'is_deleted',
    ];

    protected $casts = [
        'translations' => 'array',
        'is_edited' => 'boolean',
        'is_deleted' => 'boolean',
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
