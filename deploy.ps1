<#
.SYNOPSIS
  Brightloop Subscription Management System - Production Deployment Automation (PowerShell)
#>
[CmdletBinding()]
param(
    [switch]$BuildOnly,
    [switch]$NoCache
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Deploying Brightloop Subscription & Billing Management Platform" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Check Docker availability
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is required but not installed or not in PATH."
    exit 1
}

# Determine docker compose syntax
$composeCmd = "docker compose"
try {
    & docker compose version | Out-Null
} catch {
    $composeCmd = "docker-compose"
}

# Ensure .env exists
if (-not (Test-Path ".env")) {
    Write-Host "--> Initializing .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Build images
Write-Host "--> Building container images for Backend API and Frontend SPA..." -ForegroundColor Green
$cacheFlag = if ($NoCache) { "--no-cache" } else { "" }
Invoke-Expression "$composeCmd build $cacheFlag backend frontend"

if ($BuildOnly) {
    Write-Host "--> Build complete (-BuildOnly specified). Exiting." -ForegroundColor Green
    exit 0
}

# Launch stack
Write-Host "--> Launching multi-tier services..." -ForegroundColor Green
Invoke-Expression "$composeCmd up -d"

Write-Host "--> Verifying container status..." -ForegroundColor Green
Start-Sleep -Seconds 3
Invoke-Expression "$composeCmd ps"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete! Accessible Services:" -ForegroundColor Cyan
Write-Host "  - Frontend SPA Web Client:     http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend REST API Gateway:    http://localhost:5000" -ForegroundColor White
Write-Host "  - API Health Check:            http://localhost:5000/health" -ForegroundColor White
Write-Host "  - Odoo ERP Core Instance:      http://localhost:8069" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

