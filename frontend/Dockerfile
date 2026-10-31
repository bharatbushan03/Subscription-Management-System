# ==============================================================================
# Brightloop Subscription Management Frontend Client Dockerfile
# Multi-stage production build (Node.js -> Nginx Alpine)
# ==============================================================================

# Stage 1: Build the Vite production assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm ci

# Copy frontend source files & templates
COPY . .

# Run Vite production build
RUN npm run build

# Stage 2: Serve optimized static assets with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy root standalone prototype pages for reference access
COPY --from=builder /app/public /usr/share/nginx/html/public

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

