# ======================================================
# Stage 1: Build (install dependencies)
# ======================================================
FROM node:20-alpine AS builder

WORKDIR /app/backend

# Copy package files for dependency installation
COPY backend/package*.json ./

# Install all dependencies (termasuk devDependencies untuk build)
RUN npm ci

# Copy source code
COPY backend/ .

# ======================================================
# Stage 2: Production (final image)
# ======================================================
FROM node:20-alpine

WORKDIR /app/backend

# Install only production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built source from builder
COPY --from=builder /app/backend .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (sesuai dengan PORT di server.js)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start application
CMD ["npm", "start"]
