# Test Cases Documentation - AfriChina Bridge

## Overview

Dokumen ini berisi test cases komprehensif untuk aplikasi AfriChina Bridge, mencakup:
- Autentikasi & Manajemen Pengguna
- Fitur Buyer (RFQ/Sourcing)
- Fitur Admin
- Real-Time / WebSocket
- Keamanan & CORS
- UI/UX & Responsivitas
- Performa
- Migration & Database

## Test Environment

| Component | Specification |
|-----------|---------------|
| Backend | PHP 8.3+, Laravel 13, MySQL 8+ |
| Frontend | Node.js, Vite dev server @ http://localhost:5173 |
| API | Laravel @ http://localhost:8000 |
| Browser | Chrome, Firefox, Safari (latest 2 versions) |
| Device | Desktop, Tablet, Mobile |

---

## 1. Autentikasi & Manajemen Pengguna

### AUTH-01: Login dengan kredensial valid
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-01 |
| **Priority** | P0 - Critical |
| **Category** | Authentication |

**Pre-conditions:**
- User sudah terdaftar di sistem
- User tidak menggunakan temporary password

**Test Steps:**
```
1. Buka halaman login (http://localhost:5173/login)
2. Masukkan email yang valid (e.g., buyer@africhina.com)
3. Masukkan password yang benar
4. Klik tombol "Sign In"
```

**Expected Result:**
- Response: HTTP 200
- Body: { "user": {...}, "token": "..." }
- Redirect ke /buyer/dashboard

**Test Type:** Backend API + E2E

**Test Code (PHPUnit):**
```php
public function test_user_can_login_with_valid_credentials()
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
    $response->assertJsonFragment(['mustChangePassword' => false]);
}
```

---

### AUTH-02: Login dengan password salah
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-02 |
| **Priority** | P0 - Critical |
| **Category** | Authentication |

**Test Steps:**
```
1. Buka halaman login
2. Masukkan email yang valid
3. Masukkan password yang salah
4. Klik tombol "Sign In"
```

**Expected Result:**
- Response: HTTP 400
- Body: { "message": "Invalid credentials" }
- Tidak ada token yang di-generate
- Error message tampil di UI

**Test Type:** Backend API + E2E

---

### AUTH-03: Login dengan temporary password
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-03 |
| **Priority** | P0 - Critical |
| **Category** | Authentication |

**Pre-conditions:**
- User memiliki temporary password yang valid
- temporary_password_expires_at > current time

**Test Steps:**
```
1. Admin generate temporary password untuk user
2. User login dengan temporary password tersebut
```

**Expected Result:**
- Response: HTTP 200
- Body: { "user": { "mustChangePassword": true, ... }, "token": "..." }
- Token ability: ["must-change-password"]

**Test Code (PHPUnit):**
```php
public function test_login_with_temp_password_returns_must_change_flag()
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
}
```

---

### AUTH-04: Redirect ke halaman ganti password
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-04 |
| **Priority** | P0 - Critical |
| **Category** | Authentication |

**Test Steps:**
```
1. Login dengan temporary password
2. Akses endpoint /api/auth/me
3. Cek response header atau redirect
```

**Expected Result:**
- Jika token ability = "must-change-password"
- Frontend redirect ke /set-new-password
- User tidak bisa akses halaman lain

**Test Type:** E2E + Middleware Test

---

### AUTH-05: Ganti password berhasil
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-05 |
| **Priority** | P0 - Critical |
| **Category** | Authentication |

**Pre-conditions:**
- User login dengan temporary password
- Token ability = "must-change-password"

**Test Steps:**
```
1. POST /api/auth/change-password
2. Body: { "newPassword": "NewSecurePassword123!" }
3. Header: Authorization: Bearer {token}
```

**Expected Result:**
- Response: HTTP 200
- Password user ter-update di database
- Token lama di-revoke
- Token baru diberikan dengan ability ["*"]
- Response: { "user": {...}, "token": "new_token" }

**Test Code (PHPUnit):**
```php
public function test_user_can_change_temp_password()
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
    $response->assertJsonStructure(['user', 'token']);
    
    // Verify password was updated
    $user->refresh();
    $this->assertTrue(Hash::check('NewSecurePassword123!', $user->password_hash));
    $this->assertNull($user->temp_password_hash);
}
```

---

