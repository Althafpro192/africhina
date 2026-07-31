<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => 'required|string|max:5000',
            'attachment_url' => 'nullable|url|max:500',
            'reply_to_id' => 'nullable|uuid|exists:messages,id',
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Message content is required.',
            'message.max' => 'Message cannot exceed 5000 characters.',
        ];
    }
}
