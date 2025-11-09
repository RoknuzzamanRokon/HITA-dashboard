# Troubleshooting: All Users Check Section

## Issue

The "All Users Overview" section is not showing any values in the UI.

## Changes Made

### 1. Added Debug Logging

Enhanced the `fetchAllUsersCheck` function with detailed console logging:

- API base URL
- Full response object
- Success/error status
- Data structure details

### 2. Added Debug UI

Added a debug panel at the top of the section showing:

- Loading state
- Data availability
- Error status
- Key data points (users count, total, unpaid)

### 3. Added Test Component

Created `app/dashboard/users/test-section.tsx` - a standalone test component that:

- Has its own isolated state
- Shows raw API response
- Displays parsed data
- Includes manual fetch button

### 4. Fixed useEffect Dependencies

Removed `fetchAllUsersCheck` from the dependency array to prevent infinite loops.
Added a 500ms delay to avoid race conditions.

## How to Debug

### Step 1: Check Browser Console

1. Open the page: http://localhost:3000/dashboard/users
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for these logs:
   ```
   🔄 useEffect triggered - fetching data...
   🔄 Calling fetchAllUsersCheck...
   🔍 Fetching all users check data...
   🔍 API Base URL: http://127.0.0.1:8002
   🔍 Full response: {...}
   ```

### Step 2: Check Network Tab

1. In DevTools, go to Network tab
2. Filter by "check"
3. Look for request to `/v1.0/user/check/all`
4. Check:
   - Status code (should be 200)
   - Response headers
   - Response body
   - Request headers (Authorization token present?)

### Step 3: Use Test Section

1. Scroll to the "Test All Users Check API" section (added at top)
2. Click "Fetch Data" button
3. Check the debug info and raw response
4. This isolates whether the issue is with:
   - API connectivity
   - Data parsing
   - State management
   - UI rendering

### Step 4: Test API Directly

Use the test HTML file:

```bash
# Open in browser
start test-all-users-check.html
```

Or use the Node.js script:

```bash
# Edit test-api-direct.js and add your token
node test-api-direct.js
```

## Common Issues & Solutions

### Issue 1: CORS Error

**Symptoms:** Network error, CORS policy error in console
**Solution:**

- Backend must allow requests from `http://localhost:3000`
- Check backend CORS configuration
- Verify `Access-Control-Allow-Origin` header

### Issue 2: Authentication Error

**Symptoms:** 401 Unauthorized, "Failed to fetch all users data"
**Solution:**

- Check if token is present in localStorage: `localStorage.getItem('admin_auth_token')`
- Verify token is valid
- Check token expiration
- Try logging in again

### Issue 3: Wrong API URL

**Symptoms:** 404 Not Found, connection refused
**Solution:**

- Check `.env.local` file:
  ```
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002
  NEXT_PUBLIC_API_VERSION=v1.0
  ```
- Verify backend is running on port 8002
- Check console for "API Base URL" log

### Issue 4: Data Structure Mismatch

**Symptoms:** Data loads but values show as 0 or "Unknown"
**Solution:**

- Check raw response in test section
- Compare with expected structure:
  ```json
  {
    "users": [...],
    "pagination": { "total": 14, ... },
    "statistics": { "total_unpaid_users": 14, ... },
    "requested_by": { "username": "...", ... },
    "timestamp": "..."
  }
  ```
- Update field accessors if structure differs

### Issue 5: State Not Updating

**Symptoms:** Console shows data but UI doesn't update
**Solution:**

- Check React DevTools
- Verify `allUsersData` state
- Check for rendering conditions
- Look for JavaScript errors in console

## Expected API Response Structure

```json
{
  "users": [
    {
      "id": "b6146d77-e",
      "username": "safwan",
      "email": "safwan@gmail.com",
      "role": "general_user",
      "is_active": true,
      "created_at": "2025-11-08T17:13:18",
      "updated_at": "2025-11-08T17:13:18",
      "created_by": "own: safwan@gmail.com",
      "points": {
        "total_points": 0,
        "current_points": 0,
        "total_used_points": 0,
        "paid_status": "Unpaid"
      },
      "active_suppliers": [],
      "total_suppliers": 0,
      "activity_status": "Inactive",
      "total_requests": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 14,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "statistics": {
    "total_unpaid_users": 14,
    "showing": 14
  },
  "requested_by": {
    "user_id": "1a203ccda4",
    "username": "ursamroko",
    "role": "super_user"
  },
  "timestamp": "2025-11-08T18:55:54.867585"
}
```

## Next Steps

1. **Check Console Logs** - Look for the debug logs to see what's happening
2. **Use Test Section** - Click the "Fetch Data" button in the test section
3. **Check Network** - Verify the API request is being made and succeeding
4. **Review Response** - Compare actual response with expected structure
5. **Report Back** - Share console logs and network response for further help

## Cleanup After Debugging

Once the issue is resolved, remove:

1. The test section import and component from `page.tsx`
2. The debug panel from the UI
3. Extra console.log statements (keep essential ones)
4. The `test-section.tsx` file
5. Test files: `test-all-users-check.html`, `test-api-direct.js`
