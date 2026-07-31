<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:5000',
            'quantity' => 'sometimes|integer|min:1|max:999999',
            'target_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'destination_country' => 'nullable|string|max:100',
            'destination_port' => 'nullable|string|max:255',
            'preferred_suppliers' => 'nullable|string|max:500',
            'sample_required' => 'nullable|boolean',
            'quality_standard' => 'nullable|string|max:100',
            'target_delivery_date' => 'nullable|date',
        ];
    }
}
