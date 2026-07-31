<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'quantity' => 'required|integer|min:1|max:999999',
            'target_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'destination_country' => 'nullable|string|max:100',
            'destination_port' => 'nullable|string|max:255',
            'preferred_suppliers' => 'nullable|string|max:500',
            'sample_required' => 'nullable|boolean',
            'quality_standard' => 'nullable|string|max:100',
            'target_delivery_date' => 'nullable|date|after:today',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'product_name.required' => 'Product name is required.',
            'quantity.required' => 'Quantity is required.',
            'quantity.min' => 'Quantity must be at least 1.',
            'target_price.numeric' => 'Target price must be a valid number.',
            'images.*.image' => 'Each uploaded file must be an image.',
            'images.*.mimes' => 'Supported image formats: JPEG, PNG, JPG, GIF, WebP.',
        ];
    }
}
