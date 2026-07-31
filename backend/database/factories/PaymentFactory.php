<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Request;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'request_id' => Request::factory(),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'currency' => 'USD',
            'exchange_rate' => 1.0,
            'payment_proof_url' => '/uploads/' . fake()->uuid() . '.jpg',
            'status' => 'pending',
            'verified_by' => null,
            'verified_at' => null,
            'notes' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'verified',
            'verified_by' => \App\Models\User::factory()->create(['role' => 'admin'])->id,
            'verified_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
        ]);
    }
}
