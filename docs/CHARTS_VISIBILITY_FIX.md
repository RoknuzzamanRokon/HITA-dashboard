# Charts Visibility Fix for General Users

## Problem

General users were unable to see any analytics charts on the dashboard, even though the `/dashboard/new-user` API endpoint was successfully returning data for them.

### Root Cause

The charts section was wrapped in a `PermissionGuard` that required **two permissions**:

1. `Permission.VIEW_ANALYTICS`
2. `Permission.VIEW_ALL_USERS`

However, `GENERAL_USER` role only had:

- ✅ `Permission.VIEW_DASHBOARD_STATS`
- ❌ `Permission.VIEW_ANALYTICS` (missing)
- ❌ `Permission.VIEW_ALL_USERS` (missing)

Since general users didn't have these permissions, the entire charts section was hidden from them.

## Solution

### 1. Added VIEW_ANALYTICS Permission to Regular Users

Updated `lib/utils/rbac.ts` to grant `VIEW_ANALYTICS` permission to both `USER` and `GENERAL_USER` roles:

```typescript
[UserRole.USER]: [
    Permission.VIEW_DASHBOARD_STATS,
    Permission.VIEW_ANALYTICS, // ✅ Added
],

[UserRole.GENERAL_USER]: [
    Permission.VIEW_DASHBOARD_STATS,
    Permission.VIEW_ANALYTICS, // ✅ Added
],
```

### 2. Removed VIEW_ALL_USERS Requirement

Updated the permission guard in `app/dashboard/page.tsx` to only require `VIEW_ANALYTICS`:

```typescript
// Before:
<PermissionGuard
  permissions={[Permission.VIEW_ANALYTICS, Permission.VIEW_ALL_USERS]}
>

// After:
<PermissionGuard
  permissions={[Permission.VIEW_ANALYTICS]}
>
```

## Result

Now all users can see the analytics charts section:

- ✅ **Super User**: Can see charts (has VIEW_ANALYTICS)
- ✅ **Admin User**: Can see charts (has VIEW_ANALYTICS)
- ✅ **User**: Can see charts (now has VIEW_ANALYTICS)
- ✅ **General User**: Can see charts (now has VIEW_ANALYTICS)

## Security Considerations

### Frontend Permissions

The frontend permissions control **UI visibility** only. They determine what users can see in the interface.

### Backend Data Filtering

The backend **must** filter data based on user role. This is critical for security:

- **super_user**: Backend returns all platform data
- **admin_user**: Backend returns organization-scoped data
- **user/general_user**: Backend returns only personal data

### Current Status

⚠️ **Important**: The backend currently returns the same data to all users. See `docs/DASHBOARD_SECURITY_ISSUE.md` for details on this security issue.

The frontend now shows charts to all users, but the backend needs to implement proper role-based data filtering to ensure users only see data they're authorized to access.

## Testing

To verify the fix:

1. **As a general_user**:

   - Log in to the dashboard
   - You should now see the "Platform Analytics" section
   - Charts should display with data from the API

2. **Check browser console**:

   - You should see a security warning if you're a general_user
   - This warning indicates the backend is returning platform-wide data

3. **Verify API call**:
   ```bash
   # Test with general_user token
   curl -X GET "http://127.0.0.1:8001/v1.0/dashboard/new-user" \
     -H "Authorization: Bearer YOUR_GENERAL_USER_TOKEN"
   ```
   - API should return data (it does)
   - Charts should now display this data (fixed)

## Related Files

- `lib/utils/rbac.ts` - RBAC permissions configuration
- `app/dashboard/page.tsx` - Dashboard page with permission guards
- `lib/hooks/use-dashboard-charts.ts` - Data fetching hook
- `docs/DASHBOARD_SECURITY_ISSUE.md` - Backend security issue documentation

## Next Steps

1. ✅ Frontend: Allow users to see charts (DONE)
2. ⏳ Backend: Implement role-based data filtering (PENDING)
3. ⏳ Testing: Verify each role sees appropriate data (PENDING)
4. ⏳ Security: Audit and fix data access controls (PENDING)
