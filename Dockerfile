# ============================================
# STAGE 1: Build Frontend (Vue/Vite)
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files terlebih dahulu untuk memanfaatkan Docker layer cache
COPY frontend/package*.json ./
RUN npm ci

# Copy source code frontend dan build
COPY frontend/ .
RUN npm run build

# ============================================
# STAGE 2: Prepare Backend Dependencies
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files dan install semua dependencies (termasuk devDependencies untuk build)
COPY backend/package*.json ./
RUN npm ci

# Copy seluruh source backend
COPY backend/ .

# CATATAN: Jika backend Anda menggunakan TypeScript, tambahkan baris ini:
# RUN npm run build

# ============================================
# STAGE 3: Production Image (Final)
# ============================================
FROM node:20-alpine

# Install dependency sistem: 
# - postgresql-client: untuk debugging koneksi DB dari dalam container jika diperlukan
# - bash: untuk shell script
# - dumb-init: entrypoint ringan untuk menangani sinyal PID 1 dengan benar di Node.js
RUN apk add --no-cache postgresql-client bash dumb-init

# Set environment default ke production
ENV NODE_ENV=production

WORKDIR /app

# Copy seluruh hasil dari backend-builder
COPY --from=backend-builder /app/backend/ ./backend/

# 🔥 Bersihkan folder public default (jika ada) dan salin hasil build frontend
RUN rm -rf /app/backend/public
COPY --from=frontend-builder /app/frontend/dist /app/backend/public

WORKDIR /app/backend

# Install HANYA production dependencies (menggunakan flag --omit=dev untuk npm v9+)
# Lalu bersihkan cache npm untuk memperkecil ukuran image
RUN npm ci --omit=dev && npm cache clean --force

# Buat user dan group non-root untuk keamanan (mencegah eskalasi hak akses jika container diretas)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Berikan kepemilikan folder /app kepada user nodejs SEBELUM beralih user
RUN chown -R nodejs:nodejs /app

# Beralih ke user non-root
USER nodejs

# Expose port yang digunakan oleh server.js Anda
EXPOSE 5000

# Healthcheck untuk memastikan aplikasi benar-benar berjalan dan merespons
# Sesuai dengan endpoint /health di server.js Anda
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Gunakan dumb-init sebagai entrypoint, lalu jalankan npm start
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
