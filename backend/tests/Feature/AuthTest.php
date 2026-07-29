<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /** @test */
    public function user_can_register_with_valid_credentials()
    {
        $userData = [
            'full_name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'role' => 'buyer',
        ]);
    }

    /** @test */
    public function registration_fails_with_duplicate_email()
    {
        $email = $this->faker->unique()->safeEmail;
        User::factory()->create(['email' => $email]);

        $response = $this->postJson('/api/auth/register', [
            'full_name' => 'Test User',
            'email' => $email,
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function user_can_login_with_correct_credentials()
    {
        $user = User::factory()->create([
            'password_hash' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['user', 'token']);
    }

    /** @test */
    public function user_cannot_login_with_wrong_password()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_get_their_profile()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(200);
        $response->assertJsonFragment(['email' => $user->email]);
    }

    /** @test */
    public function unauthenticated_user_cannot_get_profile()
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }

    /** @test */
    public function password_reset_request_returns_success_for_any_email()
    {
        $response = $this->postJson('/api/auth/password-reset', [
            'email' => 'nonexistent@example.com',
        ]);

        // Should always return success for security (prevent user enumeration)
        $response->assertStatus(200);
        $response->assertJsonStructure(['message']);
    }
}