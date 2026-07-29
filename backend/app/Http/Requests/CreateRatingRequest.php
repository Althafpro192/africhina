<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => 'required|uuid|exists:suppliers,id',
            'request_id' => 'required|uuid|exists:requests,id',
            'score' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'score.min' => 'Rating score must be at least 1 star.',
            'score.max' => 'Rating score cannot exceed 5 stars.',
        ];
    }
}
