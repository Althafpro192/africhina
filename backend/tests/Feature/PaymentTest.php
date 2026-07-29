<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Request as RFQRequest;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    /** @test */
    public function buyer_can_upload_payment_proof()
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $rfq = RFQRequest::factory()->create([
            'user_id' => $buyer->id,
            'status' => 'menunggu_pembayaran',
            'deal_finalized_at' => now(),
            'quoted_price' => 5000,
        ]);
        $token = $buyer->createToken('test')->plainTextToken;

        $file = UploadedFile::fake()->image('payment-proof.jpg');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson("/api/payments/requests/{$rfq->id}", [
            'payment_proof' => $file,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'request_id' => $rfq->id,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function admin_can_verify_payment()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $rfq = RFQRequest::factory()->create([
            'status' => 'menunggu_verifikasi_pembayaran',
        ]);
        Payment::factory()->create([
            'request_id' => $rfq->id,
            'status' => 'pending',
        ]);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->putJson("/api/payments/admin/{$rfq->id}/verify");

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'request_id' => $rfq->id,
            'status' => 'verified',
        ]);
    }

    /** @test */
    public function admin_can_reject_payment_with_reason()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $rfq = RFQRequest::factory()->create([
            'status' => 'menunggu_verifikasi_pembayaran',
        ]);
        Payment::factory()->create([
            'request_id' => $rfq->id,
            'status' => 'pending',
        ]);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->putJson("/api/payments/admin/{$rfq->id}/reject", [
            'reason' => 'Payment proof is unclear',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'request_id' => $rfq->id,
            'status' => 'rejected',
        ]);
    }

    /** @test */
    public function admin_can_release_payment_for_completed_request()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $rfq = RFQRequest::factory()->create([
            'status' => 'selesai',
        ]);
        Payment::factory()->create([
            'request_id' => $rfq->id,
            'status' => 'verified',
        ]);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson("/api/payments/admin/requests/{$rfq->id}/release");

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'request_id' => $rfq->id,
            'status' => 'released',
        ]);
    }

    /** @test */
    public function admin_can_refund_rejected_payment()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $rfq = RFQRequest::factory()->create();
        Payment::factory()->create([
            'request_id' => $rfq->id,
            'status' => 'rejected',
        ]);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson("/api/payments/admin/requests/{$rfq->id}/refund", [
            'reason' => 'Refund due to order cancellation',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'request_id' => $rfq->id,
            'status' => 'refunded',
        ]);
    }

    /** @test */
    public function release_fails_for_non_completed_request()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $rfq = RFQRequest::factory()->create([
            'status' => 'sedang_diproses',
        ]);
        Payment::factory()->create([
            'request_id' => $rfq->id,
            'status' => 'verified',
        ]);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson("/api/payments/admin/requests/{$rfq->id}/release");

        $response->assertStatus(400);
    }
}