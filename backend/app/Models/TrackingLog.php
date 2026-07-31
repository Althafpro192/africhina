<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TrackingLog extends Model
{
    use HasUuids;

    protected $table = 'tracking_logs';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'status',
        'notes',
    ];

    public function request()
    {
        return $this->belongsTo(Request::class, 'request_id');
    }
}
