<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_create_supplier()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/admin/suppliers', [
            'name' => 'Acme Manufacturing Co',
            'country' => 'China',
            'category' => 'Electronics',
            'email' => 'contact@acme.example.com',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('suppliers', [
            'name' => 'Acme Manufacturing Co',
            'country' => 'China',
        ]);
    }

    /** @test */
    public function admin_can_list_suppliers()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Supplier::factory()->count(3)->create();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/admin/suppliers');

        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    /** @test */
    public function admin_can_update_supplier()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $supplier = Supplier::factory()->create(['name' => 'Old Name']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->putJson("/api/admin/suppliers/{$supplier->id}", [
            'name' => 'New Name',
            'country' => 'Vietnam',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'New Name',
        ]);
    }

    /** @test */
    public function admin_can_delete_supplier()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $supplier = Supplier::factory()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->deleteJson("/api/admin/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
    }

    /** @test */
    public function non_admin_cannot_access_supplier_endpoints()
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $token = $buyer->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/admin/suppliers');

        $response->assertStatus(403);
    }
}