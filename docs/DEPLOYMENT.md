# AfriChina Web - Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
- [Troubleshooting](#troubleshooting)

---

## Overview

**AfriChina Web** is a full-stack application for connecting buyers with African suppliers. It consists of:
- **Frontend**: Vue 3 + Vite SPA served by Nginx
- **Backend**: Laravel PHP API served by PHP-FPM + Nginx
- **Database**: MySQL 8.0

The app is designed to run on a local server (no public IP) and be accessible via **Cloudflare Tunnel**.

---

## Architecture

```
[Internet] --> [Cloudflare Tunnel] --> [Your Server]
                                              |
                    ┌──────────────────────────┼──────────────────────────┐
                    |                          |                          |
              [Frontend]                   [Backend]                   [Database]
              Nginx :80                   Nginx :80                     
                                          (port 5000 exposed)         MySQL :3306
```

### Network Ports

| Service   | Internal Port | Host Port | Purpose                        |
|-----------|---------------|-----------|--------------------------------|
| Frontend  | 80            | 80        | Vue SPA (Nginx)                |
| Backend   | 80            | 5000      | Laravel API + File serving      |
| Database  | 3306          | (docker)  | MySQL                          |

### URL Structure

- **Frontend**: `http://<server-ip>:80` → serves Vue SPA
- **Backend API**: `http://<server-ip>:5000/api/...` → Laravel API
- **File Uploads**: `http://<server-ip>:5000/uploads/...` → served by Nginx in backend container

---

## Prerequisites

- Docker & Docker Compose
- MySQL 8.0 (or Docker container)
- Cloudflare account (free tier works)
- Domain name (optional, for production)
- Server with Linux (Ubuntu 22.04 recommended)

---

## Quick Start (Docker)

### 1. Clone & Configure

```bash
git clone <repo-url>
cd africhina-web

# Copy environment file
cp .env.production.example .env
```

### 2. Edit `.env` if needed

```env
DB_USER=africhina
DB_PASSWORD=160907
DB_NAME=africhina
APP_URL=http://localhost
```

### 3. Build & Run

```bash
docker compose build
docker compose up -d
```

### 4. Initialize Database

```bash
# Run migrations
docker exec africhina_backend php artisan migrate

# Seed initial data (optional)
docker exec africhina_backend php artisan db:seed
```

### 5. Verify Services

```bash
# Check container status
docker compose ps

# Test backend
curl http://localhost:5000/uploads/

# Test frontend
curl http://localhost:80
```

---

## Local Development

### Frontend (Vite Dev Server)

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# Proxies /api and /uploads to http://127.0.0.1:8000
```

### Backend (Laravel)

```bash
cd backend
composer install
php artisan migrate
php artisan serve --port=8000
# Runs on http://localhost:8000
```

### Database (if using local MySQL)

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE africhina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'africhina'@'localhost' IDENTIFIED BY '160907';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON africhina.* TO 'africhina'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

---

## Docker Deployment

### File Structure

```
africhina-web/
├── backend/
│   ├── Dockerfile          # PHP-FPM + Nginx + Laravel
│   ├── default.conf        # Nginx config (serves /uploads)
│   ├── public/
│   │   └── uploads/       # Uploaded files (bind-mounted)
│   ├── app/               # Laravel source
│   └── ...
├── frontend/
│   ├── Dockerfile         # Vue + Nginx (SPA)
│   ├── nginx.conf         # Nginx config (proxies to backend)
│   ├── src/               # Vue source
│   └── dist/              # Built assets
├── docker-compose.yml     # Orchestrates all services
└── .env                   # Environment variables
```

### Key Docker Configuration

**docker-compose.yml exposes:**
- Port `80` → Frontend (Nginx SPA)
- Port `5000` → Backend (Nginx + PHP-FPM, accessible from host)

**Backend Nginx serves uploads directly:**
```nginx
location /uploads/ {
    alias /var/www/html/public/uploads/;
    expires 30d;
    try_files $uri =404;
}
```

### Rebuilding After Changes

```bash
# Rebuild backend
docker compose build backend
docker compose up -d backend

# Rebuild frontend
docker compose build frontend
docker compose up -d frontend
```

---

## Cloudflare Tunnel Setup

### What is Cloudflare Tunnel?

Cloudflare Tunnel creates a secure connection from your server to Cloudflare's network without exposing any ports to the public internet. Your server doesn't need a public IP.

### Step 1: Install cloudflared

```bash
# On your server
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

### Step 2: Authenticate

```bash
cloudflared tunnel login
# Opens browser for Cloudflare authentication
```

### Step 3: Create a Tunnel

```bash
# Create tunnel
cloudflared tunnel create africhina-tunnel

# Note the tunnel UUID from output
```

### Step 4: Configure DNS

```bash
# Route subdomain to tunnel
cloudflared tunnel route dns africhina-tunnel africhina.yourdomain.com
```

### Step 5: Create Config File

```bash
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

```yaml
# /etc/cloudflared/config.yml
tunnel: <tunnel-uuid>
credentials-file: /root/.cloudflared/<tunnel-uuid>.json

ingress:
  # Frontend SPA
  - hostname: africhina.yourdomain.com
    service: http://localhost:80
  
  # Backend API + Uploads
  - hostname: api.yourdomain.com
    service: http://localhost:5000

  - service: http_status:404
```

### Step 6: Run as Service

```bash
# Create systemd service
sudo nano /etc/systemd/system/cloudflared.service
```

```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel run --config /etc/cloudflared/config.yml
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

### Step 7: Verify

Visit `https://africhina.yourdomain.com` — should show the AfriChina app!

---

## Troubleshooting

### Image Upload Not Displaying

**Symptom**: Image uploaded successfully but shows broken image or 404.

**Checkpoints**:

1. **File exists on disk?**
   ```bash
   ls -la backend/public/uploads/avatars/
   # Check file extension matches URL (e.g., .jpg vs .png)
   ```

2. **Backend route correct?**
   ```bash
   # The route should be in backend/routes/web.php:
   Route::get('/uploads/{path}', function ($path) {
       $publicUploads = public_path('uploads/' . $path);
       if (file_exists($publicUploads)) {
           return response()->file($publicUploads);
       }
       return response()->json(['message' => 'File not found'], 404);
   });
   ```

3. **Container serving files?**
   ```bash
   docker exec africhina_backend ls -la /var/www/html/public/uploads/avatars/
   ```

4. **Port accessible?**
   ```bash
   curl -I http://localhost:5000/uploads/avatars/<filename>
   # Should return 200 with Content-Type: image/*
   ```

5. **Extension mismatch?** (common issue!)
   - URL: `.../xxx.png`
   - File: `xxx.jpg`
   - Fix: Either rename file OR update stored URL in database

### ERR_CONNECTION_REFUSED on :5000

**Cause**: Backend container not running OR port not exposed.

**Fix**:
```bash
# Check containers
docker compose ps

# Check port binding
docker port africhina_backend

# Restart if needed
docker compose restart backend
```

### Database Connection Failed

**Check**:
```bash
docker exec africhina_backend php artisan migrate --force
```

**If using local DB instead of Docker DB**:
Update `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=africhina
DB_USERNAME=root
DB_PASSWORD=160907
```

### CORS Errors

Backend should have CORS configured. Check `backend/config/cors.php`.

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=/api   # Use /api for Docker, http://localhost:8000 for local dev
```

### Backend (.env)
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1        # Local: 127.0.0.1
# DB_HOST=db              # Docker: use service name
DB_PORT=3306
DB_DATABASE=africhina
DB_USERNAME=root
DB_PASSWORD=160907
```

---

## Useful Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# SSH into container
docker exec -it africhina_backend sh
docker exec -it africhina_frontend sh

# Restart services
docker compose restart

# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## Support

For issues, check:
1. Docker logs: `docker compose logs <service>`
2. Laravel logs: `backend/storage/logs/laravel.log`
3. Nginx error logs in container: `docker exec africhina_backend cat /var/log/nginx/error.log`
