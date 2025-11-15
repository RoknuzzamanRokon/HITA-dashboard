# Dashboard Security Issue: Role-Based Data Access

## Problem Description

The `/dashboard/new-user` API endpoint currently returns the same platform-wide data to **all authenticated users**, regardless of their role (super_user, admin_user, user, or general_user). This is a security concern as regular users can see data they shouldn't have access to.

## Current Behavior

- **Super User**: Sees all platform data ✅ (Expected)
- **Admin User**: Sees all platform data ❌ (Should only see their organization's data)
- **User**: Sees all platform data ❌ (Should only see their own data)
- **General User**: Sees all platform data ❌ (Should only see their own data)

## Expected Behavior

### Super User (super_user)

- Should see **all platform data**:
  - All users across all organizations
  - All suppliers
  - All activity metrics (registrations, logins, API requests)
  - All packages
  - Platform-wide statistics

### Admin User (admin_user)

- Should see **organization-scoped data**:
  - Users within their organization only
  - Suppliers their organization has access to
  - Activity metrics for their organization
  - Packages available to their organization
  - Organization-specific statistics

### User (user) / General User (general_user)

- Should see **personal data only**:
  - Their own user information
  - Suppliers they have access to
  - Their own activity metrics
  - Packages available to them
  - Personal statistics
  - No access to other users' data or platform-wide metrics

## Technical Details

### Affected Endpoint

```
GET /dashboard/new-user
```

### Current Implementation

The endpoint returns the same response structure for all users:

```json
{
  "platform_overview": {
    "total_users": 150,
    "total_hotels": 5000,
    "available_suppliers": [...],
    "available_packages": [...]
  },
  "activity_metrics": {
    "user_logins": {...},
    "api_requests": {...}
  },
  "platform_trends": {
    "user_registrations": {...}
  }
}
```

## Recommended Solutions

### Option 1: Backend Role-Based Filtering (Recommended)

Modify the `/dashboard/new-user` endpoint to filter data based on the authenticated user's role:

```python
# Backend pseudocode
@router.get("/dashboard/new-user")
async def get_dashboard_data(current_user: User):
    if current_user.role == "super_user":
        return get_all_platform_data()
    elif current_user.role == "admin_user":
        return get_organization_data(current_user.organization_id)
    else:  # user or general_user
        return get_user_data(current_user.id)
```

### Option 2: Separate Endpoints

Create role-specific endpoints:

```
GET /dashboard/admin     # For super_user and admin_user
GET /dashboard/user      # For user and general_user
```

### Option 3: Frontend Filtering (Temporary Workaround)

While not ideal for security, the frontend can hide sensitive data based on user role. However, this doesn't prevent users from accessing the data through browser dev tools or API calls.

## Current Frontend Implementation

The frontend has been updated to:

1. **Log Security Warnings**: When a non-admin user receives platform-wide data, a console warning is logged:

   ```
   ⚠️ SECURITY NOTICE: User with role "general_user" is receiving platform-wide data.
   The backend endpoint /dashboard/new-user should filter data based on user role.
   ```

2. **Permission Guards**: UI components use `PermissionGuard` to hide certain sections based on user permissions, but the data is still fetched.

3. **Documentation**: Code comments explain the issue and expected behavior.

## Action Items

### Backend Team

- [ ] Implement role-based data filtering on `/dashboard/new-user` endpoint
- [ ] Add unit tests for role-based access control
- [ ] Document the expected response structure for each role
- [ ] Consider implementing separate endpoints for different roles

### Frontend Team

- [ ] Update API calls once backend implements role-based filtering
- [ ] Remove security warning logs once backend is fixed
- [ ] Add integration tests to verify role-based data access

## Security Impact

**Severity**: Medium to High

**Risk**: Regular users can access sensitive platform-wide metrics including:

- Total user counts
- Other users' activity
- Platform-wide API usage
- Supplier information
- Package details

**Mitigation**: Currently mitigated by UI-level permission guards, but data is still accessible through API calls.

## Related Files

- `lib/hooks/use-dashboard-charts.ts` - Dashboard data fetching hook
- `app/dashboard/page.tsx` - Dashboard page component
- `lib/components/dashboard/analytics-charts-new.tsx` - Chart components
- `lib/utils/chart-data-transformers.ts` - Data transformation utilities

## Testing

To verify the issue:

1. Log in as a user or general_user (non-admin role)
2. Open browser dev tools → Network tab
3. Navigate to dashboard
4. Inspect the response from `/dashboard/new-user`
5. Observe that platform-wide data is returned (this is the security issue)
6. Check browser console for security warning message

## References

- [OWASP: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [RBAC Best Practices](https://auth0.com/docs/manage-users/access-control/rbac)
