<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Request as RFQRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RequestTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function authenticated_buyer_can_create_request()
    {
        $user = User::factory()->create(['role' => 'buyer']);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/requests', [
            'product_name' => 'Cotton T-Shirts',
            'description' => 'High quality cotton t-shirts',
            'quantity' => 1000,
            'target_price' => 5.50,
            'currency' => 'USD',
            'destination_country' => 'Indonesia',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('requests', [
            'user_id' => $user->id,
            'product_name' => 'Cotton T-Shirts',
            'quantity' => 1000,
        ]);
    }

    /** @test */
    public function request_creation_requires_product_name_and_quantity()
    {
        $user = User::factory()->create(['role' => 'buyer']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/requests', [
            'description' => 'Missing required fields',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['product_name', 'quantity']);
    }

    /** @test */
    public function buyer_can_only_see_their_own_requests()
    {
        $buyer1 = User::factory()->create(['role' => 'buyer']);
        $buyer2 = User::factory()->create(['role' => 'buyer']);

        RFQRequest::factory()->create(['user_id' => $buyer1->id, 'product_name' => 'Buyer1 Request']);
        RFQRequest::factory()->create(['user_id' => $buyer2->id, 'product_name' => 'Buyer2 Request']);

        $token = $buyer1->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/requests');

        $response->assertStatus(200);
        $response->assertJsonFragment(['product_name' => 'Buyer1 Request']);
        $response->assertJsonMissing(['product_name' => 'Buyer2 Request']);
    }

    /** @test */
    public function buyer_can_view_their_own_request_detail()
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $request = RFQRequest::factory()->create(['user_id' => $buyer->id]);

        $token = $buyer->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson("/api/requests/{$request->id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => $request->id]);
    }

    /** @test */
    public function buyer_cannot_view_other_buyers_requests()
    {
        $buyer1 = User::factory()->create(['role' => 'buyer']);
        $buyer2 = User::factory()->create(['role' => 'buyer']);
        $request = RFQRequest::factory()->create(['user_id' => $buyer2->id]);

        $token = $buyer1->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson("/api/requests/{$request->id}");

        $response->assertStatus(404);
    }

    /** @test */
    public function unauthenticated_user_cannot_create_request()
    {
        $response = $this->postJson('/api/requests', [
            'product_name' => 'Test',
            'quantity' => 100,
        ]);

        $response->assertStatus(401);
    }
}