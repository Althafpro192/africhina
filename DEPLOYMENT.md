# 🚀 DEPLOYMENT GUIDE: AfriChina Bridge

This document details the production deployment process for the AfriChina Bridge Global Sourcing System on an Ubuntu VPS using PM2 and NGINX.

## 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- PM2 (`npm install -g pm2`)
- Nginx (`sudo apt install nginx`)

## 2. Backend Deployment

1. Set up your production `.env` inside `/backend`:
```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/africhina
JWT_SECRET=your_secure_random_string
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
```

2. Start the backend with PM2:
```bash
cd backend
npm install
pm2 start server.js --name "africhina-api"
pm2 save
pm2 startup
```

## 3. Frontend Deployment

1. The frontend has already been built using `npm run build` which generated the `/frontend/dist` directory.
2. We will map this directory using Nginx.

## 4. NGINX Reverse Proxy Configuration

Create a new file `/etc/nginx/sites-available/africhina` and paste the following config:

```nginx
server {
    listen 80;
    server_name africhinabridge.com www.africhinabridge.com;

    # Serve the Vue.js frontend
    location / {
        root /path/to/your/project/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js Backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve Uploaded Files
    location /uploads/ {
        alias /path/to/your/project/backend/uploads/;
        autoindex off;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/africhina /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL Configuration (Optional but Recommended)
Use Certbot to secure the domain:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d africhinabridge.com -d www.africhinabridge.com
```
