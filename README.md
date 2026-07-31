# 🌍 AfriChina Bridge — Web Platform

**Digital Supply Chain & Sourcing Platform connecting Africa and China**

![Status](https://img.shields.io/badge/status-Active-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)
![Architecture](https://img.shields.io/badge/architecture-Laravel%2013%20%7C%20Vue%203%20%7C%20MySQL-indigo?style=flat-square)

---

## 🛠️ Technical Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 13 (PHP 8.3), MySQL 8+, Sanctum (SPA auth) |
| **Frontend** | Vue 3 Composition API, Vite, TailwindCSS, Vue Router |
| **Real-time** | Laravel Reverb (WebSocket) |
| **Auth** | Sanctum token-based; temp-password forced-reset flow |
| **Icons** | Local Material Symbols (offline `.woff2`) |

---

## ⚙️ Prerequisites

- PHP 8.3+ with extensions: `pdo_mysql`, `openssl`, `mbstring`, ` tokenizer`, `xml`, `ctype`, `json`
- Composer 2.x
- laravel
- MySQL 8+ (or MariaDB 10.6+)
- Git

---

## � Local Setup

### 1. Clone & install backend dependencies

```bash
cd backend
composer install
cp .env.example .env
# Edit .env — set DB_* credentials for your local MySQL instance
php artisan key:generate
php artisan migrate --force
```

> **Database:** The `DB_*` vars in `backend/.env` must point to your MySQL server.
> Example for a local MySQL on the default port with user `root` and password `secret`:
> ```
> DB_CONNECTION=mysql
> DB_HOST=127.0.0.1
> DB_PORT=3306
> DB_DATABASE=africhina
> DB_USERNAME=root
> DB_PASSWORD=secret
> ```

### 2. (Optional) Run database seeders

```bash
php artisan db:seed
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
cp .env.production.example .env
# Set VITE_API_BASE_URL if your Laravel API runs on a non-default port.
# Default: http://localhost:8000/api
```

### 4. Run the development servers

```bash
# Terminal 1 — Laravel API + Reverb (WebSocket)
cd backend
php artisan serve --port=8000

# Terminal 2 — Vite dev server (frontend)
cd frontend
npm run dev
```

The frontend is served at `http://localhost:5173` and proxies API calls to
`http://localhost:8000`. All requests are forced to `Accept: application/json`
so no HTML error pages are ever returned.

---

## 🔐 Authentication Flow

The platform uses **Laravel Sanctum** with bearer tokens. The flow:

1. **Login** — `POST /api/auth/login` → returns `{ user, token }`.
   - The token is stored in `localStorage` (`auth_token`) and sent as an
     `Authorization: Bearer <token>` header.
   - If the user has a temporary password, `mustChangePassword: true` is
     returned and the token ability is scoped to `must-change-password`.
2. **Forced password change** — users with `mustChangePassword: true` are
   redirected to `/set-new-password` on the frontend and can only call
   `POST /api/auth/change-password`.
3. **Logout** — `POST /api/auth/logout` revokes the current token.

### Temporary Password (Admin-Managed Reset)

> [!IMPORTANT]
> This app does **NOT** send automated password-reset emails.
> All resets go through the admin.

| Actor | Action |
|---|---|
| Buyer | Contacts admin offline; requests password reset. |
| Admin | Logs in → Buyer profile → **Generate Temporary Password** |
| Admin | Sends the 12-char code to the buyer via a secure channel. |
| Buyer | Logs in at `/login` → redirected to `/set-new-password` → sets new password. |

---

## 🌐 Environment Variables

### Backend (`backend/.env`)

```env
# Application
APP_KEY=base64:<your-key>
APP_ENV=local          # production for deployment
APP_DEBUG=true         # false in production

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=africhina
DB_USERNAME=root
DB_PASSWORD=<your-password>

# CORS — comma-separated list of trusted origins (no trailing slash)
CORS_ORIGINS=http://localhost:5173,http://localhost:5000

# Sanctum / Auth
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Temporary password expiry (hours)
TEMP_PASSWORD_EXPIRY_HOURS=24
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🗄️ Migrations

Laravel migrations create the complete schema. Run after each `git pull`:

```bash
cd backend
php artisan migrate --force
```

Additional SQL migrations in the root `migrations/` folder are **legacy**
PostgreSQL scripts for the old Node.js backend and are not needed for the
current Laravel backend.

---

## 🎨 Icons

Material Symbols are bundled locally to eliminate Google Fonts CDN latency:

```bash
cd frontend
npm run icons:download
```

---

## 🧪 Running Tests

```bash
# Backend (PHPUnit)
cd backend
php artisan test

# Frontend (Vitest)
cd frontend
npm run test
```

---

## 📁 Project Structure (key paths)

```
backend/
  app/Http/
    Controllers/          # API controllers
    Middleware/           # ForceJsonResponse, EnsurePasswordChanged, CheckAdminRole
  config/
    cors.php              # CORS settings
  database/
    migrations/           # Laravel migrations (authoritative schema)
    factories/            # Test factories
  routes/
    api.php               # All API routes
    web.php               # SPA fallback + file serving

frontend/
  src/
    api/                  # Axios + service modules (authService, requestService, …)
    views/
      buyer/              # Buyer-facing pages
      admin/              # Admin-facing pages
      auth/               # Login, SetNewPassword
    router/index.js       # Vue Router with auth guards
    locales/              # i18n (en, fr, zh, id)
```

---

## 🔒 Security Notes

- `Authorization: Bearer <token>` header is required on all protected routes.
- CORS origins are validated strictly — wildcard (`*`) is never used.
- HTML error pages are disabled for all `/api/*` routes.
- Temporary passwords expire after 24 h and are hashed with bcrypt.
- Token revocation on logout (`tokens()->delete()`).

---

**© 2026 AfriChina Bridge — Building Cross-Continental Digital Trust**
