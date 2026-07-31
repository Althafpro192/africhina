<?php

namespace Database\Factories;

use App\Models\Request;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Request>
 */
class RequestFactory extends Factory
{
    protected $model = Request::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'product_name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'quantity' => fake()->numberBetween(100, 10000),
            'target_price' => fake()->randomFloat(2, 1, 100),
            'currency' => fake()->randomElement(['USD', 'CNY', 'IDR']),
            'destination_country' => fake()->country(),
            'destination_port' => fake()->city(),
            'preferred_suppliers' => fake()->company(),
            'sample_required' => fake()->boolean(30),
            'quality_standard' => fake()->randomElement(['ISO', 'CE', 'FDA', null]),
            'target_delivery_date' => fake()->dateTimeBetween('+1 month', '+6 months'),
            'status' => 'draft',
            'images' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'menunggu_pembayaran',
            'deal_finalized_at' => now(),
            'quoted_price' => 5000,
        ]);
    }
}
