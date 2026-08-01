# Plan: Implementasi CRUD Gambar di Semua Fitur

## Overview
Implementasi kemampuan CRUD (Create, Read, Update, Delete) gambar di semua fitur aplikasi, menggunakan referensi dari fitur **Chat** yang sudah berfungsi dengan baik.

## Reference Implementation (Fitur Chat)
- **File**: `frontend/src/components/chat/ChatComponent.vue`
- **Status**: ✅ Sudah lengkap dengan:
  - Upload gambar via FormData + `/api/upload`
  - Preview gambar sebelum upload
  - Compression gambar otomatis
  - Delete gambar (soft delete via message delete)
  - View gambar di chat dengan lightbox

---

## Fitur yang Perlu Diimplementasi

### 1. Admin - Suppliers (Logo Perusahaan)
**File**: `frontend/src/views/admin/Suppliers.vue`

**Yang perlu ditambahkan:**
- [ ] Upload logo saat create supplier baru
- [ ] Upload/replace logo saat edit supplier
- [ ] Delete logo supplier
- [ ] Preview logo dengan lightbox
- [ ] Simpan logo URL di column `logo_url` di tabel `suppliers`

**Backend API:**
- [ ] POST `/api/upload` - Upload file (sudah ada)
- [ ] DELETE `/api/suppliers/{id}/logo` - Delete logo supplier
- [ ] Update controller untuk handle logo upload

**Komponen UI:**
- [ ] Tambah preview logo di modal create/edit
- [ ] Tambah tombol delete di preview
- [ ] Integrasi ImageLightbox untuk preview

---

### 2. Admin - Drivers (Foto Driver)
**File**: `frontend/src/views/admin/Drivers.vue`

**Yang perlu ditambahkan:**
- [ ] Upload foto saat create driver baru
- [ ] Upload/replace foto saat edit driver
- [ ] Delete foto driver
- [ ] Preview foto dengan lightbox
- [ ] Simpan foto URL di column `photo_url` atau `avatar_url` di tabel `drivers`

**Backend API:**
- [ ] DELETE `/api/drivers/{id}/photo` - Delete foto driver
- [ ] Update controller untuk handle photo upload

**Komponen UI:**
- [ ] Tambah preview foto di modal create/edit
- [ ] Tambah tombol delete di preview
- [ ] Tampilkan foto di tabel driver list

---

### 3. Admin - Request Detail (Attachments/Lampiran)
**File**: `frontend/src/views/admin/RequestDetail.vue`

**Yang perlu ditambahkan:**
- [ ] Edit lampiran (upload tambahan/replace)
- [ ] Delete lampiran individual
- [ ] Preview dengan ImageLightbox yang lebih baik
- [ ] Drag & drop untuk upload

**Backend API:**
- [ ] DELETE `/api/requests/{id}/attachments/{attachmentIndex}` - Delete lampiran
- [ ] PUT `/api/requests/{id}/attachments` - Update/replace lampiran
- [ ] Update controller untuk handle attachment management

**Komponen UI:**
- [ ] Tambah tombol edit/delete di setiap attachment
- [ ] Drop zone untuk upload tambahan
- [ ] Progress bar saat upload
- [ ] Integrasi FilePreviewGrid untuk display

---

### 4. Buyer - Request Detail (Attachments/Lampiran)
**File**: `frontend/src/views/buyer/RequestDetail.vue`

**Yang perlu ditambahkan:**
- [ ] Edit lampiran (upload tambahan/replace) - sesuai status
- [ ] Delete lampiran individual
- [ ] Preview dengan ImageLightbox
- [ ] Tampilan grid yang lebih baik

**Backend API:**
- [ ] DELETE `/api/buyer/requests/{id}/attachments/{attachmentIndex}`
- [ ] PUT `/api/buyer/requests/{id}/attachments`
- [ ] Update BuyerRequestActionsController

**Komponen UI:**
- [ ] Tambah tombol edit/delete (sesuai permission)
- [ ] FilePreviewGrid untuk display
- [ ] ImageLightbox untuk preview

---

### 5. Buyer - Settings (Avatar)
**File**: `frontend/src/views/buyer/Settings.vue`

**Status**: ✅ Sudah ada upload avatar
**Yang perlu diverifikasi:**
- [ ] Konfirmasi upload avatar berfungsi
- [ ] Preview avatar setelah upload
- [ ] Error handling untuk file terlalu besar
- [ ] Compression berjalan dengan baik

