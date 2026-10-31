# ==============================================================================
# Brightloop Billing & Subscription Backend Microservice Dockerfile
# Production-ready Node.js container
# ==============================================================================

FROM node:20-alpine AS base

# Install dumb-init for proper PID 1 signal forwarding
RUN apk add --no-cache dumb-init curl

WORKDIR /app

# Ensure non-root permissions
RUN chown -R node:node /app

# Copy dependency manifests
COPY --chown=node:node package*.json ./

# Install production dependencies only
USER node
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY --chown=node:node src/ ./src/

# Environment defaults
ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]