### AUTH-06: Ganti password gagal (invalid token)
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-06 |
| **Priority** | P1 - High |
| **Category** | Authentication |

**Test Steps:**
```
1. POST /api/auth/change-password TANPA Authorization header
2. Body: { "newPassword": "NewSecurePassword123!" }
```

**Expected Result:**
- Response: HTTP 401 Unauthorized
- Password tidak berubah

---

### AUTH-07: Logout
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-07 |
| **Priority** | P0 - Critical |
| **Category** | Authentication |

**Test Steps:**
```
1. User login (dapatkan token)
2. POST /api/auth/logout dengan header Authorization
```

**Expected Result:**
- Response: HTTP 200
- Token di-revoke dari database
- Cookie 'token' dihapus

**Test Code (PHPUnit):**
```php
public function test_authenticated_user_can_logout()
{
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->postJson('/api/auth/logout');

    $response->assertStatus(200);
    $this->assertEquals(0, $user->tokens()->count());
}
```

---

### AUTH-08: Akses protected route tanpa token
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-08 |
| **Priority** | P0 - Critical |
| **Category** | Authentication |

**Test Steps:**
```
1. GET /api/auth/me TANPA Authorization header
```

**Expected Result:**
- Response: HTTP 401 Unauthorized

**Test Code (PHPUnit):**
```php
public function test_unauthenticated_user_cannot_access_protected_routes()
{
    $response = $this->getJson('/api/auth/me');
    $response->assertStatus(401);
}
```

---

### AUTH-09: Temporary password expired
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-09 |
| **Priority** | P1 - High |
| **Category** | Authentication |

**Pre-conditions:**
- User memiliki temporary password yang sudah expired (>24 jam)

**Test Steps:**
```
1. Set temp_password_expires_at = 25 jam yang lalu
2. Login dengan temporary password tersebut
```

**Expected Result:**
- Response: HTTP 400
- Body: { "message": "Invalid credentials" }
- User tidak bisa login, harus hubungi admin

---

### AUTH-10: Admin generate temporary password untuk buyer
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-10 |
| **Priority** | P0 - Critical |
| **Category** | Admin Authentication |

**Pre-conditions:**
- Login sebagai admin

**Test Steps:**
```
1. Admin akses halaman Buyer List
2. Pilih buyer tertentu
3. Klik "Generate Temporary Password"
4. POST /api/admin/users/{userId}/temp-password
```

**Expected Result:**
- Response: HTTP 200
- Body: { "tempPassword": "12_karakter_random", ... }
- Password di-hash dengan bcrypt
- Password expires dalam 24 jam

**Test Code (PHPUnit):**
```php
public function test_admin_can_generate_temp_password_for_buyer()
{
    $admin = User::factory()->create(['role' => 'admin']);
    $buyer = User::factory()->create(['role' => 'buyer']);
    
    $adminToken = $admin->createToken('admin-token', ['*'])->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$adminToken}",
    ])->postJson("/api/admin/users/{$buyer->id}/temp-password");

    $response->assertStatus(200);
    $response->assertJsonStructure(['tempPassword', 'expiresIn']);
    
    // Verify password is 12 characters
    $tempPassword = $response->json('tempPassword');
    $this->assertEquals(12, strlen($tempPassword));
    
    // Verify password is stored in database
    $buyer->refresh();
    $this->assertNotNull($buyer->temp_password_hash);
}
```

---

## 2. Fitur Buyer (RFQ/Sourcing)

### BUY-01: Buyer melihat dashboard
| Field | Value |
|-------|-------|
| **Test ID** | BUY-01 |
| **Priority** | P0 - Critical |
| **Category** | Buyer Dashboard |

**Test Steps:**
```
1. Login sebagai buyer
2. Akses /buyer/dashboard
```

**Expected Result:**
- Dashboard menampilkan statistik RFQ buyer
- List RFQ terbaru
- Quick actions tersedia

**Test Type:** E2E

---

### BUY-02: Membuat RFQ baru
| Field | Value |
|-------|-------|
| **Test ID** | BUY-02 |
| **Priority** | P0 - Critical |
| **Category** | RFQ Creation |

**Test Steps:**
```
1. Login sebagai buyer
2. Akses /buyer/sourcing atau klik "New Request"
3. Form wizard RFQ muncul
4. Isi step 1: Product Details
5. Isi step 2: Specifications
6. Isi step 3: Quantity & Budget
7. Submit
```