---

### 6. Admin - Product Options (Foto Produk)
**File**: `frontend/src/views/admin/RequestDetail.vue` (bagian Options Modal)

**Yang perlu ditambahkan:**
- [ ] Delete foto individual dari option
- [ ] Edit/replace foto yang sudah ada
- [ ] Preview foto dengan lightbox

**Backend API:**
- [ ] DELETE `/api/requests/{id}/options/{optionId}/images/{imageIndex}`
- [ ] PUT `/api/requests/{id}/options/{optionId}/images`

**Komponen UI:**
- [ ] Tombol delete di setiap foto option
- [ ] Preview lightbox saat klik foto

---

### 7. Komponen通用 (Reusable Components)

#### FilePreviewGrid.vue
**Status**: ✅ Sudah ada
**Yang perlu ditingkatkan:**
- [ ] Support untuk server URLs (bukan hanya local files)
- [ ] Edit mode dengan tombol delete
- [ ] Loading state saat fetch
- [ ] Error state untuk failed loads

#### FilePreviewOverlay.vue
**Status**: ✅ Sudah ada
**Yang perlu ditingkatkan:**
- [ ] Navigation (prev/next) untuk multiple images
- [ ] Zoom functionality
- [ ] Share/download button
- [ ] Fullscreen toggle

#### ImageLightbox.vue
**Status**: ✅ Sudah ada
**Yang perlu ditingkatkan:**
- [ ] Keyboard navigation (arrow keys, ESC)
- [ ] Touch/swipe support untuk mobile
- [ ] Thumbnail strip untuk navigasi cepat

#### FileUpload.vue
**Status**: ✅ Sudah ada
**Yang perlu ditingkatkan:**
- [ ] Better drag & drop visual feedback
- [ ] Upload queue management
- [ ] Retry failed uploads
- [ ] Cancel upload functionality

---

## Backend Implementation

### Database Schema Updates
```sql
-- Tabel suppliers
ALTER TABLE suppliers ADD COLUMN logo_url VARCHAR(500) NULL;

-- Tabel drivers
ALTER TABLE drivers ADD COLUMN photo_url VARCHAR(500) NULL;

-- Tabel requests (jika belum ada)
ALTER TABLE requests ADD COLUMN attachments JSON NULL;
```

### New API Endpoints

#### File Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | ✅ Already exists |
| DELETE | `/api/upload/{id}` | Delete uploaded file |
| GET | `/api/files/{id}` | Get file metadata |

#### Supplier Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/suppliers` | ✅ Already exists |
| PUT | `/api/suppliers/{id}` | Update supplier (handle logo) |
| DELETE | `/api/suppliers/{id}/logo` | Delete supplier logo |
| POST | `/api/suppliers/{id}/logo` | Upload supplier logo |

#### Driver Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/drivers` | ✅ Already exists |
| PUT | `/api/drivers/{id}` | Update driver (handle photo) |
| DELETE | `/api/drivers/{id}/photo` | Delete driver photo |
| POST | `/api/drivers/{id}/photo` | Upload driver photo |

#### Request Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests/{id}` | ✅ Already exists |
| PUT | `/api/requests/{id}/attachments` | Update attachments |
| DELETE | `/api/requests/{id}/attachments/{index}` | Delete attachment |
| POST | `/api/requests/{id}/attachments/add` | Add new attachments |

#### Buyer Request Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/buyer/requests/{id}/attachments` | Update attachments |
| DELETE | `/api/buyer/requests/{id}/attachments/{index}` | Delete attachment |

#### Product Options Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests/{id}/options/{optionId}/images` | Add images to option |
| DELETE | `/api/requests/{id}/options/{optionId}/images/{imageIndex}` | Delete image |
| PUT | `/api/requests/{id}/options/{optionId}/images/{imageIndex}` | Replace image |

---

## Frontend Implementation

### Komponen Baru yang Perlu Dibuat

#### 1. ImageGallery.vue
```vue
<!-- Komponen untuk display grid gambar dengan: -->
<!-- - Thumbnail grid -->
<!-- - Lightbox preview -->
<!-- - Edit/Delete buttons -->
<!-- - Upload drop zone -->
```

