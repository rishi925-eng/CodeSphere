# 🚀 Quick Start Deployment

Choose your deployment method:

## ⚡ Fastest: Vercel + Render (Recommended)

**Time: ~15 minutes**

### 1. Setup MongoDB (5 min)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account → Create cluster
3. Database Access → Add user (save password!)
4. Network Access → Add IP `0.0.0.0/0`
5. Copy connection string

### 2. Deploy Backend to Render (5 min)
1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. New → Web Service → Connect repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add environment variables (see backend/.env.example)
6. Deploy → Copy backend URL

### 3. Deploy Frontend to Vercel (5 min)
1. Go to [Vercel.com](https://vercel.com)
2. New Project → Import repo
3. Settings:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
4. Environment Variables:
   ```
   VITE_API_URL=YOUR_RENDER_BACKEND_URL
   VITE_SOCKET_URL=YOUR_RENDER_BACKEND_URL
   ```
5. Deploy → Copy frontend URL
6. Update backend `FRONTEND_URL` on Render with Vercel URL

✅ **Done!** Your app is live!

---

## 🔧 Alternative: Railway (Single Platform)

**Time: ~10 minutes**

1. Go to [Railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add two services:
   - Service 1: Backend (root: `backend`)
   - Service 2: Frontend (root: `frontend`)
4. Configure environment variables
5. Deploy both services

---

## 📖 Full Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed step-by-step instructions
- Multiple deployment options
- Custom domain setup
- SSL/HTTPS configuration
- Monitoring and analytics
- Troubleshooting

---

## 🎯 Post-Deployment Checklist

- [ ] MongoDB cluster created
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Test login/register
- [ ] Test room creation
- [ ] Test video chat
- [ ] Test code editor
- [ ] Set custom domain (optional)

---

## 🆘 Need Help?

Common issues:
- **CORS errors:** Check `FRONTEND_URL` in backend env
- **Can't connect:** Verify API URLs in frontend env
- **Database errors:** Check MongoDB IP whitelist

See full troubleshooting in DEPLOYMENT.md
