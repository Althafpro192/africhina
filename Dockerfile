# ============================================
# STAGE 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies frontend
RUN npm ci

# Copy seluruh source frontend
COPY frontend/ .

# Build frontend → dist/
RUN npm run build

# ============================================
# STAGE 2: Build Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies backend
RUN npm ci

# Copy seluruh source backend
COPY backend/ .

# ============================================
# STAGE 3: Production Image (Final)
# ============================================
FROM node:20-alpine

# Install bash & postgresql client (opsional)
RUN apk add --no-cache postgresql-client bash

WORKDIR /app

# Copy backend (tanpa node_modules, akan di-install ulang production)
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/ ./backend/

# 🔥 Langkah manual: hapus public & salin dist dari frontend builder
RUN rm -rf /app/backend/public
COPY --from=frontend-builder /app/frontend/dist /app/backend/public

WORKDIR /app/backend

# Install hanya production dependencies
RUN npm ci --only=production && npm cache clean --force

# Buat user non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["npm", "start"]
