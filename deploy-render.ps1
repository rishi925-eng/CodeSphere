# Render Backend Deployment Script
Write-Host "=== Render Backend Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "Update configuration for Render deployment"
}

Write-Host "Repository ready for deployment" -ForegroundColor Green
Write-Host ""

# Test local build
Write-Host "=== Testing Local Build ===" -ForegroundColor Cyan
Set-Location backend
Write-Host "Running: npm run build" -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
} else {
    Write-Host "Build failed. Fix errors before deploying." -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# Check if GitHub remote exists
Write-Host "=== GitHub Configuration ===" -ForegroundColor Cyan
$remotes = git remote -v 2>$null
if (-not $remotes) {
    Write-Host "No Git remote configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To add GitHub remote, run:" -ForegroundColor Cyan
    Write-Host '  git remote add origin https://github.com/YOUR_USERNAME/CodeSphere.git' -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "Git remote configured:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    Write-Host "Ready to push! Run:" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "=== Deployment Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Push to GitHub" -ForegroundColor Yellow
Write-Host "  git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "Step 2: Deploy on Render" -ForegroundColor Yellow
Write-Host "  1. Go to: https://dashboard.render.com/" -ForegroundColor Gray
Write-Host "  2. Click New -> Web Service" -ForegroundColor Gray
Write-Host "  3. Connect your repository" -ForegroundColor Gray
Write-Host "  4. Configure:" -ForegroundColor Gray
Write-Host "     - Name: codesphere-backend" -ForegroundColor DarkGray
Write-Host "     - Root Directory: backend" -ForegroundColor DarkGray
Write-Host "     - Build: npm install && npm run build" -ForegroundColor DarkGray
Write-Host "     - Start: npm start" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Step 3: Add Environment Variables" -ForegroundColor Yellow
Write-Host "  - MONGODB_URI" -ForegroundColor Gray
Write-Host "  - JWT_SECRET" -ForegroundColor Gray
Write-Host "  - FRONTEND_URL" -ForegroundColor Gray
Write-Host "  - NODE_ENV=production" -ForegroundColor Gray
Write-Host ""
Write-Host "See RENDER_DEPLOYMENT.md for detailed guide" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Ready to Deploy! ===" -ForegroundColor Green
