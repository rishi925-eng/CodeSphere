# CodeSphere Quick Deployment Guide for Windows

Write-Host "🚀 CodeSphere Deployment Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for deployment"
}

Write-Host ""
Write-Host "📋 Deployment Checklist:" -ForegroundColor Green
Write-Host ""

Write-Host "1. MONGODB SETUP" -ForegroundColor Yellow
Write-Host "   - Go to https://www.mongodb.com/cloud/atlas"
Write-Host "   - Create a free cluster"
Write-Host "   - Get connection string"
Write-Host "   ✓ Have you done this? (Continue when ready)"
Read-Host "Press Enter to continue"

Write-Host ""
Write-Host "2. GITHUB REPOSITORY" -ForegroundColor Yellow
Write-Host "   - Create a new repository on GitHub"
Write-Host "   - Copy the repository URL"
$repo_url = Read-Host "Enter your GitHub repository URL"

if ($repo_url) {
    Write-Host "   Adding remote..." -ForegroundColor Cyan
    git remote add origin $repo_url
    git branch -M main
    git push -u origin main
    Write-Host "   ✓ Code pushed to GitHub" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. BACKEND DEPLOYMENT (Render)" -ForegroundColor Yellow
Write-Host "   - Go to https://render.com"
Write-Host "   - Click 'New +' → 'Web Service'"
Write-Host "   - Connect your GitHub repository"
Write-Host "   - Configure:"
Write-Host "     * Name: codesphere-backend"
Write-Host "     * Root Directory: backend"
Write-Host "     * Build Command: npm install && npm run build"
Write-Host "     * Start Command: npm start"
Write-Host "   - Add environment variables from backend/.env.example"
Write-Host ""
$backend_url = Read-Host "Enter your Render backend URL (e.g., https://codesphere-backend.onrender.com)"

Write-Host ""
Write-Host "4. FRONTEND DEPLOYMENT (Vercel)" -ForegroundColor Yellow
Write-Host "   - Go to https://vercel.com"
Write-Host "   - Click 'Add New' → 'Project'"
Write-Host "   - Import your GitHub repository"
Write-Host "   - Configure:"
Write-Host "     * Framework: Vite"
Write-Host "     * Root Directory: frontend"
Write-Host "     * Build Command: npm run build"
Write-Host "     * Output Directory: dist"
Write-Host "   - Add environment variables:"
Write-Host "     * VITE_API_URL=$backend_url"
Write-Host "     * VITE_SOCKET_URL=$backend_url"
Write-Host ""
Write-Host "✓ Follow the instructions above to complete deployment" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Remember to:" -ForegroundColor Cyan
Write-Host "   1. Update backend FRONTEND_URL with your Vercel URL after deployment"
Write-Host "   2. Test all features after deployment"
Write-Host "   3. Set up custom domains if needed"
Write-Host ""
Write-Host "🎉 Happy Deploying!" -ForegroundColor Magenta

Read-Host "Press Enter to exit"
