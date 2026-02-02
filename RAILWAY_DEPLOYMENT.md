# 🚂 Railway Deployment Guide

## Deploy Your Tracking System to Railway

Railway is perfect for hosting both your frontend and backend in one place!

---

## Option 1: Full Stack on Railway (Backend + Frontend + Simulator) ⭐ RECOMMENDED

### Prerequisites
- Railway account: https://railway.app (sign up free)
- GitHub account with your code
- Git configured locally

### Step 1: Connect GitHub Repository to Railway

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize Railway to access your GitHub
5. Select your `tracking-system` repository
6. Click "Deploy Now"

Railway will automatically detect and deploy the Next.js frontend!

### Step 2: Configure the Backend Server

Your project has both frontend and backend. You need to tell Railway to run the server too.

1. In Railway Dashboard, click your project
2. Go to "Settings" tab
3. Scroll to "Start Command" 
4. **For Backend Service**: Set to `cd server && npm install && npm start`

Or create a `railway.json` file:

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "restartPolicyMaxRetries": 5
  }
}
```

### Step 3: Set Environment Variables

1. In Railway Dashboard → Your Project
2. Click "Variables" tab
3. Add these variables:

```
# For Frontend
NEXT_PUBLIC_WS_URL=your-railway-app-url (will update after deployment)

# For Server
NODE_ENV=production
```

### Step 4: Deploy Both Services

Since you have frontend and backend, you may need separate services:

**Option A: One Service (Simpler)**
- Frontend + Backend in same service
- Server runs on same port
- Simpler setup

**Option B: Separate Services (Better)**
- Frontend service on one port
- Backend service on different port
- Better organization

#### For Option A (One Service):
Update `package.json` to run both:

```json
{
  "scripts": {
    "start": "concurrently \"next start\" \"cd server && npm start\""
  }
}
```

#### For Option B (Separate Services):
Create separate Railway services:

1. Create `server/railway.json`:
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

---

## Option 2: Backend Only on Railway

If you only want the backend on Railway (and frontend on Vercel):

### Step 1: Create Backend Repository

```bash
# Optional: Create separate repo just for backend
cd server
git init
git add .
git commit -m "Backend service"
git remote add origin https://github.com/YOUR_USERNAME/tracking-system-backend
git push -u origin main
```

### Step 2: Deploy Backend Service

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your backend repository
5. Configure start command: `npm start`
6. Add environment: `NODE_ENV=production`
7. Deploy!

### Step 3: Get Your Backend URL

1. In Railway Dashboard, find your service
2. Go to "Deployments" tab
3. Copy the public URL (e.g., `https://tracking-system-backend-production.railway.app`)

### Step 4: Update Frontend Environment

In your Vercel (or local) frontend:

```env
NEXT_PUBLIC_WS_URL=https://tracking-system-backend-production.railway.app
```

---

## Configuration for Both Options

### railway.json (Root Level)

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "restartPolicyMaxRetries": 5
  }
}
```

### Update package.json for Production

Make sure your root `package.json` can start the server:

```json
{
  "scripts": {
    "start": "next start",
    "dev": "next dev",
    "build": "next build"
  }
}
```

And in `server/package.json`:

```json
{
  "scripts": {
    "start": "node --loader ts-node/esm index.ts",
    "dev": "ts-node index.ts"
  }
}
```

---

## Step-by-Step Deployment (Full Stack)

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Create Railway Project

- Go to https://railway.app/dashboard
- Click "New Project"
- Select "Deploy from GitHub"
- Choose your repository
- Click "Deploy"

Railway will:
- ✅ Auto-detect Next.js
- ✅ Install dependencies
- ✅ Build the app
- ✅ Start the service

### 3. Configure Backend

Add a new service for the backend:

1. In your Railway project, click "Add Service"
2. Select "GitHub" (same repo)
3. Configure:
   - Service name: "backend"
   - Start command: `cd server && npm start`
   - Port: 8080

### 4. Connect Frontend to Backend

The frontend needs to know the backend URL.

**Get Backend URL:**
1. Railway Dashboard → Your Project → backend service
2. Go to "Deployments" → Click active deployment
3. Copy the public URL

**Update Frontend:**
1. In Railway → Your Project → "Variables"
2. Add: `NEXT_PUBLIC_WS_URL=https://your-backend-url`
3. Click "Redeploy" on frontend service

### 5. Verify Deployment

1. Open your Railway frontend URL in browser
2. Open DevTools Console (F12)
3. Look for: `Front-end connected to server`
4. Verify drivers appear on the map
5. Watch real-time location updates

---

## Domain Configuration (Optional)

To use a custom domain:

1. Railway Dashboard → Project → Settings
2. Go to "Domains"
3. Add custom domain (requires DNS setup)
4. Point DNS records to Railway

---

## Monitoring & Logs

### View Live Logs

In Railway Dashboard:
1. Click your service
2. Go to "Logs" tab
3. Watch real-time output

### Monitor Performance

1. Go to "Metrics" tab
2. View:
   - CPU usage
   - Memory usage
   - Network traffic
   - Response times

---

## Environment Variables

### Frontend (.env.production)
```
NEXT_PUBLIC_WS_URL=https://your-railway-backend-url
```

### Backend (Railway Variables)
```
NODE_ENV=production
```

---

## Troubleshooting

### Build Fails
- Check build logs in Railway Dashboard
- Ensure `npm run build` works locally
- Verify all dependencies are in `package.json`

### Connection Refused
- Verify backend service is running
- Check WebSocket URL is correct
- Ensure ports are configured correctly

### Drivers Not Appearing
1. Check browser console for connection error
2. Verify `NEXT_PUBLIC_WS_URL` in Railway Variables
3. Check backend logs for incoming connections
4. Restart services if needed

### Service Won't Start
- Check start command is correct
- Verify TypeScript compiles: `npx tsc --noEmit`
- Check all required dependencies are installed

---

## Performance Tips

1. **Enable Caching**: Railway automatically caches dependencies
2. **Monitor Logs**: Watch for errors and warnings
3. **Set Resource Limits**: Configure CPU/Memory in Railway settings
4. **Use Environment Variables**: Never hardcode secrets

---

## Cost Estimates

```
Free Tier:
- 5GB of storage
- 100 GB bandwidth/month
- Suitable for testing

Pro Tier:
- $5/month base
- Usage-based billing
- Suitable for production
```

---

## Next Steps

1. ✅ Create Railway account
2. ✅ Connect GitHub repository
3. ✅ Configure backend service
4. ✅ Set environment variables
5. ✅ Deploy and test
6. ✅ Monitor performance

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- This project repo: Your GitHub repository

---

## Success Checklist

- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] Frontend deploying
- [ ] Backend service added
- [ ] Environment variables set
- [ ] Frontend URL accessing map
- [ ] DevTools shows "Front-end connected"
- [ ] Drivers appearing on map
- [ ] Real-time updates working
- [ ] Monitoring active

**Congratulations! Your system is live on Railway! 🎉**
