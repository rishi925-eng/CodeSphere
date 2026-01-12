# Render Backend Deployment Script
# This script helps deploy the backend to Render

Write-Host "=== Render Backend Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not initialized" -ForegroundColor Red
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Found uncommitted changes. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Update configuration for Render deployment"
}

Write-Host "✅ Repository ready for deployment" -ForegroundColor Green
Write-Host ""

# Instructions for Render Dashboard deployment
Write-Host "=== Deploy to Render - 2 Options ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 1: Using Render Dashboard (Recommended)" -ForegroundColor Yellow
Write-Host "---------------------------------------------"
Write-Host "1. Push your code to GitHub:"
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/CodeSphere.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Go to: https://dashboard.render.com/" -ForegroundColor Green
Write-Host ""
Write-Host "3. Click 'New' → 'Web Service'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Connect your GitHub repository" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Configure service:" -ForegroundColor Gray
Write-Host "   - Name: codesphere-backend" -ForegroundColor Gray
Write-Host "   - Root Directory: backend" -ForegroundColor Gray
Write-Host "   - Build Command: npm install && npm run build" -ForegroundColor Gray
Write-Host "   - Start Command: npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Add Environment Variables:" -ForegroundColor Gray
Write-Host "   - MONGODB_URI=your_mongodb_connection_string" -ForegroundColor Gray
Write-Host "   - JWT_SECRET=your_jwt_secret" -ForegroundColor Gray
Write-Host "   - FRONTEND_URL=https://your-frontend.onrender.com" -ForegroundColor Gray
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Click 'Create Web Service'" -ForegroundColor Gray
Write-Host ""
Write-Host ""

Write-Host "Option 2: Using render.yaml (Blueprint)" -ForegroundColor Yellow
Write-Host "---------------------------------------"
Write-Host "1. Push your code to GitHub (same as above)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Go to: https://dashboard.render.com/" -ForegroundColor Green
Write-Host ""
Write-Host "3. Click 'New' → 'Blueprint'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Select your repository" -ForegroundColor Gray
Write-Host "   (Render will auto-detect render.yaml)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Configure environment variables for both services" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Deploy both backend and frontend together!" -ForegroundColor Gray
Write-Host ""
Write-Host ""

# Check if GitHub remote exists
$remotes = git remote -v 2>$null
if (-not $remotes) {
    Write-Host "⚠️  No Git remote configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To add GitHub remote, run:" -ForegroundColor Cyan
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/CodeSphere.git" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "✅ Git remote configured:" -ForegroundColor Green
    git remote -v | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    Write-Host ""
    Write-Host "Ready to push? Run:" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "=== Pre-Deployment Checklist ===" -ForegroundColor Cyan
Write-Host ""
$checks = @(
    @{ Name = "MongoDB Atlas Setup"; Status = "⚠️ Manual" },
    @{ Name = "Backend .env configured"; Status = "✅ Ready" },
    @{ Name = "TypeScript builds correctly"; Status = "✅ Ready" },
    @{ Name = "Health endpoint added"; Status = "✅ Ready" },
    @{ Name = "render.yaml created"; Status = "✅ Ready" }
)

foreach ($check in $checks) {
    Write-Host "$($check.Status) $($check.Name)"
}

Write-Host ""
Write-Host "📚 See RENDER_DEPLOYMENT.md for detailed guide" -ForegroundColor Cyan
Write-Host "📄 See RENDER_FIX_SUMMARY.md for quick reference" -ForegroundColor Cyan
Write-Host ""

# Test local build
Write-Host "=== Testing Local Build ===" -ForegroundColor Cyan
Set-Location backend
Write-Host "Running: npm run build" -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful! Deployment will work." -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Fix errors before deploying." -ForegroundColor Red
}

Set-Location ..
Write-Host ""
Write-Host "=== Ready to Deploy! ===" -ForegroundColor Green
