<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_registration_and_login(): void
    {
        $regResponse = $this->postJson('/api/auth/register', [
            'full_name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'secret123',
            'company_name' => 'Acme Corp',
        ]);

        $regResponse->assertStatus(201);
        $regResponse->assertJsonStructure(['user' => ['id', 'full_name', 'email', 'role']]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'secret123',
        ]);

        $loginResponse->assertStatus(200);
        $loginResponse->assertJsonStructure(['user', 'token']);
    }

    public function test_buyer_create_rfq_and_admin_stats(): void
    {
        $user = User::factory()->create([
            'role' => 'buyer',
            'password_hash' => bcrypt('password123'),
        ]);

        Sanctum::actingAs($user, ['*']);

        $rfqResponse = $this->postJson('/api/requests', [
            'product_name' => 'Industrial Solar Inverter',
            'category' => 'Solar Energy',
            'quantity' => 10,
            'budget_range' => '$5,000 - $10,000',
            'shipping_terms' => 'FOB Shanghai',
            'payment_terms' => 'Escrow',
        ]);

        $rfqResponse->assertStatus(201);

        $admin = User::factory()->create([
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin, ['*']);

        $statsResponse = $this->getJson('/api/admin/statistics');

        $statsResponse->assertStatus(200);
        $statsResponse->assertJsonStructure(['total_requests', 'pending_requests']);
    }
}

