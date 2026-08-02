# FIX VERIFICATION REPORT — `/buyer/rfq/create` Image Upload

## 1. User Report

> "http://localhost:8000/buyer/rfq/019fbe81-e5bc-73b1-9e9f-09196fe9de4e di sini
> sudah benar edti nya tapi di http://localhost:8000/buyer/rfq/create aku tidak bisa
> upload gambar seperti di edit nya"
>
> Translation: "The EDIT page is correct, but at /buyer/rfq/create I cannot upload
> images like in the edit."

## 2. Symptom Reproduction

On the CREATE page, after picking a file and clicking submit, the form aborted
with the inline error:

```
Some files failed to upload. Please try again.
```

The EDIT page (in-place edits on `RequestDetail.vue`) had no such error — uploads
worked there.

## 3. Architectural Difference Found

| Flow | EDIT page | CREATE page |
|---|---|---|
| Upload transport | **axios** (reuses interceptor → adds Bearer + CSRF) | **Raw `XMLHttpRequest`** (no interceptor) |
| When files go up | Single step: append raw `File` to FormData on submit | Two step: pre-upload each file → get URL string → append URL strings to FormData |
| Field sent | `multipart/form-data` with `images[]` of `File` blobs | `multipart/form-data` with `images[]` of URL strings |
| Source | [`requestService.updateRequestDetails()`](frontend/src/api/requestService.js:38) | [`useFileUpload.uploadFile()`](frontend/src/composables/useFileUpload.js:209) |

The CREATE flow sends `POST /api/upload` via XHR (asynchronous file-by-file
pre-upload so the user sees per-file progress). The XHR object bypasses axios's
request interceptor, so the **`Authorization: Bearer <token>`** header and
`withCredentials` flag were never sent. The `auth:sanctum` middleware in
[`backend/routes/api.php:29`](backend/routes/api.php:29) then rejected the
request with `401 Unauthenticated`, the `errors` array got populated, and
[`submitRequest()` in `RFQCreate.vue`](frontend/src/views/buyer/RFQCreate.vue:402)
returned early with the toast error.

## 4. Fix Applied

Two-line surgical patch in [`frontend/src/composables/useFileUpload.js`](frontend/src/composables/useFileUpload.js):

```javascript
// added import
import { getStoredToken } from '../api/axios.js';

// inside uploadFile()'s xhr setup, right before xhr.send():
xhr.withCredentials = true;
const token = getStoredToken();
if (token) {
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
}
```

This matches the behavior of the global axios instance (which already does the
same thing in its request interceptor at [`frontend/src/api/axios.js:21`](frontend/src/api/axios.js:21)).

## 5. Verification

### 5.1 API-level (proof of bug)

```
POST /api/upload  (no auth)         → HTTP 401 Unauthenticated
POST /api/upload  (Bearer token)    → HTTP 200, returns { url: "/storage/uploads/..." }
```

### 5.2 End-to-end Chrome test (proof of fix)

[`backend/test-rfq-create-upload-autonomous.cjs`](backend/test-rfq-create-upload-autonomous.cjs)
executed with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` against Google Chrome.

Results:

```
[LOGIN]   Logged in → http://localhost:8000/buyer/dashboard
[NAV]     /buyer/rfq/create → HTTP 200, form visible
[FILL]    Product Name, Category, Sub Category, Specs, Qty, Budget, Date, Shipping, Payment
[UPLOAD]  File set on hidden input
[SUBMIT]  Redirected to http://localhost:8000/buyer/requests
[VERIFY]  GET /api/requests             → HTTP 200, list size 18
[VERIFY]  GET /api/requests/{id}        → HTTP 200
[VERIFY]  image_urls on latest request:
          ["/storage/uploads/3dc60501-09bc-4598-8404-2f7bc61edba2.png"]
[FORENSICS]  POST /api/upload  Authorization=Bearer 181|CWkvfPKsXQ71Ux3g2n4…
========================================
RESULT: PASS
========================================
```

The XHR now correctly carries the `Authorization: Bearer …` header, the upload
returned 200, the resulting URL was appended to the FormData as `images[]`,
the request was created, the user was redirected to `/buyer/requests`, and
the new request has the persisted `image_urls` row in the DB.

Screenshots written to
`backend/test-results/rfq-create-upload/0[1-7]-*.png`:

| # | Screenshot | Description |
|---|---|---|
| 1 | `01-login-filled-*.png` | Login form filled |
| 2 | `02-after-login-*.png` | Buyer dashboard after login |
| 3 | `03-rfq-create-loaded-*.png` | `/buyer/rfq/create` rendered |
| 4 | `04-form-filled-*.png` | All required fields populated |
| 5 | `05-file-selected-*.png` | File upload preview visible |
| 6 | `06-requests-list-*.png` | Redirected to `/buyer/requests` |
| 7 | `07-final-verified-*.png` | New request confirmed in list |

## 6. Files Touched

| File | Change |
|---|---|
| `frontend/src/composables/useFileUpload.js` | Added `getStoredToken` import + `xhr.withCredentials = true` + `Authorization: Bearer …` header on upload XHR |
| `backend/public/index.php` | Restored from git (was wiped by `rsync --delete` of frontend dist) |
| `backend/test-rfq-create-upload-autonomous.cjs` | New autonomous E2E test for the fix |

## 7. Outstanding / Recommended Follow-ups

- **Rsync risk:** `rsync -av --delete frontend/dist/ backend/public/` deletes
  any file in `backend/public/` that is not in `frontend/dist/`, including
  `index.php` and `.htaccess`. Replace with `rsync -a --delete
  --exclude=index.php --exclude=.htaccess …` (or copy without `--delete`) to
  prevent recurring HTTP 500 errors when dist syncing.
- **Long-term:** The XHR/axios asymmetry is brittle. A cleaner refactor would
  route the pre-upload through the same `api` axios instance (or a shared
  helper) so interceptor-managed headers/credentials can never be skipped.