**Expected Result:**
- Response: HTTP 201
- RFQ tersimpan dengan status "menunggu_penawaran_admin"
- Tracking log otomatis dibuat
- Notifikasi ke admin

**Test Code (PHPUnit):**
```php
public function test_authenticated_buyer_can_create_request()
{
    $user = User::factory()->create(['role' => 'buyer']);
    $token = $user->createToken('test', ['*'])->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->postJson('/api/requests', [
        'product_name' => 'Cotton T-Shirts',
        'category' => 'textiles',
        'specifications' => 'High quality cotton, 200 GSM',
        'quantity' => 1000,
        'unit' => 'pcs',
        'currency' => 'USD',
        'budget_range' => '5k-20k',
        'shipping_terms' => 'FOB',
        'payment_terms' => 'TT',
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure(['message', 'request']);
    
    $this->assertDatabaseHas('requests', [
        'user_id' => $user->id,
        'product_name' => 'Cotton T-Shirts',
        'status' => 'menunggu_penawaran_admin',
    ]);
}
```

---

### BUY-03: Menyimpan draft RFQ
| Field | Value |
|-------|-------|
| **Test ID** | BUY-03 |
| **Priority** | P1 - High |
| **Category** | RFQ Draft |

**Test Steps:**
```
1. Buat RFQ baru
2. Isi beberapa field saja
3. Klik "Save as Draft"
```

**Expected Result:**
- RFQ tersimpan dengan status draft
- Dapat dilanjutkan kapan saja

**Note:** Berdasarkan codebase saat ini, RFQ langsung tersimpan saat dibuat. Fitur draft perlu implementasi terpisah.

---

### BUY-04: Submit RFQ lengkap
| Field | Value |
|-------|-------|
| **Test ID** | BUY-04 |
| **Priority** | P0 - Critical |
| **Category** | RFQ Submission |

**Test Steps:**
```
1. Buat RFQ baru dengan semua field required terisi
2. Upload gambar referensi (optional)
3. Submit RFQ
```

**Expected Result:**
- RFQ status berubah menjadi "menunggu_penawaran_admin"
- Notification dibuat untuk admin
- Buyer melihat RFQ di list

---

### BUY-05: Melihat daftar RFQ
| Field | Value |
|-------|-------|
| **Test ID** | BUY-05 |
| **Priority** | P0 - Critical |
| **Category** | RFQ List |

**Test Steps:**
```
1. Login sebagai buyer
2. Akses /buyer/requests
```

**Expected Result:**
- List semua RFQ buyer
- Filter berdasarkan status
- Sort by date (newest first)

**Test Code (PHPUnit):**
```php
public function test_buyer_can_see_own_requests_list()
{
    $buyer = User::factory()->create(['role' => 'buyer']);
    RFQRequest::factory()->count(5)->create(['user_id' => $buyer->id]);
    
    // Buyer lain yang tidak boleh terlihat
    $otherBuyer = User::factory()->create(['role' => 'buyer']);
    RFQRequest::factory()->count(3)->create(['user_id' => $otherBuyer->id]);

    $token = $buyer->createToken('test', ['*'])->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->getJson('/api/requests');

    $response->assertStatus(200);
    $this->assertCount(5, $response->json());
}
```

---

### BUY-06: Melihat detail RFQ
| Field | Value |
|-------|-------|
| **Test ID** | BUY-06 |
| **Priority** | P0 - Critical |
| **Category** | RFQ Detail |

**Test Steps:**
```
1. Login sebagai buyer
2. Klik salah satu RFQ dari list
```

**Expected Result:**
- Detail RFQ lengkap tampil
- Includes: options, tracking logs, messages, rating

**Test Code (PHPUnit):**
```php
public function test_buyer_can_view_own_request_detail()
{
    $buyer = User::factory()->create(['role' => 'buyer']);
    $request = RFQRequest::factory()->create(['user_id' => $buyer->id]);

    $token = $buyer->createToken('test', ['*'])->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->getJson("/api/requests/{$request->id}");

    $response->assertStatus(200);
    $response->assertJsonFragment(['id' => $request->id]);
    $response->assertJsonStructure(['options', 'trackingLogs', 'messages', 'rating']);
}
```

