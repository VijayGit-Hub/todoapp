# 🚀 Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))

## Step 1: Deploy Backend

1. **Go to [Railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose this repository**
6. **Railway will detect the Dockerfile and start building**

### Add PostgreSQL Database
1. **In your Railway project dashboard**
2. **Click "New" → "Database" → "PostgreSQL"**
3. **Railway automatically sets these environment variables:**
   - `DATABASE_URL`
   - `DATABASE_USERNAME` 
   - `DATABASE_PASSWORD`

### Configure Environment Variables
Add these in Railway project settings:
```bash
CORS_ORIGINS=https://your-frontend-url.railway.app
```

## Step 2: Deploy Frontend

1. **Create a new Railway project** for frontend
2. **Connect the same GitHub repository**
3. **Set Dockerfile to `Dockerfile.frontend`**
4. **Railway will use the frontend Dockerfile**

### Update API URL
After backend deployment, update frontend:
1. **Get your backend URL** from Railway dashboard
2. **Set environment variable in frontend:**
   ```bash
   VITE_API_URL=https://your-backend-url.railway.app
   ```

## Step 3: Test Your App

1. **Backend URL**: `https://your-backend-url.railway.app/api/todos`
2. **Frontend URL**: `https://your-frontend-url.railway.app`
3. **Test CRUD operations**
4. **Test offline functionality**

## Environment Variables Reference

### Backend
- `PORT` - Server port (Railway sets automatically)
- `DATABASE_URL` - PostgreSQL connection string (Railway sets automatically)
- `DATABASE_USERNAME` - Database username (Railway sets automatically)
- `DATABASE_PASSWORD` - Database password (Railway sets automatically)
- `CORS_ORIGINS` - Allowed frontend origins

### Frontend
- `VITE_API_URL` - Backend API URL

## Troubleshooting

### Backend Issues
- Check Railway logs for build errors
- Ensure PostgreSQL database is connected
- Verify environment variables are set

### Frontend Issues
- Check if `VITE_API_URL` is correct
- Verify CORS settings in backend
- Check browser console for errors

### Database Issues
- Ensure PostgreSQL service is running
- Check connection string format
- Verify database credentials

## Cost
- **Railway Hobby Plan**: $5/month
- **Includes**: Backend + Frontend + PostgreSQL database
- **Free tier**: 500 hours/month (enough for development)

## Support
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
