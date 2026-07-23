# 🌍 AfriChina Bridge - Web Platform

**Digital Supply Chain & Sourcing Platform between Africa and China**

![Status](https://img.shields.io/badge/status-Active-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)
![Architecture](https://img.shields.io/badge/architecture-Node.js%20%7C%20Express%20%7C%20Vue%203%20%7C%20PostgreSQL-indigo?style=flat-square)

---

## 🛠️ Technical Stack & Architecture

- **Backend**: Node.js ES Modules, Express.js 5.x, PostgreSQL 14+ via `pg` pool (strictly parameterized queries).
- **Frontend**: Vue 3 Composition API (`<script setup>`), Vite 8, Vue Router, TailwindCSS.
- **Real-time Engine**: `socket.io` v4.8.3 with Room Isolation (`room:nego-{negotiationId}`) and JWT handshake authentication.
- **Cloud Storage Abstraction**: `StorageService` supporting `LocalStorageDriver` and `S3StorageDriver` (configurable via `.env`).
- **Icons**: Local offline `Material Symbols Outlined` variable font (`.woff2`) to optimize FCP and eliminate CDN latency.

---

## 🔑 Environment Variables Setup

Create `.env` in the `backend/` directory:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:5000

# Database Configuration
DATABASE_URL=postgres://postgres:password@localhost:5432/africhina

# Cloud Storage Abstraction (local or s3)
STORAGE_DRIVER=local
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=africhina-bucket
```

---

## 🗄️ PostgreSQL Database Migrations

Apply performance indexes, check constraints, and temporary password schema fields:

```bash
# Execute migration 001 for indexes & CHECK constraints
psql $DATABASE_URL -f backend/migrations/001_add_indexes_and_constraints.sql

# Execute migration 002 for temporary password fields
psql $DATABASE_URL -f backend/migrations/002_add_temp_password_fields.sql
```

---

## 🎨 Local Material Symbols Icon Download

To eliminate Google Fonts CDN latency and ensure complete offline functionality:

```bash
# Download .woff2 font file and generate local CSS
npm run icons:download
```

This populates `frontend/public/fonts/material-symbols.woff2` and `frontend/public/css/material-icons-local.css`.

---

## 🧹 Maintenance & Cleanup

Recursively delete obsolete `.bak` and `.tmp` files:

```bash
chmod +x cleanup.sh
./cleanup.sh
```

---

## 📘 Admin Manual: Temporary Password Flow

> [!IMPORTANT]
> **Mandatory Workflow**: This application does **NOT** use automated email password reset links.

### Workflow Steps:
1. **Buyer Request**: Buyer contacts Admin offline (via phone, WhatsApp, or email) stating they forgot their password.
2. **Admin Action**:
   - Log into the Admin Dashboard (`/admin/dashboard`).
   - Locate the Buyer's sourcing request row or profile in the table.
   - Click the **"Generate Temporary Password"** key icon (`key`).
3. **Password Generation**:
   - Click **"Generate Temporary Password"** in the modal.
   - The server creates a cryptographically secure 12-character alphanumeric code, hashes it with bcrypt, and sets a strict 24-hour expiration (`temp_password_expires_at`).
   - The plaintext code is returned in the API response **only once** for the Admin to copy.
4. **Secure Communication**:
   - Admin copies the temporary password and sends it directly to the Buyer via a secure communication channel.
5. **Buyer First Login & Forced Password Change**:
   - Buyer logs in at `/login` using their email and the temporary password.
   - The system sets `mustChangePassword: true` in the JWT session.
   - Buyer is automatically redirected to `/set-new-password`.
   - Upon submitting a new permanent password, `temp_password_hash` and `temp_password_expires_at` are cleared to `NULL`.

---

## 🧪 Running Unit Tests

Run Vitest test suite for backend controllers, `StorageService`, and `useChat` composable:

```bash
npx vitest run
```

---

**© 2026 AfriChina Bridge – Building Cross-Continental Digital Trust**