---

### BUY-07: Edit RFQ (draft)
| Field | Value |
|-------|-------|
| **Test ID** | BUY-07 |
| **Priority** | P1 - High |
| **Category** | RFQ Edit |

**Test Steps:**
```
1. Buyer edit RFQ yang masih "menunggu_penawaran_admin"
2. Ubah beberapa field
3. Save changes
```

**Expected Result:**
- RFQ ter-update
- Tracking log mencatat perubahan

**Test Code (PHPUnit):**
```php
public function test_buyer_can_edit_request_at_initial_stage()
{
    $buyer = User::factory()->create(['role' => 'buyer']);
    $request = RFQRequest::factory()->create([
        'user_id' => $buyer->id,
        'status' => 'menunggu_penawaran_admin',
    ]);

    $token = $buyer->createToken('test', ['*'])->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->putJson("/api/requests/{$request->id}", [
        'product_name' => 'Updated Product Name',
        'category' => 'electronics',
        'quantity' => 500,
        'budget_range' => '1k-5k',
        'shipping_terms' => 'FOB',
        'payment_terms' => 'TT',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('requests', [
        'id' => $request->id,
        'product_name' => 'Updated Product Name',
    ]);
}
```

---

### BUY-08: Edit RFQ (sudah submit) - GAGAL
| Field | Value |
|-------|-------|
| **Test ID** | BUY-08 |
| **Priority** | P1 - High |
| **Category** | RFQ Edit |

**Test Steps:**
```
1. Buyer coba edit RFQ yang statusnya BUKAN "menunggu_penawaran_admin"
2. Misalnya: "sedang_diproses" atau "menunggu_pembayaran"
```

**Expected Result:**
- Response: HTTP 400
- Body: { "message": "Cannot edit request at this stage" }
- RFQ tidak berubah

**Test Code (PHPUnit):**
```php
public function test_buyer_cannot_edit_request_after_submission()
{
    $buyer = User::factory()->create(['role' => 'buyer']);
    $request = RFQRequest::factory()->create([
        'user_id' => $buyer->id,
        'status' => 'sedang_diproses',
    ]);

    $token = $buyer->createToken('test', ['*'])->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->putJson("/api/requests/{$request->id}", [
        'product_name' => 'Hacked Product',
        'category' => 'electronics',
        'quantity' => 1,
        'budget_range' => '1k-5k',
        'shipping_terms' => 'FOB',
        'payment_terms' => 'TT',
    ]);

    $response->assertStatus(400);
    $response->assertJsonFragment(['message' => 'Cannot edit request at this stage']);
}
```

---

### BUY-09: Buyer menerima proposal
| Field | Value |
|-------|-------|
| **Test ID** | BUY-09 |
| **Priority** | P0 - Critical |
| **Category** | Proposal Acceptance |

**Test Steps:**
```
1. RFQ memiliki options (proposals dari admin)
2. Buyer klik "Accept" pada salah satu option
3. POST /api/requests/{id}/select-option
```

**Expected Result:**
- Option selected
- Status berubah sesuai flow
- Tracking log dibuat

**Note:** Implementation depends on RequestOption model and selectOption endpoint.

---

### BUY-10: Buyer menolak proposal
| Field | Value |
|-------|-------|
| **Test ID** | BUY-10 |
| **Priority** | P1 - High |
| **Category** | Proposal Rejection |

**Test Steps:**
```
1. Buyer reject proposal
2. Beri alasan (optional)
```

**Expected Result:**
- Status proposal berubah
- Tracking log mencatat penolakan

---

## 3. Fitur Admin

### ADM-01: Admin login
| Field | Value |
|-------|-------|
| **Test ID** | ADM-01 |
| **Priority** | P0 - Critical |
| **Category** | Admin Authentication |

**Test Steps:**
```
1. Login dengan akun admin (admin@africhina.com)
```

**Expected Result:**
- Redirect ke /admin/dashboard
- Role = "admin"
- Semua menu admin tersedia

---

### ADM-02: Melihat daftar buyer
| Field | Value |
|-------|-------|
| **Test ID** | ADM-02 |
| **Priority** | P0 - Critical |
| **Category** | Admin Buyer Management |

**Test Steps:**
```
1. Login sebagai admin
2. Akses halaman Buyer Management
3. GET /api/admin/users
```

