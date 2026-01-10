# Deployment Guide

## Quick Fix: Frontend Still Using Localhost

If your frontend is still connecting to `localhost` instead of your deployed backend:

### Step 1: Set Environment Variables in Render

1. Go to your **Frontend Service** in Render dashboard
2. Navigate to **Environment** tab
3. Add these variables:

```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

**Replace `your-backend.onrender.com` with your actual backend URL**

### Step 2: Rebuild Your Frontend

After setting environment variables:
1. Go to **Manual Deploy** or trigger a new deploy
2. Render will automatically rebuild with the new environment variables

### Step 3: Verify

1. Open your deployed frontend in browser
2. Open browser console (F12)
3. Look for these logs:
   - `Socket URL: https://your-backend.onrender.com`
   - `API URL: https://your-backend.onrender.com/api`

If you still see `localhost`, the environment variables weren't set correctly or the rebuild didn't happen.

## Complete Deployment Checklist

### Backend (Render)

- [ ] Service created and connected to GitHub
- [ ] Environment variables set:
  - [ ] `PORT=5001` (or let Render assign)
  - [ ] `MONGODB_URI=your_mongodb_connection_string`
  - [ ] `FRONTEND_URL=https://your-frontend-url.com`
- [ ] Build command: `npm install` (or leave empty)
- [ ] Start command: `cd backend && npm start`
- [ ] Service is running and healthy

### Frontend (Vercel - Recommended)

**⚠️ IMPORTANT: Set Environment Variables in Vercel Dashboard**

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these variables:
   ```
   REACT_APP_API_URL=https://intervue-poll-0bvl.onrender.com/api
   REACT_APP_SOCKET_URL=https://intervue-poll-0bvl.onrender.com
   ```
3. **Redeploy** your frontend (Vercel will auto-redeploy after you push, or use Manual Deploy)
4. Check browser console - should show:
   - `🌐 API URL: https://intervue-poll-0bvl.onrender.com/api`
   - `🔌 Socket URL configured: https://intervue-poll-0bvl.onrender.com`

**Note:** The code now auto-detects production and uses the Render URL as fallback, but setting environment variables is still recommended for flexibility.

### Frontend (Render/Netlify)

- [ ] Service created and connected to GitHub
- [ ] Environment variables set:
  - [ ] `REACT_APP_API_URL=https://your-backend.onrender.com/api`
  - [ ] `REACT_APP_SOCKET_URL=https://your-backend.onrender.com`
- [ ] Build command: `cd frontend && npm install && npm run build`
- [ ] Publish directory: `frontend/build` (for Render)
- [ ] Service rebuilt after setting environment variables
- [ ] Check browser console for correct URLs

### CORS Configuration

Update `backend/src/server.js` to include your frontend URL:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://your-frontend.onrender.com', // Add your deployed frontend URL
  // Add other origins as needed
];
```

## Common Issues

### Issue: Frontend still using localhost
**Solution:** 
- Verify environment variables are set in Render dashboard
- Make sure variables start with `REACT_APP_`
- Rebuild the frontend service
- Check browser console logs

### Issue: CORS errors
**Solution:**
- Add frontend URL to `allowedOrigins` in backend
- Restart backend service
- Check that `FRONTEND_URL` is set correctly

### Issue: Socket.io connection fails
**Solution:**
- Verify `REACT_APP_SOCKET_URL` is set correctly
- Check that backend URL doesn't have trailing slash
- Ensure backend CORS allows your frontend origin
- Check browser console for connection errors

### Issue: API calls fail
**Solution:**
- Verify `REACT_APP_API_URL` ends with `/api`
- Check backend is running and accessible
- Verify CORS configuration
- Check network tab in browser DevTools

## Testing After Deployment

1. Open frontend URL in browser
2. Open browser console (F12)
3. Verify logs show deployed URLs (not localhost)
4. Test creating a poll as teacher
5. Test joining as student in another tab
6. Verify real-time updates work
7. Test page refresh (state recovery)


