# Deployment Troubleshooting: Local vs Production

## Why It Works Locally But Not on Deployment

### Common Differences Between Local and Production

#### 1. **HTTPS vs HTTP** ⚠️ MOST COMMON ISSUE
- **Local**: Uses `http://localhost:5001`
- **Production**: Uses `https://intervue-poll-0bvl.onrender.com`
- **Issue**: Socket.io needs secure connections for HTTPS
- **Fix**: Added `secure: true` for production in socket client

#### 2. **CORS Configuration**
- **Local**: Same origin or localhost (usually allowed)
- **Production**: Different domains (Vercel → Render)
- **Issue**: Backend might block frontend origin
- **Fix**: Updated CORS to allow all `vercel.app` and `onrender.com` domains

#### 3. **Environment Variables**
- **Local**: Uses `.env` file
- **Production**: Must be set in Vercel dashboard
- **Issue**: Missing or incorrect environment variables
- **Fix**: Code auto-detects production and uses Render URL as fallback

#### 4. **Database Connection Timing**
- **Local**: Database connects immediately
- **Production**: Database might take time to connect on Render
- **Issue**: Socket.io tries to emit before DB is ready
- **Fix**: Added `isDatabaseConnected()` checks before emitting

#### 5. **NODE_ENV Check**
- **Local**: `NODE_ENV` might not be set or is 'development'
- **Production**: `NODE_ENV` is 'production'
- **Issue**: Production check was blocking connections
- **Fix**: Removed strict production blocking, rely on domain checks instead

## Quick Fix Checklist

### ✅ Step 1: Verify Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure these are set:
   ```
   REACT_APP_API_URL=https://intervue-poll-0bvl.onrender.com/api
   REACT_APP_SOCKET_URL=https://intervue-poll-0bvl.onrender.com
   ```
3. **Redeploy** after setting variables

### ✅ Step 2: Check Backend Logs on Render
1. Go to Render Dashboard → Your Backend Service → Logs
2. Look for:
   - `MongoDB connected successfully`
   - `Server running on port...`
   - Any CORS warnings
   - Socket.io connection errors

### ✅ Step 3: Check Browser Console
1. Open deployed frontend: `https://intervue-poll-j6au.vercel.app`
2. Open DevTools (F12) → Console
3. Look for:
   - `🔌 Socket URL configured: https://intervue-poll-0bvl.onrender.com`
   - `✅ Socket connected successfully!`
   - Any error messages

### ✅ Step 4: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket) or "Fetch/XHR"
3. Look for:
   - Socket.io connection attempts
   - Status codes (should be 200 or 101)
   - Any failed requests

## Common Error Messages and Fixes

### Error: "server error" from Socket.io
**Cause**: Unhandled error during connection setup
**Fix**: 
- Check Render logs for the actual error
- Ensure database is connected
- Check CORS configuration

### Error: "CORS policy blocked"
**Cause**: Backend not allowing frontend origin
**Fix**: 
- Verify `allowedOrigins` includes Vercel URL
- Check that CORS allows `vercel.app` domains
- Restart backend service

### Error: "WebSocket connection failed"
**Cause**: HTTPS/HTTP mismatch or SSL issues
**Fix**: 
- Ensure `secure: true` for HTTPS
- Check that backend URL uses HTTPS
- Verify SSL certificate is valid

### Error: "Network error" or "ERR_FAILED"
**Cause**: Backend not accessible or wrong URL
**Fix**: 
- Verify backend URL is correct
- Check backend is running on Render
- Test backend health: `https://intervue-poll-0bvl.onrender.com/api/health`

## Testing Locally with Production URLs

To test production configuration locally:

1. **Set environment variables** (temporarily):
   ```bash
   export REACT_APP_API_URL=https://intervue-poll-0bvl.onrender.com/api
   export REACT_APP_SOCKET_URL=https://intervue-poll-0bvl.onrender.com
   ```

2. **Start frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Check console** - should show production URLs

## Still Not Working?

1. **Check Render Backend Health**:
   ```bash
   curl https://intervue-poll-0bvl.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Check Render Logs**:
   - Look for connection attempts
   - Check for error messages
   - Verify database connection

3. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for build errors or runtime errors

4. **Compare Local vs Production**:
   - Local: `http://localhost:3001` → `http://localhost:5001`
   - Production: `https://intervue-poll-j6au.vercel.app` → `https://intervue-poll-0bvl.onrender.com`
   - Ensure all URLs match the pattern

## Summary

The main differences between local and production:
1. ✅ **Protocol**: HTTP vs HTTPS (fixed with `secure: true`)
2. ✅ **CORS**: Different origins (fixed with domain checks)
3. ✅ **Environment Variables**: Must be set in Vercel
4. ✅ **Database**: Connection timing (fixed with checks)
5. ✅ **NODE_ENV**: Production blocking removed

All fixes have been applied in the latest code. Push and redeploy!

