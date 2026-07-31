<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Rating extends Model
{
    use HasUuids;

    protected $table = 'ratings';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'supplier_id',
        'buyer_id',
        'score',
        'review',
        'is_published',
    ];

    protected $casts = [
        'score' => 'integer',
        'is_published' => 'boolean',
    ];

    public function request()
    {
        return $this->belongsTo(Request::class, 'request_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
}
