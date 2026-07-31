<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'country' => fake()->randomElement(['China', 'Vietnam', 'Thailand', 'Indonesia', 'India']),
            'category' => fake()->randomElement(['Electronics', 'Textiles', 'Machinery', 'Food', 'Chemicals']),
            'contact_person' => fake()->name(),
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'whatsapp' => fake()->e164PhoneNumber(),
            'address' => fake()->address(),
            'website' => fake()->url(),
            'description' => fake()->paragraph(),
            'logo_url' => fake()->imageUrl(200, 200, 'business'),
            'is_blocked' => false,
        ];
    }

    public function blocked(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_blocked' => true,
        ]);
    }
}
