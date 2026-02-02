# 🚂 Railway Quick Deployment Checklist

## Pre-Deployment Setup

### Local Verification
- [ ] Code is committed to GitHub
- [ ] `.env.production` exists
- [ ] `npm run build` works locally
- [ ] `cd server && npx tsc --noEmit` passes

### GitHub Preparation
- [ ] All changes pushed to main branch
- [ ] Repository is public (or Railway has access)
- [ ] `.gitignore` includes `node_modules/`

---

## Railway Deployment Steps

### Step 1: Create Railway Project (2 minutes)
- [ ] Go to https://railway.app/dashboard
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub"
- [ ] Authorize Railway
- [ ] Select `tracking-system` repository
- [ ] Click "Deploy"

### Step 2: Wait for Initial Deploy (3-5 minutes)
- [ ] Watch deploy logs
- [ ] Verify build successful
- [ ] Note the generated URL

### Step 3: Configure Backend Service (3 minutes)
- [ ] In Railway Project, click "Add Service"
- [ ] Select "GitHub"
- [ ] Configure:
  - Service name: `backend`
  - Root directory: `server`
  - Start command: `npm start`
  - Port: `8080`

### Step 4: Set Environment Variables (2 minutes)
- [ ] In Railway Project → Variables tab:
  - `NODE_ENV` = `production`
  - `NEXT_PUBLIC_WS_URL` = `https://your-backend-url` (get from backend service)
- [ ] Click "Save" and redeploy

### Step 5: Verify Deployment (3 minutes)
- [ ] Open frontend URL in browser
- [ ] Open DevTools Console (F12)
- [ ] Look for: `Front-end connected to server`
- [ ] Verify drivers appear on map
- [ ] Check real-time location updates

---

## Getting Your Backend URL

1. Railway Dashboard → Your Project
2. Click on `backend` service
3. Go to "Deployments" tab
4. Find active deployment
5. Copy the "Public URL"
6. Format: `https://tracking-system-production-xxxx.railway.app`

---

## Environment Variables Setup

### In Railway Dashboard Variables:

```
NEXT_PUBLIC_WS_URL=https://your-backend-url-here
NODE_ENV=production
```

---

## Common Issues & Fixes

### Build Fails
**Issue**: Deployment shows "build failed"
**Fix**:
1. Check build logs in Railway
2. Run `npm run build` locally to verify
3. Ensure all dependencies in `package.json`

### Connection Refused
**Issue**: Console shows "Cannot connect to WebSocket"
**Fix**:
1. Verify backend service is running (check Logs tab)
2. Confirm `NEXT_PUBLIC_WS_URL` is set correctly
3. Wait 1-2 minutes after deploy for full startup

### Drivers Not Showing
**Issue**: Map loads but no drivers visible
**Fix**:
1. Check browser console for errors
2. Verify backend URL is correct
3. Check server logs for "Started simulating 100 drivers"
4. Restart both services

### 502/503 Errors
**Issue**: Bad Gateway error
**Fix**:
1. Check service status in Railway
2. View deployment logs for errors
3. Verify start command is correct
4. Restart the service

---

## Monitoring

### View Logs
1. Railway Dashboard → Service
2. Click "Logs" tab
3. Watch real-time logs

### Check Metrics
1. Go to "Metrics" tab
2. Monitor:
   - Memory usage
   - CPU usage
   - Network traffic

### Restart Service
1. Click service
2. Go to "Deployments"
3. Click "Redeploy" button

---

## Expected Output in Logs

### Frontend Service
```
> tracking-system@0.1.0 build
> next build

✓ Compiled successfully
Server running...
```

### Backend Service
```
Server running on ws://localhost:8080
✓ Connected to server at ws://localhost:8080
✓ Started simulating 100 drivers
```

---

## After Deployment Success

1. ✅ Frontend URL: `https://tracking-system-production-xxxx.railway.app`
2. ✅ Backend URL: `https://tracking-system-backend-production-xxxx.railway.app`
3. ✅ 100 drivers visible on map
4. ✅ Real-time updates working
5. ✅ System stable and monitoring

---

## Next Steps

- [ ] Monitor logs for first 24 hours
- [ ] Set up error tracking (optional)
- [ ] Configure custom domain (optional)
- [ ] Set up backups (if using database later)
- [ ] Share deployed URL with team

---

## Important URLs

- **Dashboard**: https://railway.app/dashboard
- **Your Project**: https://railway.app/project/[PROJECT_ID]
- **Frontend**: https://[your-app].railway.app
- **Backend**: https://[your-backend].railway.app

---

## Support Resources

- Railway Docs: https://docs.railway.app
- Railway CLI: https://docs.railway.app/cli/install
- GitHub Integration: https://docs.railway.app/guides/github
- Troubleshooting: https://docs.railway.app/troubleshooting

---

## Quick Reference

| Task | Time | Status |
|------|------|--------|
| Create Railway project | 2 min | Ready |
| Initial deploy | 5 min | Auto |
| Configure backend | 3 min | Ready |
| Set variables | 2 min | Ready |
| Verify deployment | 3 min | Ready |
| **TOTAL** | **~15 min** | ✅ |

---

**You're all set! Happy deploying! 🚂**
