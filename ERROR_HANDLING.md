# Error Handling Guide

## Understanding 404 Errors

### Expected 404s (Normal Behavior)

The following endpoints may return 404, which is **completely normal**:

- `GET /api/polls/active` - Returns 404 when no poll is currently active
  - This is expected behavior when:
    - No teacher has created a poll yet
    - The previous poll has been completed
    - The page is refreshed and no poll exists

### How We Handle 404s

1. **API Interceptor** (`frontend/src/utils/api.js`):
   - Automatically detects 404s for `/polls/active`
   - Converts them to successful responses with `null` data
   - Prevents errors from being thrown in application code

2. **Component Handling**:
   - Components check for `null` data or `isNoActivePoll` flag
   - Show appropriate UI (waiting screen) instead of error

### Browser Console vs Network Tab

- **Network Tab**: Will always show 404 responses - this is normal browser behavior
- **Console Tab**: Should NOT show 404 as an error (thanks to our interceptor)

### If You See 404 in Console

If you still see 404 errors in the console after rebuilding:

1. **Hard refresh** your browser (Cmd+Shift+R or Ctrl+Shift+R)
2. **Clear browser cache** and reload
3. **Check Network tab** - 404s there are normal and expected
4. **Verify** the error is actually in Console, not Network tab

### Other Errors to Watch For

- **500+ errors**: Server errors - check backend logs
- **Network errors**: Connection issues - check backend is running
- **CORS errors**: Configuration issue - check allowed origins
- **Socket errors**: Connection issues - check Socket.io configuration

## Testing

To verify error handling is working:

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Navigate to student dashboard
4. You should NOT see 404 errors in console
5. Go to **Network** tab
6. You WILL see 404 for `/polls/active` - this is normal

The key difference: Console errors = problem, Network 404 = normal.