**Expected Result:**
- List semua buyer dengan detail
- Search functionality works
- Pagination works

**Test Code (PHPUnit):**
```php
public function test_admin_can_view_buyer_list()
{
    $admin = User::factory()->create(['role' => 'admin']);
    User::factory()->count(10)->create(['role' => 'buyer']);
    User::factory()->count(3)->create(['role' => 'supplier']);

    $token = $admin->createToken('admin', ['*'])->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->getJson('/api/admin/users');

    $response->assertStatus(200);
    $response->assertJsonStructure(['data', 'total']);
    $this->assertEquals(10, $response->json('total'));
}
```

---

### ADM-03: Generate temporary password untuk buyer
| Field | Value |
|-------|-------|
| **Test ID** | ADM-03 |
| **Priority** | P0 - Critical |
| **Category** | Admin Buyer Management |

**Test Steps:**
```
1. Admin pilih buyer
2. Klik "Generate Temporary Password"
3. POST /api/admin/users/{userId}/temp-password
```

**Expected Result:**
- Password 12 karakter ter-generate
- Password di-hash bcrypt
- Expires dalam 24 jam

---

### ADM-04: Admin melihat semua RFQ
| Field | Value |
|-------|-------|
| **Test ID** | ADM-04 |
| **Priority** | P0 - Critical |
| **Category** | Admin RFQ Management |

**Test Steps:**
```
1. Login sebagai admin
2. Akses halaman RFQ Management
3. GET /api/admin/requests
```

**Expected Result:**
- List semua RFQ dari semua buyer
- Filter by status
- Cursor-based pagination works

**Test Code (PHPUnit):**
```php
public function test_admin_can_view_all_requests()
{
    $admin = User::factory()->create(['role' => 'admin']);
    $buyer1 = User::factory()->create(['role' => 'buyer']);
    $buyer2 = User::factory()->create(['role' => 'buyer']);
    
    RFQRequest::factory()->count(5)->create(['user_id' => $buyer1->id]);
    RFQRequest::factory()->count(3)->create(['user_id' => $buyer2->id]);

    $token = $admin->createToken('admin', ['*'])->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->getJson('/api/admin/requests');

    $response->assertStatus(200);
    $response->assertJsonStructure(['data', 'pagination']);
    $this->assertCount(8, $response->json('data'));
}
```

---

### ADM-05: Admin approve RFQ
| Field | Value |
|-------|-------|
| **Test ID** | ADM-05 |
| **Priority** | P0 - Critical |
| **Category** | Admin RFQ Management |

**Test Steps:**
```
1. Admin pilih RFQ
2. Klik "Approve" atau update status
3. PUT /api/admin/requests/{id}
```

**Expected Result:**
- Status RFQ berubah
- Tracking log dibuat
- Buyer mendapat notifikasi

**Note:** Based on updateAdminRequest endpoint.

---

### ADM-06: Admin reject RFQ
| Field | Value |
|-------|-------|
| **Test ID** | ADM-06 |
| **Priority** | P1 - High |
| **Category** | Admin RFQ Management |

**Test Steps:**
```
1. Admin reject RFQ dengan alasan
```

**Expected Result:**
- Status berubah
- Alasan tersimpan di tracking log

---

### ADM-07: Admin mengelola supplier
| Field | Value |
|-------|-------|
| **Test ID** | ADM-07 |
| **Priority** | P1 - High |
| **Category** | Admin Supplier Management |

**Test Steps:**
```
1. Akses halaman Supplier Management
2. Create/Edit/Delete supplier
```

**Expected Result:**
- CRUD operations work correctly
- Block/unblock supplier works

**Test Code (PHPUnit):**
```php
public function test_admin_can_crud_suppliers()
{
    $admin = User::factory()->create(['role' => 'admin']);
    $token = $admin->createToken('admin', ['*'])->plainTextToken;

    // Create
    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->postJson('/api/admin/suppliers', [
        'company_name' => 'Test Supplier Co',
        'category' => 'electronics',
        'contact_person' => 'John Doe',
        'phone_china' => '+86 138 0000 0000',
        'email' => 'contact@testsupplier.com',
    ]);
    
    $response->assertStatus(201);
    $supplierId = $response->json('id');
    
    // Read
    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->getJson('/api/admin/suppliers');
    
    $response->assertStatus(200);
    
    // Update
    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->putJson("/api/admin/suppliers/{$supplierId}", [
        'company_name' => 'Updated Supplier Co',
    ]);
    
    $response->assertStatus(200);
    
    // Delete
    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->deleteJson("/api/admin/suppliers/{$supplierId}");
    
    $response->assertStatus(200);
}
```

