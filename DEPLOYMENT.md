# 🚀 CodeSphere Deployment Guide

This guide covers multiple deployment options for your CodeSphere application.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Options](#deployment-options)
   - [Option 1: Vercel (Frontend) + Render (Backend)](#option-1-vercel--render)
   - [Option 2: Railway (Full Stack)](#option-2-railway)
   - [Option 3: Heroku](#option-3-heroku)
   - [Option 4: DigitalOcean](#option-4-digitalocean)
4. [Database Setup](#database-setup)
5. [Post-Deployment](#post-deployment)

---

## Prerequisites

- Git installed
- GitHub account
- MongoDB Atlas account (free tier available)
- Accounts on your chosen deployment platform

---

## Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_min_32_chars

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Code Execution (Optional)
JUDGE0_API_KEY=your_judge0_api_key
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

---

## Deployment Options

## Option 1: Vercel (Frontend) + Render (Backend) ⭐ RECOMMENDED

### Step 1: Deploy Backend on Render

1. **Go to [Render.com](https://render.com)** and sign up

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

3. **Configure the Service**
   ```
   Name: codesphere-backend
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add all backend environment variables (see above)
   - IMPORTANT: Set `FRONTEND_URL` to your Vercel domain

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://codesphere-backend.onrender.com`)

### Step 2: Deploy Frontend on Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the root directory

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - In "Environment Variables" section:
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   VITE_SOCKET_URL=https://your-render-backend-url.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (3-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

6. **Update Backend CORS**
   - Go back to Render
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy backend

---

## Option 2: Railway (Full Stack)

Railway allows you to deploy both frontend and backend on the same platform.

### Step 1: Deploy Backend

1. **Go to [Railway.app](https://railway.app)** and sign up

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Backend Service**
   - Click "Add a New Service"
   - Choose "GitHub Repo"
   - Root Directory: `backend`

4. **Configure Backend**
   - Go to Settings → Environment
   - Add all backend environment variables
   - Railway will auto-assign a domain

5. **Add Start Command**
   - Settings → Deploy
   - Start Command: `npm start`
   - Build Command: `npm install && npm run build`

### Step 2: Deploy Frontend

1. **Add Frontend Service**
   - In the same project, click "New"
   - Choose your repo again
   - Root Directory: `frontend`

2. **Configure Frontend**
   - Add environment variables:
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app
   VITE_SOCKET_URL=https://your-railway-backend.up.railway.app
   ```

3. **Deploy**
   - Railway will auto-deploy both services
   - Generate domains for both services

---

## Option 3: Heroku

### Backend Deployment

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd backend
   heroku create codesphere-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   heroku config:set NODE_ENV=production
   ```

5. **Create Procfile** (add to backend folder)
   ```
   web: npm start
   ```

6. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Frontend Deployment

Deploy frontend to Vercel (see Option 1) or use Heroku Static Buildpack.

---

## Option 4: DigitalOcean (VPS)

For more control, deploy on a VPS.

### Step 1: Create Droplet

1. **Create Ubuntu Droplet** (Basic $6/month)
2. **SSH into server**
   ```bash
   ssh root@your_server_ip
   ```

### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git
```

### Step 3: Clone and Setup

```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/codesphere.git
cd codesphere

# Setup backend
cd backend
npm install
npm run build

# Create .env file
nano .env
# (Add your environment variables)

# Start with PM2
pm2 start dist/server.js --name codesphere-backend
pm2 save
pm2 startup

# Setup frontend
cd ../frontend
npm install
npm run build
```

### Step 4: Configure Nginx

```bash
nano /etc/nginx/sites-available/codesphere
```

Add:
```nginx
# Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/codesphere/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/codesphere /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 5: Setup SSL (Free)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## Database Setup

### MongoDB Atlas (Free Tier)

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**

2. **Create Free Cluster**
   - Sign up / Login
   - Create new project: "CodeSphere"
   - Build a Database → Free Tier (M0)
   - Choose region closest to your users

3. **Configure Access**
   - Database Access → Add New Database User
   - Username: `codesphere`
   - Password: Generate strong password
   - User Privileges: Read and write to any database

4. **Network Access**
   - Network Access → Add IP Address
   - For development: `0.0.0.0/0` (Allow from anywhere)
   - For production: Add your deployment server IPs

5. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password
   - Use this in your `MONGODB_URI` environment variable

---

## Post-Deployment

### 1. Test Your Deployment

```bash
# Test backend
curl https://your-backend-domain.com/api/health

# Test frontend
# Open browser to https://your-frontend-domain.com
```

### 2. Setup Custom Domain (Optional)

**For Vercel:**
- Go to Project Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

**For Render:**
- Go to Settings → Custom Domains
- Add your domain
- Update DNS records as instructed

### 3. Setup Monitoring

**Add health check endpoint to backend:**
```typescript
// backend/src/server.ts
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

**Use monitoring services:**
- [UptimeRobot](https://uptimerobot.com) (Free)
- [BetterUptime](https://betteruptime.com) (Free tier)

### 4. Enable Analytics (Optional)

Add to frontend:
- Google Analytics
- Vercel Analytics
- Plausible Analytics

---

## Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Ensure `FRONTEND_URL` in backend matches your actual frontend domain

### Issue: WebSocket Connection Failed
**Solution:** Check that `VITE_SOCKET_URL` is correctly set and uses `https://` (not `http://`)

### Issue: Database Connection Failed
**Solution:** 
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Issue: Build Fails on Deployment
**Solution:**
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend environment variables set
- [ ] Backend deployed and running
- [ ] Backend URL copied
- [ ] Frontend environment variables set (with backend URL)
- [ ] Frontend deployed
- [ ] Frontend URL copied
- [ ] Backend CORS updated with frontend URL
- [ ] Test authentication flow
- [ ] Test room creation
- [ ] Test video chat
- [ ] Test code execution
- [ ] Setup custom domains (optional)
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring
- [ ] Configure backups

---

## Support

If you encounter issues:
1. Check deployment platform logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for frontend errors

**Happy Coding! 🚀**
