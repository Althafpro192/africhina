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
            'category' => 'general',
            'sub_category' => 'general',
            'specifications' => fake()->sentence(),
            'quantity' => fake()->numberBetween(100, 10000),
            'unit' => 'pcs',
            'budget_range' => '1000-5000',
            'currency' => fake()->randomElement(['USD', 'CNY', 'IDR', 'EUR']),
            'delivery_timeline' => fake()->dateTimeBetween('+1 month', '+6 months')->format('Y-m-d'),
            'shipping_terms' => fake()->randomElement(['FOB', 'CIF', 'EXW']),
            'payment_terms' => fake()->randomElement(['T/T', 'L/C', 'D/P']),
            'quality_requirements' => fake()->sentence(),
            'certifications' => null,
            'image_urls' => null,
            'status' => 'draft',
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
