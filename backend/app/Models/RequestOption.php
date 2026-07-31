<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RequestOption extends Model
{
    use HasUuids;

    protected $table = 'request_options';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'product_name',
        'description',
        'price_min',
        'price_max',
        'admin_reason',
        'target_delivery',
        'shipping_method',
        'est_time_sea',
        'est_time_air',
        'is_fixed_price',
        'is_selected',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
        'is_fixed_price' => 'boolean',
        'is_selected' => 'boolean',
        'price_min' => 'float',
        'price_max' => 'float',
        'target_delivery' => 'date',
    ];

    public function request()
    {
        return $this->belongsTo(Request::class, 'request_id');
    }
}