#### 2. ImageUploader.vue
```vue
<!-- Komponen upload dengan: -->
<!-- - Drag & drop -->
<!-- - Preview thumbnails -->
<!-- - Progress indicator -->
<!-- - Delete button per image -->
```

#### 3. AvatarUploader.vue
```vue
<!-- Komponen upload avatar dengan: -->
<!-- - Crop functionality -->
<!-- - Preview circular -->
<!-- - Compression -->
```

### Composables yang Perlu Dibuat/Diperbaiki

#### useImageUpload.js
```javascript
// Enhanced version dari useFileUpload.js
// dengan fitur:
// - Automatic compression
// - Server URL handling
// - Delete functionality
// - Retry mechanism
```

#### useImageGallery.js
```javascript
// Manage gallery state
// - Load images
// - Add new images
// - Delete images
// - Reorder images
// - Sync with server
```

---

## Implementation Steps

### Phase 1: Backend Foundation
1. [ ] Buat migration untuk add columns (logo_url, photo_url)
2. [ ] Update FileUploadController - add delete endpoint
3. [ ] Update SupplierController - handle logo upload/update/delete
4. [ ] Update DriverController - handle photo upload/update/delete
5. [ ] Update RequestController - handle attachments CRUD
6. [ ] Update BuyerRequestActionsController - handle attachments CRUD
7. [ ] Test semua API endpoints

### Phase 2: Core Components
1. [ ] Enhance FilePreviewGrid.vue
2. [ ] Enhance FilePreviewOverlay.vue
3. [ ] Enhance ImageLightbox.vue
4. [ ] Create ImageGallery.vue component
5. [ ] Create ImageUploader.vue component
6. [ ] Test components in isolation

### Phase 3: Feature Implementation
1. [ ] Implement Suppliers image upload
2. [ ] Implement Drivers image upload
3. [ ] Implement Request attachments CRUD (Admin)
4. [ ] Implement Request attachments CRUD (Buyer)
5. [ ] Implement Product Options images CRUD
6. [ ] Integrate all components

### Phase 4: Testing & Polish
1. [ ] E2E testing untuk semua flows
2. [ ] Mobile responsiveness testing
3. [ ] Error handling verification
4. [ ] Performance optimization
5. [ ] Documentation update

---

## File Changes Summary

### Backend Files
| File | Changes |
|------|---------|
| `app/Http/Controllers/FileUploadController.php` | Add delete method |
| `app/Http/Controllers/SupplierController.php` | Add logo CRUD methods |
| `app/Http/Controllers/DriverController.php` | Add photo CRUD methods |
| `app/Http/Controllers/RequestController.php` | Add attachments CRUD |
| `app/Http/Controllers/BuyerRequestActionsController.php` | Add attachments CRUD |
| `routes/api.php` | Add new routes |
| `database/migrations/` | Add new migration files |

### Frontend Files
| File | Changes |
|------|---------|
| `frontend/src/components/ui/FilePreviewGrid.vue` | Enhance |
| `frontend/src/components/ui/FilePreviewOverlay.vue` | Enhance |
| `frontend/src/components/ui/ImageLightbox.vue` | Enhance |
| `frontend/src/components/ui/ImageGallery.vue` | **New** |
| `frontend/src/components/ui/ImageUploader.vue` | **New** |
| `frontend/src/views/admin/Suppliers.vue` | Add logo upload |
| `frontend/src/views/admin/Drivers.vue` | Add photo upload |
| `frontend/src/views/admin/RequestDetail.vue` | Add attachments CRUD |
| `frontend/src/views/buyer/RequestDetail.vue` | Add attachments CRUD |
| `frontend/src/views/buyer/Settings.vue` | Verify avatar upload |
| `frontend/src/composables/useImageUpload.js` | **New** |
| `frontend/src/composables/useImageGallery.js` | **New** |

### Frontend API Services
| File | Changes |
|------|---------|
| `frontend/src/api/supplierService.js` | Add logo methods |
| `frontend/src/api/driverService.js` | Add photo methods |
| `frontend/src/api/requestService.js` | Add attachments methods |
| `frontend/src/api/adminService.js` | Add attachments methods |

---

## Testing Checklist

### Unit Tests
- [ ] File upload validation
- [ ] Image compression
- [ ] API response handling
- [ ] Error states

