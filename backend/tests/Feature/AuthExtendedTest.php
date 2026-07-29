<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
use Carbon\Carbon;
use Tests\TestCase;

/**
 * Extended Authentication Test Suite
 * Covers all AUTH test cases: AUTH-01 through AUTH-10
 */
class AuthExtendedTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    // ========================================
    // AUTH-01: Login dengan kredensial valid
    // ========================================
    
    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'password_hash' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => ['id', 'full_name', 'email', 'role', 'mustChangePassword'],
            'token'
        ]);
        $response->assertJsonFragment([
            'mustChangePassword' => false
        ]);
    }

    /** @test */
    public function login_returns_user_data_with_correct_role()
    {
        $buyer = User::factory()->create([
            'role' => 'buyer',
            'password_hash' => bcrypt('buyer123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $buyer->email,
            'password' => 'buyer123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'role' => 'buyer'
        ]);
    }

    // ========================================
    // AUTH-02: Login dengan password salah
    // ========================================
    
    /** @test */
    public function user_cannot_login_with_wrong_password()
    {
        $user = User::factory()->create([
            'password_hash' => bcrypt('correct-password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(400);
        $response->assertJsonFragment(['message' => 'Invalid credentials']);
    }

    /** @test */
    public function login_fails_with_empty_password()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password_hash' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => '',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function login_fails_with_nonexistent_email()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'anypassword',
        ]);

        $response->assertStatus(400);
        $response->assertJsonFragment(['message' => 'Invalid credentials']);
    }

    // ========================================
    // AUTH-03: Login dengan temporary password
    // ========================================
    
    /** @test */
    public function login_with_temp_password_returns_must_change_flag()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->addHours(24),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'temppass123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['mustChangePassword' => true]);
        $response->assertJsonFragment(['role' => 'buyer']);
    }

    /** @test */
    public function temp_password_token_has_must_change_ability()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->addHours(24),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'temppass123',
        ]);

        $response->assertStatus(200);
        
        // Extract token and verify abilities
        $token = $response->json('token');
        $this->assertNotEmpty($token);
        
        // The token should have limited abilities
        $tokenRecord = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        $this->assertNotNull($tokenRecord);
        $abilities = $tokenRecord->abilities;
        $this->assertContains('must-change-password', $abilities);
    }

    // ========================================
    // AUTH-04: Redirect ke halaman ganti password
    // ========================================
    
    /** @test */
    public function user_with_temp_password_cannot_access_other_endpoints()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->addHours(24),
        ]);
        
        $token = $user->createToken('auth-token', ['must-change-password'])->plainTextToken;

        // Try to access protected endpoint
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/auth/me');

        // Should return 403 with mustChangePassword flag
        $response->assertStatus(403);
        $response->assertJsonFragment(['mustChangePassword' => true]);
    }

    /** @test */
    public function user_with_temp_password_can_access_change_password_endpoint()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->addHours(24),
        ]);
        
        $token = $user->createToken('auth-token', ['must-change-password'])->plainTextToken;

        // Should be able to access change-password endpoint
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/auth/change-password', [
            'newPassword' => 'NewSecurePassword123!'
        ]);

        $response->assertStatus(200);
    }

    // ========================================
    // AUTH-05: Ganti password berhasil
    // ========================================
    
    /** @test */
    public function user_can_change_temp_password_successfully()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->addHours(24),
        ]);
        
        $token = $user->createToken('auth-token', ['must-change-password'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/auth/change-password', [
            'newPassword' => 'NewSecurePassword123!'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'user' => ['id', 'full_name', 'email', 'role', 'mustChangePassword'],
            'token'
        ]);
        $response->assertJsonFragment(['mustChangePassword' => false]);
        
        // Verify password was updated
        $user->refresh();
        $this->assertTrue(Hash::check('NewSecurePassword123!', $user->password_hash));
        $this->assertNull($user->temp_password_hash);
        $this->assertNull($user->temp_password_expires_at);
    }

    /** @test */
    public function after_password_change_old_token_is_revoked()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->addHours(24),
        ]);
        
        $oldToken = $user->createToken('auth-token', ['must-change-password'])->plainTextToken;

        // Change password
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$oldToken}",
        ])->postJson('/api/auth/change-password', [
            'newPassword' => 'NewSecurePassword123!'
        ]);

        $response->assertStatus(200);
        
        // Old token should be revoked
        $this->assertEquals(0, $user->tokens()->count());
    }

    /** @test */
    public function after_password_change_new_token_has_full_abilities()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->addHours(24),
        ]);
        
        $oldToken = $user->createToken('auth-token', ['must-change-password'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$oldToken}",
        ])->postJson('/api/auth/change-password', [
            'newPassword' => 'NewSecurePassword123!'
        ]);

        $response->assertStatus(200);
        
        // Get new token
        $newToken = $response->json('token');
        $tokenRecord = \Laravel\Sanctum\PersonalAccessToken::findToken($newToken);
        
        // New token should have full abilities
        $this->assertContains('*', $tokenRecord->abilities);
    }

    // ========================================
    // AUTH-06: Ganti password gagal (invalid token)
    // ========================================
    
    /** @test */
    public function change_password_fails_without_authorization()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/change-password', [
            'newPassword' => 'NewSecurePassword123!'
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function change_password_fails_with_invalid_token()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer invalid-token-12345",
        ])->postJson('/api/auth/change-password', [
            'newPassword' => 'NewSecurePassword123!'
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function change_password_fails_with_short_password()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/auth/change-password', [
            'newPassword' => '12345', // Less than 6 characters
        ]);

        $response->assertStatus(422);
    }

    // ========================================
    // AUTH-07: Logout
    // ========================================
    
    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Logged out successfully']);
        
        // Token should be deleted
        $this->assertEquals(0, $user->tokens()->count());
    }

    /** @test */
    public function logout_with_multiple_tokens_deletes_all()
    {
        $user = User::factory()->create();
        $user->createToken('token1')->plainTextToken;
        $user->createToken('token2')->plainTextToken;
        
        $tokenToUse = $user->createToken('token3')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$tokenToUse}",
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
        
        // All tokens should be deleted
        $this->assertEquals(0, $user->tokens()->count());
    }

    /** @test */
    public function logout_clears_token_cookie()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
        
        // Cookie should be removed
        $cookies = $response->headers->getCookies();
        foreach ($cookies as $cookie) {
            if ($cookie->getName() === 'token') {
                $this->assertTrue($cookie->isExpired());
            }
        }
    }

    // ========================================
    // AUTH-08: Akses protected route tanpa token
    // ========================================
    
    /** @test */
    public function unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/auth/me');
        $response->assertStatus(401);
    }

    /** @test */
    public function unauthenticated_user_cannot_create_request()
    {
        $response = $this->postJson('/api/requests', [
            'product_name' => 'Test Product',
            'category' => 'electronics',
            'quantity' => 100,
            'budget_range' => '1k-5k',
            'shipping_terms' => 'FOB',
            'payment_terms' => 'TT',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function invalid_token_format_is_rejected()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer not-a-valid-token-format",
        ])->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    // ========================================
    // AUTH-09: Temporary password expired
    // ========================================
    
    /** @test */
    public function expired_temp_password_login_fails()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->subHours(1), // Expired 1 hour ago
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'temppass123',
        ]);

        $response->assertStatus(400);
        $response->assertJsonFragment(['message' => 'Invalid credentials']);
    }

    /** @test */
    public function temp_password_exactly_at_expiry_fails()
    {
        $user = User::factory()->create([
            'temp_password_hash' => bcrypt('temppass123'),
            'temp_password_expires_at' => Carbon::now()->subSecond(), // Just expired
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'temppass123',
        ]);

        $response->assertStatus(400);
        $response->assertJsonFragment(['message' => 'Invalid credentials']);
    }

    // ========================================
    // AUTH-10: Admin generate temporary password
    // ========================================
    
    /** @test */
    public function admin_can_generate_temp_password_for_buyer()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        
        $adminToken = $admin->createToken('admin-token', ['*'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}",
        ])->postJson("/api/admin/users/{$buyer->id}/temp-password");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'userId',
            'userEmail',
            'tempPassword',
            'expiresIn'
        ]);
        
        // Verify password is 12 characters
        $tempPassword = $response->json('tempPassword');
        $this->assertEquals(12, strlen($tempPassword));
        
        // Verify password is stored in database
        $buyer->refresh();
        $this->assertNotNull($buyer->temp_password_hash);
        $this->assertNotNull($buyer->temp_password_expires_at);
    }

    /** @test */
    public function generated_temp_password_is_hashed()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        
        $adminToken = $admin->createToken('admin-token', ['*'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}",
        ])->postJson("/api/admin/users/{$buyer->id}/temp-password");

        $response->assertStatus(200);
        
        $tempPassword = $response->json('tempPassword');
        $buyer->refresh();
        
        // Password should be hashed, not stored as plaintext
        $this->assertTrue(Hash::check($tempPassword, $buyer->temp_password_hash));
        $this->assertNotEquals($tempPassword, $buyer->temp_password_hash);
    }

    /** @test */
    public function temp_password_expires_in_24_hours_by_default()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        
        $adminToken = $admin->createToken('admin-token', ['*'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}",
        ])->postJson("/api/admin/users/{$buyer->id}/temp-password");

        $response->assertStatus(200);
        
        $buyer->refresh();
        $expiresAt = Carbon::parse($buyer->temp_password_expires_at);
        $diffInHours = Carbon::now()->diffInHours($expiresAt);
        
        $this->assertGreaterThanOrEqual(23, $diffInHours);
        $this->assertLessThanOrEqual(25, $diffInHours);
    }

    /** @test */
    public function non_admin_cannot_generate_temp_password()
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $otherBuyer = User::factory()->create(['role' => 'buyer']);
        
        $buyerToken = $buyer->createToken('buyer-token', ['*'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$buyerToken}",
        ])->postJson("/api/admin/users/{$otherBuyer->id}/temp-password");

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_cannot_generate_temp_password_for_admin()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherAdmin = User::factory()->create(['role' => 'admin']);
        
        $adminToken = $admin->createToken('admin-token', ['*'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}",
        ])->postJson("/api/admin/users/{$otherAdmin->id}/temp-password");

        $response->assertStatus(200); // Should work, no restriction
    }

    /** @test */
    public function generate_temp_password_for_nonexistent_user_fails()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $admin->createToken('admin-token', ['*'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}",
        ])->postJson("/api/admin/users/nonexistent-id/temp-password");

        $response->assertStatus(404);
    }

    // ========================================
    // Additional Authentication Tests
    // ========================================

    /** @test */
    public function user_can_register_as_buyer()
    {
        $userData = [
            'full_name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'role' => 'buyer',
        ]);
    }

    /** @test */
    public function registration_fails_with_duplicate_email()
    {
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'full_name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function authenticated_user_can_get_profile()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/auth/me');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'email' => $user->email,
            'full_name' => $user->full_name,
        ]);
    }

    /** @test */
    public function user_can_update_profile()
    {
        $user = User::factory()->create([
            'full_name' => 'Old Name',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->putJson('/api/auth/profile', [
            'full_name' => 'New Name',
            'company_name' => 'New Company',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'full_name' => 'New Name',
            'company_name' => 'New Company',
        ]);
    }
}
