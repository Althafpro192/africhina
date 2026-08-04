<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Request extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'requests';

    protected $fillable = [
        'user_id',
        'product_name',
        'category',
        'specifications',
        'quantity',
        'budget_range',
        'sub_category',
        'unit',
        'currency',
        'delivery_timeline',
        'shipping_terms',
        'payment_terms',
        'quality_requirements',
        'certifications',
        'image_urls',
        'status',
        'assigned_supplier_id',
        'quoted_price',
        'quote_accepted_at',
        'production_progress',
        'production_media',
        'estimated_arrival_date',
        'internal_notes',
        'deal_finalized_at',
        'payment_proof_url',
        'buyer_notes',
        'final_price',
        'price_breakdown',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'payment_qr_url',
        'payment_notes',
        'payment_rejection_reason',
        'assigned_driver_id',
        'delivery_method',
        'assigned_driver_at',
    ];

    protected $casts = [
        'image_urls' => 'array',
        'production_media' => 'array',
        'price_breakdown' => 'array',
        'delivery_timeline' => 'date',
        'estimated_arrival_date' => 'date',
        'quote_accepted_at' => 'datetime',
        'deal_finalized_at' => 'datetime',
        'assigned_driver_at' => 'datetime',
        'quoted_price' => 'float',
        'final_price' => 'float',
        'production_progress' => 'integer',
        'quantity' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'assigned_supplier_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'assigned_driver_id');
    }

    public function trackingLogs()
    {
        return $this->hasMany(TrackingLog::class, 'request_id')->orderBy('created_at', 'asc');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'request_id')->orderBy('created_at', 'asc');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'request_id');
    }

    public function rating()
    {
        return $this->hasOne(Rating::class, 'request_id');
    }
}
