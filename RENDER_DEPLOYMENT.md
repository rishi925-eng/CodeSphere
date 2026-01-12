# Render Deployment Guide for CodeSphere

## Backend Deployment Issues - FIXED ✅

### Problems Identified:
1. ❌ TypeScript output directory not configured
2. ❌ Package.json using development start script
3. ❌ Missing health check endpoint
4. ❌ No render.yaml configuration

### Solutions Applied:

#### 1. Fixed tsconfig.json
- ✅ Enabled `rootDir: "./src"`
- ✅ Enabled `outDir: "./dist"`
- Now TypeScript compiles correctly to `dist/` folder

#### 2. Updated package.json
```json
"scripts": {
  "start": "node dist/server.js",  // Production start
  "dev": "tsx watch src/server.ts", // Development
  "build": "tsc"                    // Compile TypeScript
}
```

#### 3. Added Health Check Endpoint
- ✅ Added `/health` endpoint in server.ts
- Checks database connection status
- Returns uptime and timestamp

#### 4. Created render.yaml
- ✅ Proper configuration for both backend and frontend
- ✅ Correct build and start commands
- ✅ Environment variable placeholders

## How to Deploy on Render

### Method 1: Using render.yaml (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Fix Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Configure Environment Variables:**
   
   For **Backend Service**:
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Your secret key for JWT tokens
   - `FRONTEND_URL` = Your frontend URL (e.g., https://codesphere-frontend.onrender.com)
   - `PORT` = (Leave empty, Render sets automatically)

   For **Frontend Service**:
   - `VITE_API_URL` = Your backend URL (e.g., https://codesphere-backend.onrender.com)

### Method 2: Manual Deployment (Backend Only)

If you're deploying backend separately:

1. **Create New Web Service:**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your repository

2. **Configure Settings:**
   - **Name:** codesphere-backend
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

3. **Add Environment Variables:**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV` = production

4. **Deploy**

### Method 3: Manual Deployment (Frontend Only)

1. **Create Static Site:**
   - Go to Render Dashboard
   - Click "New" → "Static Site"
   - Connect your repository

2. **Configure Settings:**
   - **Name:** codesphere-frontend
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

3. **Add Environment Variables:**
   - `VITE_API_URL` = Your backend URL

4. **Configure Rewrites:**
   - Add rewrite rule: `/*` → `/index.html` (for SPA routing)

## Environment Variables Setup

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codesphere
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to Render environment variables

### Option 2: Use existing MongoDB
- Use your existing MongoDB connection string

## Verification Steps

After deployment:

1. **Check Backend:**
   - Visit: `https://your-backend-url.onrender.com/`
   - Should see API welcome message
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should see health status

2. **Check Frontend:**
   - Visit: `https://your-frontend-url.onrender.com/`
   - Should load the application

3. **Check Logs:**
   - Backend logs should show:
     - ✅ MongoDB connected successfully
     - 🚀 Server running on port XXXX

## Common Issues & Solutions

### Issue: Module not found error
✅ **FIXED** - tsconfig.json now properly configured with outDir

### Issue: Cannot connect to MongoDB
- Check `MONGODB_URI` environment variable
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check network access settings

### Issue: CORS errors
- Ensure `FRONTEND_URL` is set correctly in backend
- Check frontend is using correct `VITE_API_URL`

### Issue: Build fails
- Check Node.js version (using 22.16.0)
- Ensure all dependencies are in package.json
- Check build logs for specific errors

## Free Tier Limitations

⚠️ **Important Notes:**
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds
- Services auto-wake on incoming requests
- Consider upgrading for production use

## Next Steps

1. ✅ Push updated code to GitHub
2. ✅ Create Render account
3. ✅ Set up MongoDB Atlas
4. ✅ Deploy using render.yaml
5. ✅ Configure environment variables
6. ✅ Test the deployment

## Support

If you encounter issues:
- Check Render logs in dashboard
- Review [Render documentation](https://render.com/docs)
- Check backend health endpoint
- Verify environment variables

## Local Development vs Production

### Local Development:
```bash
# Backend
cd backend
npm install
npm run dev  # Uses tsx watch

# Frontend
cd frontend
npm install
npm run dev  # Uses vite dev server
```

### Production (Render):
- Backend: `npm install && npm run build && npm start`
- Frontend: `npm install && npm run build` → serves static files

---

🎉 **Your deployment configuration is now fixed and ready!**