---

### ADM-08: Admin melihat aktivitas user
| Field | Value |
|-------|-------|
| **Test ID** | ADM-08 |
| **Priority** | P2 - Medium |
| **Category** | Admin Activity Log |

**Test Steps:**
```
1. Akses Buyer Profile
2. Lihat recent activities
```

**Expected Result:**
- List aktivitas terbaru buyer
- Include RFQ creation, status changes

---

## 4. Real-Time / WebSocket

### RT-01: Notifikasi RFQ status change
| Field | Value |
|-------|-------|
| **Test ID** | RT-01 |
| **Priority** | P0 - Critical |
| **Category** | Real-Time Notifications |

**Test Steps:**
```
1. Buyer login dan buka dashboard (WebSocket connected)
2. Admin approve RFQ buyer
3. Observe notification
```

**Expected Result:**
- Buyer menerima real-time notification
- Toast/notification popup muncul
- Status RFQ di-dashboard update

**Note:** SocketService.php currently logs but doesn't broadcast. Frontend uses polling.

---

### RT-02: Notifikasi proposal baru
| Field | Value |
|-------|-------|
| **Test ID** | RT-02 |
| **Priority** | P0 - Critical |
| **Category** | Real-Time Notifications |

**Test Steps:**
```
1. Admin upload options (proposals) ke RFQ
2. Buyer sedang online
```

**Expected Result:**
- Buyer terima notification real-time

---

### RT-03: Koneksi WebSocket terputus
| Field | Value |
|-------|-------|
| **Test ID** | RT-03 |
| **Priority** | P1 - High |
| **Category** | Real-Time Resilience |

**Test Steps:**
```
1. User browse aplikasi
2. Matikan koneksi internet sejenak
3. Aktifkan kembali
```

**Expected Result:**
- Frontend reconnect automatically
- Polling fallback works
- No data loss

---

### RT-04: Multiple user real-time
| Field | Value |
|-------|-------|
| **Test ID** | RT-04 |
| **Priority** | P1 - High |
| **Category** | Real-Time Security |

**Test Steps:**
```
1. User A (Buyer 1) login
2. User B (Buyer 2) login
3. Admin approve RFQ User A
4. User B tidak menerima notification User A
```

**Expected Result:**
- Notification hanya ke user yang berhak
- User isolation maintained

---

## 5. Keamanan & CORS

### SEC-01: CORS origin tidak terdaftar
| Field | Value |
|-------|-------|
| **Test ID** | SEC-01 |
| **Priority** | P0 - Critical |
| **Category** | Security |

**Test Steps:**
```
1. Set CORS_ORIGINS = "http://localhost:5173"
2. Request dari "http://evil.com"
```

**Expected Result:**
- Request ditolak
- CORS error di browser

**Test Code (PHPUnit):**
```php
public function test_cors_rejects_unregistered_origin()
{
    config(['cors.allowed_origins' => ['http://localhost:5173']]);
    
    $response = $this->call('POST', '/api/auth/login', [], [], [], [
        'HTTP_ORIGIN' => 'http://evil.com',
        'CONTENT_TYPE' => 'application/json',
    ]);
    
    // CORS will reject before reaching the controller
    $this->assertNotEquals(200, $response->getStatusCode());
}
```

---

### SEC-02: CORS wildcard tidak digunakan
| Field | Value |
|-------|-------|
| **Test ID** | SEC-02 |
| **Priority** | P1 - High |
| **Category** | Security |

**Test Steps:**
```
1. Cek file config/cors.php
2. Pastikan tidak ada "*" di allowed_origins
```

**Expected Result:**
- `allowed_origins` adalah array specific domains
- Tidak ada wildcard

---

### SEC-03: HTML error tidak muncul di API
| Field | Value |
|-------|-------|
| **Test ID** | SEC-03 |
| **Priority** | P1 - High |
| **Category** | Security |

**Test Steps:**
```
1. Request ke /api/* dengan invalid data
2. Cek response content-type
```

