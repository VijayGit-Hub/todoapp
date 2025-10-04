# 🚀 Railway Deployment Guide - Complete Step-by-Step

## Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Your code pushed to GitHub

---

## 🎯 **Deployment Strategy (Important!)**

**We'll deploy in this order to avoid CORS issues:**
1. **First**: Deploy Backend + Database
2. **Second**: Deploy Frontend with Backend URL
3. **Third**: Update Backend CORS with Frontend URL

---

## 📋 **Step 1: Deploy Backend + Database**

### 1.1 Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `TodoApp` repository
6. Railway will detect the Dockerfile and start building

### 1.2 Add PostgreSQL Database
1. In your Railway project dashboard
2. Click **"New"** → **"Database"** → **"PostgreSQL"**
3. Wait for database to be created (2-3 minutes)
4. Railway automatically sets these environment variables:
   - `DATABASE_URL`
   - `DATABASE_USERNAME` 
   - `DATABASE_PASSWORD`

### 1.3 Configure Backend Environment Variables
1. Go to your backend service in Railway
2. Click on **"Variables"** tab
3. Add these environment variables:

```bash
# Database (Railway sets these automatically, but verify they exist)
DATABASE_URL=postgresql://postgres:password@host:port/railway
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_generated_password

# CORS (we'll update this after frontend deployment)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Port (Railway sets this automatically)
PORT=8080
```

### 1.4 Verify Backend Deployment
1. Wait for build to complete (5-10 minutes)
2. Check the **"Deployments"** tab for build logs
3. Once deployed, you'll get a URL like: `https://your-backend-name.railway.app`
4. Test the backend: `https://your-backend-name.railway.app/api/todos`
5. Should return `[]` (empty array) - this means backend is working!

---

## 📋 **Step 2: Deploy Frontend**

### 2.1 Create Frontend Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose the **same repository** (`TodoApp`)
4. Railway will ask for configuration

### 2.2 Configure Frontend Service
1. In the **"Settings"** tab of your frontend service
2. Set **"Root Directory"** to: `frontend`
3. Set **"Dockerfile"** to: `Dockerfile.frontend`
4. Click **"Save"**

### 2.3 Set Frontend Environment Variables
1. Go to **"Variables"** tab
2. Add this environment variable:

```bash
VITE_API_URL=https://your-backend-name.railway.app
```
**Replace `your-backend-name` with your actual backend URL!**

### 2.4 Deploy Frontend
1. Railway will automatically start building
2. Wait for deployment to complete (5-10 minutes)
3. You'll get a frontend URL like: `https://your-frontend-name.railway.app`

---

## 📋 **Step 3: Update CORS Settings**

### 3.1 Get Frontend URL
1. Copy your frontend URL from Railway dashboard
2. Example: `https://your-frontend-name.railway.app`

### 3.2 Update Backend CORS
1. Go back to your **backend service**
2. Click **"Variables"** tab
3. Update the `CORS_ORIGINS` variable:

```bash
CORS_ORIGINS=https://your-frontend-name.railway.app
```

### 3.3 Redeploy Backend
1. Railway will automatically redeploy when you change variables
2. Wait for deployment to complete

---

## 🧪 **Step 4: Test Your Application**

### 4.1 Test Backend
- Visit: `https://your-backend-name.railway.app/api/todos`
- Should return: `[]` (empty array)

### 4.2 Test Frontend
- Visit: `https://your-frontend-name.railway.app`
- Should load the Todo app interface

### 4.3 Test Full Functionality
1. **Add a todo** - should work
2. **Edit a todo** - should work  
3. **Delete a todo** - should work
4. **Test offline mode** - disconnect internet and try adding todos

---

## 🔧 **Troubleshooting Guide**

### Backend Health Check Failing?
**Problem**: Backend shows "Health check failed"
**Solutions**:
1. Check if PostgreSQL database is running
2. Verify `DATABASE_URL` is set correctly
3. Check build logs for errors
4. Ensure all environment variables are set

### CORS Errors?
**Problem**: Frontend can't connect to backend
**Solutions**:
1. Verify `CORS_ORIGINS` includes your frontend URL
2. Check that `VITE_API_URL` is correct
3. Make sure backend is deployed and running

### Database Connection Issues?
**Problem**: Backend can't connect to database
**Solutions**:
1. Verify `DATABASE_URL` format: `postgresql://user:password@host:port/dbname`
2. Check if database service is running
3. Verify credentials are correct

### Frontend Not Loading?
**Problem**: Frontend shows blank page or errors
**Solutions**:
1. Check if `VITE_API_URL` is set correctly
2. Verify frontend build completed successfully
3. Check browser console for errors

---

## 📊 **Environment Variables Reference**

### Backend Variables
```bash
# Database (set by Railway automatically)
DATABASE_URL=postgresql://postgres:password@host:port/railway
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=generated_password

# CORS (you set this)
CORS_ORIGINS=https://your-frontend-url.railway.app

# Port (set by Railway automatically)
PORT=8080
```

### Frontend Variables
```bash
# API URL (you set this)
VITE_API_URL=https://your-backend-url.railway.app
```

---

## 💰 **Cost Breakdown**
- **Railway Hobby Plan**: $5/month
- **Includes**: 
  - Backend service
  - Frontend service  
  - PostgreSQL database
  - 500 hours/month free tier

---

## 🆘 **Need Help?**

### Railway Resources
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

### Common Issues
1. **Build fails**: Check Dockerfile paths
2. **Database connection**: Verify environment variables
3. **CORS errors**: Check frontend URL in CORS_ORIGINS
4. **Health check fails**: Ensure database is running

---

## ✅ **Success Checklist**

- [ ] Backend deployed and accessible
- [ ] Database connected and working
- [ ] Frontend deployed and accessible
- [ ] CORS configured correctly
- [ ] Can add/edit/delete todos
- [ ] Offline functionality works
- [ ] No console errors

**Once all items are checked, your Todo app is live! 🎉**
