# Vercel Deployment Setup Guide

## Quick Fix: Frontend Not Connecting to Backend

Your frontend on Vercel needs to know where your backend is located. Follow these steps:

## Step 1: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `intervue-poll-j6au`
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

### Variable 1: API URL
- **Name:** `REACT_APP_API_URL`
- **Value:** `https://intervue-poll-0bvl.onrender.com/api`
- **Environment:** Production, Preview, Development (select all)

### Variable 2: Socket URL
- **Name:** `REACT_APP_SOCKET_URL`
- **Value:** `https://intervue-poll-0bvl.onrender.com`
- **Environment:** Production, Preview, Development (select all)

## Step 2: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or simply push a new commit to trigger auto-deploy

## Step 3: Verify It's Working

1. Open your deployed site: `https://intervue-poll-j6au.vercel.app`
2. Open browser console (F12)
3. Look for these logs:
   ```
   🌐 API URL: https://intervue-poll-0bvl.onrender.com/api
   🔌 Socket URL configured: https://intervue-poll-0bvl.onrender.com
   📍 Environment: Production
   ```

If you see `localhost` in the logs, the environment variables weren't set correctly.

## Alternative: Auto-Detection (Current Code)

The code now **auto-detects** production and uses the Render URL as a fallback. This means:

- ✅ **It will work** even without setting environment variables
- ⚠️ **But setting them is recommended** for flexibility and best practices

## Troubleshooting

### Still seeing localhost?
- Make sure variables start with `REACT_APP_`
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after setting variables
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### CORS errors?
- Check that backend CORS allows `https://intervue-poll-j6au.vercel.app`
- See `DEPLOYMENT.md` for CORS configuration

### Socket connection fails?
- Verify `REACT_APP_SOCKET_URL` has no trailing slash
- Check backend is running: `https://intervue-poll-0bvl.onrender.com/api/health`
- Check browser console for detailed error messages

