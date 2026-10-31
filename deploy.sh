#!/usr/bin/env bash
# ==============================================================================
# Brightloop Subscription Management System - Production Deployment Automation
# ==============================================================================
set -euo pipefail

echo "======================================================================"
echo "  Deploying Brightloop Subscription & Billing Management Platform"
echo "======================================================================"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo >&2 "Error: Docker is required but not installed. Aborting."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1 || { echo >&2 "Error: Docker Compose is required. Aborting."; exit 1; }

COMPOSE="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE="docker-compose"
fi

# Prepare environment file if missing
if [ ! -f .env ]; then
  echo "--> Initializing .env from .env.example..."
  cp .env.example .env
fi

# Build images
echo "--> Building container images for Backend API and Frontend SPA..."
$COMPOSE build --no-cache backend frontend

# Start multi-container stack
echo "--> Launching multi-tier services..."
$COMPOSE up -d

echo "--> Waiting for services to become healthy..."
sleep 5

# Check status
$COMPOSE ps

echo "======================================================================"
echo "  Deployment Complete! Accessible Services:"
echo "  - Frontend SPA Web Client:     http://localhost:3000"
echo "  - Backend REST API Gateway:    http://localhost:5000"
echo "  - API Health Check:            http://localhost:5000/health"
echo "  - Odoo ERP Core Instance:      http://localhost:8069"
echo "======================================================================"

