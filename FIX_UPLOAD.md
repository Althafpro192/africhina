# Upload Bug Fix Report

**Date:** 2026-07-31  
**Issue:** Photo upload and display not working in workspace chat/RFQ

## Symptoms
- Console error: `GET http://127.0.0.1:8000/data:image/png;base64,... net::ERR_EMPTY_RESPONSE`
- Image preview not showing
- WebSocket errors (can be ignored)

## Root Causes

### 1. Wrong Backend Port in Media URL Utility
**File:** `frontend/src/utils/mediaUrl.js`
**Line:** 20

```javascript
// ❌ BEFORE (Wrong port - 5000 is WebSocket, not API)
const getBackendUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://backend:5000';
};

// ✅ AFTER (Correct port - 8000 is Laravel API)
const getBackendUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://backend:8000';
};
```

### 2. Wrong File Path Prefix in Backend
**File:** `backend/app/Http/Controllers/FileUploadController.php`
**Lines:** 93, 167, 255

```php
// ❌ BEFORE (path not accessible via public URL)
$url = '/uploads/' . $filename;

// ✅ AFTER (correct path with /storage prefix)
$url = '/storage/uploads/' . $filename;
```

### 3. Same Fix for useFileUpload.js
**File:** `frontend/src/composables/useFileUpload.js`
**Line:** 16

```javascript
// ❌ BEFORE
const API_URL = import.meta.env.VITE_API_URL || 'http://backend:5000';

// ✅ AFTER
const API_URL = import.meta.env.VITE_API_URL || 'http://backend:8000';
```

### 4. ChatComponent Using Local getMediaUrl Function
**File:** `frontend/src/components/chat/ChatComponent.vue`
**Lines:** 176, 224-230

```javascript
// ❌ BEFORE - Used local function with inconsistent URL handling
const getMediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('data:')) return path
  if (path.startsWith('http')) return path
  return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`
};

// ✅ AFTER - Import from unified utility
import { getMediaUrl } from '../../utils/mediaUrl.js';
// Local function removed - now uses the imported utility
```

Also removed duplicate `compressImage` import.

## Verification

### Backend Syntax Check
```bash
cd backend && php -l app/Http/Controllers/FileUploadController.php
# Output: No syntax errors detected
```

### Frontend Build
```bash
cd frontend && npm run build
# Output: Build successful with no errors
```

### Storage Link Status
```bash
ls -la backend/public/
# Output: storage -> /path/to/storage/app/public
#         uploads -> /path/to/storage/app/public/uploads
```

## Architecture Summary

| Component | Path | Description |
|-----------|------|-------------|
| Laravel API | Port 8000 | Main API server |
| WebSocket | Port 5000 | Socket.IO bridge |
| File Storage | `storage/app/public/uploads/` | Uploaded files |
| Public URL | `/storage/uploads/<filename>` | File access URL |
| Storage Link | `public/storage` → `storage/app/public` | Symlink for public access |

## How the Fix Works

1. **Upload Flow:**
   - User uploads file via chat/RFQ
   - `FileUploadController` stores to `storage/app/public/uploads/`
   - Returns URL: `/storage/uploads/<filename>`

2. **Display Flow:**
   - Frontend receives URL from API
   - `getMediaUrl()` prepends backend URL: `http://backend:8000`
   - Full URL: `http://backend:8000/storage/uploads/<filename>`
   - Image renders correctly

## Notes

- Chat messages with base64 data URIs (from `MessageController`) still work correctly
- The `mediaUrl.js` utility handles both data URIs and storage URLs
- Storage symlinks already exist at `backend/public/storage`

## Files Modified

1. `frontend/src/utils/mediaUrl.js` - Backend URL port fix
2. `frontend/src/composables/useFileUpload.js` - API URL port fix
3. `backend/app/Http/Controllers/FileUploadController.php` - Storage path fix
4. `frontend/src/components/chat/ChatComponent.vue` - Import unified utility
5. `backend/database/seeders/MessagesTableSeeder.php` - New seeder for test messages with images

## Test Data Seeder

Created [`backend/database/seeders/MessagesTableSeeder.php`](backend/database/seeders/MessagesTableSeeder.php) with:

- 5 test messages (3 with images, 2 text-only)
- Tiny 1x1 pixel PNG/JPG images (~70 bytes each)
- Proper data URI format: `data:image/png;base64,...`

### Running the Seeder

```bash
# Run just the messages seeder
php artisan db:seed --class=MessagesTableSeeder

# Or refresh and seed everything
php artisan migrate:fresh --seed
```

### Test Users Created
- `buyer@africhina.com` / `password123` (buyer role)
- `test@buyer.com` / `password123` (buyer role)
- `admin@africhina.com` / `admin123` (admin role)