**Expected Result:**
- Content-Type: application/json
- Response body adalah JSON, bukan HTML

**Test Code (PHPUnit):**
```php
public function test_api_returns_json_errors_not_html()
{
    $response = $this->postJson('/api/auth/login', [
        'email' => 'invalid',
        'password' => '',
    ]);
    
    $response->assertStatus(422);
    $response->assertJson();
    $this->assertEquals('application/json', $response->headers->get('Content-Type'));
}
```

---

### SEC-04: Token revoked after logout
| Field | Value |
|-------|-------|
| **Test ID** | SEC-04 |
| **Priority** | P0 - Critical |
| **Category** | Security |

**Test Steps:**
```
1. User login -> dapat token
2. User logout
3. Request dengan token lama
```

**Expected Result:**
- Request ditolak (401)
- Token tidak valid

---

### SEC-05: SQL Injection prevention
| Field | Value |
|-------|-------|
| **Test ID** | SEC-05 |
| **Priority** | P0 - Critical |
| **Category** | Security |

**Test Steps:**
```
1. Input field dengan SQL: "'; DROP TABLE users; --"
2. Submit form
```

**Expected Result:**
- Input disanitasi
- Tidak ada SQL injection
- Query returns empty or escaped result

**Test Code (PHPUnit):**
```php
public function test_sql_injection_is_prevented()
{
    $user = User::factory()->create(['role' => 'buyer']);
    $token = $user->createToken('test', ['*'])->plainTextToken;

    // Try to inject SQL via search parameter
    $response = $this->withHeaders([
        'Authorization' => "Bearer {$token}",
    ])->getJson('/api/admin/users?search=' . urlencode("'; DROP TABLE users; --"));

    // Should not cause database error, should return empty or proper response
    $response->assertStatus(200);
}
```

---

### SEC-06: XSS prevention
| Field | Value |
|-------|-------|
| **Test ID** | SEC-06 |
| **Priority** | P0 - Critical |
| **Category** | Security |

**Test Steps:**
```
1. Input field dengan: "<script>alert('xss')</script>"
2. Submit dan render di frontend
```

**Expected Result:**
- Tag di-escape / tidak tereksekusi
- Text tampil sebagai plain text

---

## 6. UI/UX & Responsivitas

### UI-01: Responsivitas mobile
| Field | Value |
|-------|-------|
| **Test ID** | UI-01 |
| **Priority** | P1 - High |
| **Category** | Responsive Design |

**Test Steps:**
```
1. Buka aplikasi di device emulation (320px - 768px)
2. Test semua halaman utama
```

**Expected Result:**
- Tampilan menyesuaikan
- Semua fitur aksesibel
- No horizontal scroll

**Test Tool:** Playwright

---

### UI-02: Responsivitas tablet
| Field | Value |
|-------|-------|
| **Test ID** | UI-02 |
| **Priority** | P2 - Medium |
| **Category** | Responsive Design |

**Test Steps:**
```
1. Buka aplikasi di tablet emulation (768px - 1024px)
```

**Expected Result:**
- Layout optimal
- Sidebar collapsible

---

### UI-03: Loading state
| Field | Value |
|-------|-------|
| **Test ID** | UI-03 |
| **Priority** | P2 - Medium |
| **Category** | UX |

**Test Steps:**
```
1. Trigger API call yang lambat
2. Observe loading indicator
```

**Expected Result:**
- Spinner/progress indicator muncul
- No blank screen

---

### UI-04: Error handling
| Field | Value |
|-------|-------|
| **Test ID** | UI-04 |
| **Priority** | P1 - High |
| **Category** | UX |

**Test Steps:**
```
1. Submit form dengan data invalid
```

**Expected Result:**
- Error message per field
- Clear and helpful

---

### UI-05: Material Symbols icons
| Field | Value |
|-------|-------|
| **Test ID** | UI-05 |
| **Priority** | P2 - Medium |
| **Category** | UI Assets |

**Test Steps:**
```
1. Cek semua halaman
2. Verify icons load correctly
```

**Expected Result:**
- Icons tampil dari local CSS, bukan Google Fonts
- No loading delay

**Note:** Project menggunakan local icons di /public/icons.svg dan CSS.

---