### Integration Tests
- [ ] Upload flow end-to-end
- [ ] Delete flow end-to-end
- [ ] Update flow end-to-end
- [ ] Preview flow end-to-end

### E2E Tests (Playwright)
- [ ] Supplier create with logo
- [ ] Supplier edit logo
- [ ] Driver create with photo
- [ ] Driver edit photo
- [ ] Request attachments upload
- [ ] Request attachments delete
- [ ] Request attachments update
- [ ] Image lightbox navigation

---

## Success Criteria

1. ✅ Semua fitur bisa upload gambar dengan preview
2. ✅ Semua fitur bisa delete gambar
3. ✅ Semua fitur bisa update/edit gambar
4. ✅ Image lightbox berfungsi dengan baik
5. ✅ Mobile responsive
6. ✅ Error handling yang baik
7. ✅ Loading states yang jelas
8. ✅ Compression berfungsi untuk optimize storage
9. ✅ Dark mode support
10. ✅ Multi-language support (i18n)

---

## Notes
- Tidak perlu hemat token - implementasi lengkap
- Tidak perlu buat file .md baru lagi setelah ini
- Progress akan dilaporkan ke user saat Act mode

---

## E2E Testing Strategy

### Test Script: `backend/test-image-crud.cjs`

Mengacu pada pola dari `backend/test-otonom.cjs` yang sudah ada, buat comprehensive E2E test dengan Playwright.

#### Fitur yang akan di-test:

1. **Test: Admin Login**
   - Login via demo Admin button
   - Verify auth token
   - Redirect to dashboard

2. **Test: Supplier Image CRUD**
   - Create supplier dengan logo upload
   - Edit supplier - replace logo
   - Delete supplier logo
   - View supplier dengan lightbox preview

3. **Test: Driver Image CRUD**
   - Create driver dengan photo upload
   - Edit driver - replace photo
   - Delete driver photo
   - View driver list dengan avatar

4. **Test: Request Attachments CRUD**
   - View request detail dengan attachments
   - Add new attachment
   - Delete attachment
   - Preview dengan lightbox

5. **Test: Product Options Image CRUD**
   - Create option dengan photos
   - Edit option - replace photos
   - Delete individual photo
   - Preview dengan lightbox

6. **Test: Buyer Login & Image Upload**
   - Login via demo Buyer button
   - Create RFQ dengan image upload
   - View request dengan image preview
   - Edit request attachments

#### Test Configuration:
```javascript
const CONFIG = {
  frontendUrl: 'http://localhost:5179',
  backendUrl: 'http://localhost:8002',
  headless: false,  // Set true untuk CI
  timeout: 30000,
  testImage: path.resolve(__dirname, '../frontend/src/assets/hero.png'),
  credentials: {
    buyer: { email: 'buyer@africhina.com', password: 'password123' },
    admin: { email: 'admin@africhina.com', password: 'password123' },
  },
  resultsDir: path.resolve(__dirname, '../test-results/image-crud'),
};
```

---

## Server Configuration

### Running Development Servers:

**Backend (Laravel) - Port 8002:**
```bash
cd backend
php artisan serve --port=8002
```

**Frontend (Vue/Vite) - Port 5179:**
```bash
cd frontend
npm run dev -- --port 5179
```

**WebSocket Bridge (if needed):**
```bash
cd backend
node ws-bridge.js
```

### Test URL:
- Frontend: http://localhost:5179
- Backend API: http://localhost:8002/api

#### Screenshot Naming Convention:
- `admin-supplier-create-{timestamp}.png`
- `admin-supplier-logo-preview-{timestamp}.png`
- `admin-driver-create-{timestamp}.png`
- `admin-driver-photo-preview-{timestamp}.png`
- `admin-request-attachments-{timestamp}.png`
- `buyer-rfq-image-upload-{timestamp}.png`

#### Test Run Command:
```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 node backend/test-image-crud.cjs
```

### Bug Fix Loop:
1. Run test → Capture screenshot on failure
2. Identify UI/Backend issue from screenshot + console logs
3. Fix the issue
4. Re-run test
5. Repeat until all tests pass

### Success Criteria:
- [ ] All image CRUD operations work
- [ ] No console errors
- [ ] All screenshots captured
- [ ] Test report generated

---

**Created**: 2026-08-01
**Last Updated**: 2026-08-01
**Status**: 📋 Ready for Implementation
