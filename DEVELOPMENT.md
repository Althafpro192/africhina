# AfriChina Web Platform - Development Guide

## 🚀 Quick Start (One Command Setup)

```bash
# 1. Install dependencies
npm install
cd backend && composer install && cd ..
cd frontend && npm install && cd ..

# 2. Setup Backend Environment
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate
cd ..

# 3. Start Development Server
npm start
```

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **PHP**: >= 8.2
- **Composer**: Latest version
- **MySQL**: 8.0+ (or SQLite for development)

## 🏃‍♂️ Running the Application

### Option 1: Single Command (Recommended)

```bash
npm start
```

This will start:
- **Laravel Backend**: http://localhost:8000
- **Vue Frontend**: http://localhost:5173

### Option 2: Manual Start

```bash
# Terminal 1 - Backend
cd backend
php artisan serve

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Option 3: Docker Development

```bash
npm run docker:up
```

Access at http://localhost (frontend) and http://localhost:5000/api (backend)

## 🔧 Configuration

### Backend Environment

Create `backend/.env` from example:

```bash
cp backend/.env.example backend/.env
php artisan key:generate
```

Key settings:
- `DB_CONNECTION=mysql` (or `sqlite` for local dev)
- `APP_URL=http://localhost`
- `VITE_API_BASE_URL=/api`

### Frontend Configuration

The frontend Vite config proxies API requests to Laravel:
- `/api/*` → `http://localhost:8000`
- `/uploads/*` → `http://localhost:8000`

## 🐛 Bug Fixes Applied

### ✅ Critical: String Concatenation (BuyerRequestActionsController.php)
- Fixed status string `'menunggu_kesepakatan_final'` that was incorrectly split
- Fixed status string `'menunggu_penawaran_admin'`

### ✅ Role Validation (MessageController.php)
- Admins can now send messages even when blocked
- Only buyers are blocked from messaging

## 📁 Project Structure

```
africhina-web/
├── backend/              # Laravel PHP API
│   ├── app/Http/Controllers/
│   ├── database/migrations/
│   ├── routes/api.php
│   └── vite.config.js
├── frontend/             # Vue 3 SPA
│   ├── src/
│   │   ├── views/       # Page components
│   │   ├── components/   # Reusable components
│   │   ├── composables/  # Vue composables
│   │   ├── locales/      # i18n translations
│   │   └── api/         # API service modules
│   └── vite.config.js
├── docker-compose.yml    # Docker setup
└── package.json         # Root scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Requests (RFQs)
- `GET /api/requests` - List buyer requests
- `POST /api/requests` - Create new request
- `GET /api/requests/{id}` - Get request details
- `PUT /api/requests/{id}` - Update request
- `POST /api/requests/{id}/select-option` - Select negotiation option

### Messages
- `GET /api/requests/{id}/messages` - Get messages
- `POST /api/requests/{id}/messages` - Send message

### Admin
- `GET /api/admin/requests` - Admin request list
- `POST /api/admin/requests/{id}/ship` - Ship order
- `POST /api/admin/requests/{id}/finalize` - Finalize deal

## 🌐 Internationalization (i18n)

Supported languages:
- 🇬🇧 English (en) - Default
- 🇮🇩 Indonesian (id)
- 🇫🇷 French (fr)
- 🇨🇳 Chinese (zh)

Translation files: `frontend/src/locales/{lang}.json`

## 🧪 Testing

```bash
# Backend tests
cd backend
php artisan test

# Frontend tests
cd frontend
npm run test
```

## 🐳 Docker Production

```bash
# Build and start
npm run docker:up

# Stop
npm run docker:down

# Rebuild
npm run docker:down && npm run docker:up
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development servers |
| `npm run dev` | Start both frontend & backend |
| `npm run build` | Build for production |
| `npm run setup` | Initial project setup |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |

## 🔒 Security Notes

- Admin users bypass message blocking
- All API routes (except auth) require JWT token
- Role-based middleware protects admin routes
- CORS configured for local development

## 📚 Additional Resources

- [Bug Report](./BUG_REPORT.md) - Known issues and fixes
- [Backend README](./backend/README.md)
- [API Documentation](./docs/)

---

**Last Updated**: July 30, 2026