### UI-06: Multi-language
| Field | Value |
|-------|-------|
| **Test ID** | UI-06 |
| **Priority** | P1 - High |
| **Category** | i18n |

**Test Steps:**
```
1. Switch language ke zh, fr, id
2. Verify all text changes
```

**Expected Result:**
- Semua teks berubah sesuai bahasa
- No missing translations

**Test Files:**
- /frontend/src/locales/en.json
- /frontend/src/locales/id.json
- /frontend/src/locales/fr.json
- /frontend/src/locales/zh.json

---

## 7. Performa

### PERF-01: Load time dashboard
| Field | Value |
|-------|-------|
| **Test ID** | PERF-01 |
| **Priority** | P1 - High |
| **Category** | Performance |

**Test Steps:**
```
1. Measure page load time
2. From navigation to fully rendered
```

**Expected Result:**
- < 3 detik

**Test Tool:** Lighthouse, Playwright

---

### PERF-02: API response time
| Field | Value |
|-------|-------|
| **Test ID** | PERF-02 |
| **Priority** | P1 - High |
| **Category** | Performance |

**Test Steps:**
```
1. Measure response time semua API endpoints
```

**Expected Result:**
- < 500ms untuk 90% request

**Test Tool:** k6

---

### PERF-03: Concurrent users
| Field | Value |
|-------|-------|
| **Test ID** | PERF-03 |
| **Priority** | P1 - High |
| **Category** | Performance |

**Test Steps:**
```
1. Simulasikan 100 concurrent users
2. Measure error rate
```

**Expected Result:**
- No timeout
- No 5xx errors

**Test Tool:** k6

---

### PERF-04: Database query optimization
| Field | Value |
|-------|-------|
| **Test ID** | PERF-04 |
| **Priority** | P2 - Medium |
| **Category** | Performance |

**Test Steps:**
```
1. Enable query log
2. Load halaman dengan banyak data
3. Analyze queries
```

**Expected Result:**
- < 20 queries per page load
- No N+1 problem

---

## 8. Migration & Database

### DB-01: Migrasi berjalan
| Field | Value |
|-------|-------|
| **Test ID** | DB-01 |
| **Priority** | P0 - Critical |
| **Category** | Database |

**Test Steps:**
```
1. php artisan migrate --force
```

**Expected Result:**
- Semua tabel terbuat tanpa error
- No missing columns

---

### DB-02: Seeder berjalan
| Field | Value |
|-------|-------|
| **Test ID** | DB-02 |
| **Priority** | P1 - High |
| **Category** | Database |

**Test Steps:**
```
1. php artisan db:seed
```

**Expected Result:**
- Data dummy terisi
- Demo accounts created

---

### DB-03: Rollback migration
| Field | Value |
|-------|-------|
| **Test ID** | DB-03 |
| **Priority** | P2 - Medium |
| **Category** | Database |

**Test Steps:**
```
1. php artisan migrate:rollback
```

**Expected Result:**
- Tabel ter-drop dengan aman
- No data loss warnings

---

### DB-04: Legacy migration tidak digunakan
| Field | Value |
|-------|-------|
| **Test ID** | DB-04 |
| **Priority** | P2 - Low |
| **Category** | Database |

**Test Steps:**
```
1. Cek folder /migrations/
2. Verify only Laravel migrations used
```

**Expected Result:**
- File SQL di /migrations/ tidak terpakai
- All migrations in Laravel format

---

## Acceptance Criteria Summary

| Criteria | Target |
|----------|--------|
| Test Cases Passed | ≥ 90% |
| Critical Bugs | 0 |
| High Bugs | 0 |
| Browser Compatibility | Chrome, Firefox, Safari |
| Responsive | Desktop, Tablet, Mobile |
| CORS | Working correctly |
| WebSocket | Real-time notifications |
| Multi-language | en, fr, zh, id |

---

## Test Execution Schedule

| Phase | Duration | Activities |
|-------|----------|------------|
| Phase 1 | Week 1 | Unit Tests (Backend) |
| Phase 2 | Week 2 | Feature Tests (Backend) |
| Phase 3 | Week 3 | E2E Tests (Playwright) |
| Phase 4 | Week 4 | Performance & Security |
| Phase 5 | Week 5 | Bug Fixing & Retest |

---

## Reporting

Weekly test reports include:
- Test execution status
- Defects found
- Risk assessment
- Recommendations
