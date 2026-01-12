#!/bin/bash

# CodeSphere Quick Deployment Script for Render + Vercel

echo "🚀 CodeSphere Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
fi

echo ""
echo "📋 Deployment Checklist:"
echo ""
echo "1. MONGODB SETUP"
echo "   - Go to https://www.mongodb.com/cloud/atlas"
echo "   - Create a free cluster"
echo "   - Get connection string"
echo "   ✓ Have you done this? (Continue when ready)"
read -p "Press Enter to continue..."

echo ""
echo "2. GITHUB REPOSITORY"
echo "   - Create a new repository on GitHub"
echo "   - Copy the repository URL"
read -p "Enter your GitHub repository URL: " repo_url

if [ ! -z "$repo_url" ]; then
    echo "   Adding remote..."
    git remote add origin $repo_url
    git branch -M main
    git push -u origin main
    echo "   ✓ Code pushed to GitHub"
fi

echo ""
echo "3. BACKEND DEPLOYMENT (Render)"
echo "   - Go to https://render.com"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Configure:"
echo "     * Name: codesphere-backend"
echo "     * Root Directory: backend"
echo "     * Build Command: npm install && npm run build"
echo "     * Start Command: npm start"
echo "   - Add environment variables from backend/.env.example"
echo ""
read -p "Enter your Render backend URL (e.g., https://codesphere-backend.onrender.com): " backend_url

echo ""
echo "4. FRONTEND DEPLOYMENT (Vercel)"
echo "   - Go to https://vercel.com"
echo "   - Click 'Add New' → 'Project'"
echo "   - Import your GitHub repository"
echo "   - Configure:"
echo "     * Framework: Vite"
echo "     * Root Directory: frontend"
echo "     * Build Command: npm run build"
echo "     * Output Directory: dist"
echo "   - Add environment variables:"
echo "     * VITE_API_URL=$backend_url"
echo "     * VITE_SOCKET_URL=$backend_url"
echo ""
echo "✓ Follow the instructions above to complete deployment"
echo ""
echo "📝 Remember to:"
echo "   1. Update backend FRONTEND_URL with your Vercel URL after deployment"
echo "   2. Test all features after deployment"
echo "   3. Set up custom domains if needed"
echo ""
echo "🎉 Happy Deploying!"
