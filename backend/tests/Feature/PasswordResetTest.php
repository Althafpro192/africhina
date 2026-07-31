<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\PasswordResetRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function password_reset_request_creates_record()
    {
        $buyer = User::factory()->create([
            'role' => 'buyer',
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/auth/password-reset', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('password_reset_requests', [
            'user_id' => $buyer->id,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function admin_can_list_pending_reset_requests()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        PasswordResetRequest::create([
            'user_id' => $buyer->id,
            'email' => $buyer->email,
            'status' => 'pending',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/admin/security/password-resets');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }

    /** @test */
    public function admin_can_process_reset_request()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $resetRequest = PasswordResetRequest::create([
            'user_id' => $buyer->id,
            'email' => $buyer->email,
            'status' => 'pending',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson("/api/admin/security/password-resets/{$resetRequest->id}/process");

        $response->assertStatus(200);
        $response->assertJsonStructure(['tempPassword']);
        $this->assertDatabaseHas('password_reset_requests', [
            'id' => $resetRequest->id,
            'status' => 'processed',
        ]);
    }

    /** @test */
    public function admin_can_reject_reset_request()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $resetRequest = PasswordResetRequest::create([
            'user_id' => $buyer->id,
            'email' => $buyer->email,
            'status' => 'pending',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson("/api/admin/security/password-resets/{$resetRequest->id}/reject", [
            'reason' => 'Suspicious activity',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('password_reset_requests', [
            'id' => $resetRequest->id,
            'status' => 'rejected',
        ]);
    }

    /** @test */
    public function cannot_reject_already_processed_request()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $resetRequest = PasswordResetRequest::create([
            'user_id' => $buyer->id,
            'email' => $buyer->email,
            'status' => 'processed',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson("/api/admin/security/password-resets/{$resetRequest->id}/reject", [
            'reason' => 'Cannot reject processed',
        ]);

        $response->assertStatus(404);
    }
}