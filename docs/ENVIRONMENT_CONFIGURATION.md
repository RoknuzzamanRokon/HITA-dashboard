# Environment Configuration Guide

This document provides comprehensive information about environment variables and configuration for the Admin Management Panel, with special focus on the Export Feature.

## Table of Contents

1. [Environment Files](#environment-files)
2. [Required Environment Variables](#required-environment-variables)
3. [Export Feature Configuration](#export-feature-configuration)
4. [Authentication Configuration](#authentication-configuration)
5. [Development vs Production](#development-vs-production)
6. [Verification and Testing](#verification-and-testing)
7. [Troubleshooting](#troubleshooting)

---

## Environment Files

The application uses different environment files for different environments:

- **`.env.example`** - Template file with all available configuration options and documentation
- **`.env.local`** - Local development configuration (not committed to git)
- **`.env.production`** - Production configuration

### Priority Order

Next.js loads environment variables in the following order (later files override earlier ones):

1. `.env` (all environments)
2. `.env.local` (all environments, not committed to git)
3. `.env.development` or `.env.production` (environment-specific)
4. `.env.development.local` or `.env.production.local` (environment-specific, not committed to git)

---

## Required Environment Variables

### API Configuration

#### `NEXT_PUBLIC_API_BASE_URL` (Required)

The base URL for the backend API server (without version).

- **Development**: `http://127.0.0.1:8001` or `http://localhost:8001`
- **Production**: `https://www.testcontent.innovatedemo.com/api`
- **Default**: `http://127.0.0.1:8001`

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001
```

#### `NEXT_PUBLIC_API_VERSION` (Required)

The API version to use. This is appended to the base URL.

- **Current Version**: `v1.0`
- **Default**: `v1.0`

```bash
NEXT_PUBLIC_API_VERSION=v1.0
```

**Full API URL**: The complete API URL is constructed as: `{NEXT_PUBLIC_API_BASE_URL}/{NEXT_PUBLIC_API_VERSION}`

Example: `http://127.0.0.1:8001/v1.0`

---

## Export Feature Configuration

The Export Feature uses the following API endpoints, all automatically configured based on the base URL and version:

### Export API Endpoints

| Endpoint                    | Method | Purpose                   | Full URL Example                                     |
| --------------------------- | ------ | ------------------------- | ---------------------------------------------------- |
| `/export/hotels`            | POST   | Create hotel export job   | `http://127.0.0.1:8001/v1.0/export/hotels`           |
| `/export/mappings`          | POST   | Create mapping export job | `http://127.0.0.1:8001/v1.0/export/mappings`         |
| `/export/status/{job_id}`   | GET    | Get export job status     | `http://127.0.0.1:8001/v1.0/export/status/exp_123`   |
| `/export/download/{job_id}` | GET    | Download completed export | `http://127.0.0.1:8001/v1.0/export/download/exp_123` |

### Export Feature Requirements

1. **Authentication**: All export endpoints require authentication token in the `Authorization` header
2. **CORS**: Backend must be configured to allow CORS requests from the frontend domain
3. **Token Storage**: Authentication token is stored in localStorage with key `admin_auth_token`
4. **File Download**: Export downloads are handled as Blob responses with appropriate MIME types

### No Additional Configuration Required

The export feature automatically uses the configured API base URL and version. No additional environment variables are needed specifically for exports.

---

## Authentication Configuration

### `NEXT_PUBLIC_TOKEN_STORAGE_KEY` (Optional)

The localStorage key used to store the authentication token.

- **Default**: `admin_auth_token`
- **Usage**: Token is included in API requests as `Bearer {token}`

```bash
NEXT_PUBLIC_TOKEN_STORAGE_KEY=admin_auth_token
```

### `NEXT_PUBLIC_REFRESH_TOKEN_KEY` (Optional)

The localStorage key used to store the refresh token (if applicable).

- **Default**: `admin_refresh_token`

```bash
NEXT_PUBLIC_REFRESH_TOKEN_KEY=admin_refresh_token
```

### `NEXT_PUBLIC_ENABLE_REGISTRATION` (Optional)

Enable or disable user registration feature.

- **Values**: `true` or `false`
- **Default**: `false`

```bash
NEXT_PUBLIC_ENABLE_REGISTRATION=false
```

### Authentication Flow

1. User logs in via `/login` page
2. Backend returns access token
3. Token is stored in localStorage with key `admin_auth_token`
4. All subsequent API requests include token in `Authorization: Bearer {token}` header
5. On 401 error, user is redirected to login page and token is cleared

---

## Development vs Production

### Development Configuration

**File**: `.env.local`

```bash
# Development API (local backend)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001
NEXT_PUBLIC_API_VERSION=v1.0

# Disable mocks for real API testing
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCKS=false

# Node environment
NODE_ENV=development
```

### Production Configuration

**File**: `.env.production`

```bash
# Production API
NEXT_PUBLIC_API_BASE_URL=https://www.testcontent.innovatedemo.com/api
NEXT_PUBLIC_API_VERSION=v1.0

# Always disable mocks in production
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCKS=false

# Node environment
NODE_ENV=production
```

### Key Differences

| Aspect        | Development             | Production                   |
| ------------- | ----------------------- | ---------------------------- |
| API URL       | `http://127.0.0.1:8001` | `https://api.yourdomain.com` |
| HTTPS         | Optional                | Required                     |
| Mock Auth     | Can be enabled          | Must be disabled             |
| Error Logging | Verbose console logs    | Minimal logging              |
| CORS          | Localhost allowed       | Production domain allowed    |

---

## Verification and Testing

### Automated Verification

Run the configuration verification script to check your setup:

```bash
node verify-export-config.js
```

This script verifies:

- ✓ Environment variables are loaded correctly
- ✓ API endpoints are properly configured
- ✓ Backend API is reachable
- ✓ Authentication token handling is correct

### Manual Verification

1. **Check Environment Variables**

   ```bash
   # View current configuration
   echo $NEXT_PUBLIC_API_BASE_URL
   echo $NEXT_PUBLIC_API_VERSION
   ```

2. **Test API Connectivity**

   ```bash
   # Test health endpoint
   curl http://127.0.0.1:8001/v1.0/health
   ```

3. **Test Authentication**

   - Log in through the UI
   - Check browser console for API requests
   - Verify token is stored in localStorage
   - Check that API requests include `Authorization` header

4. **Test Export Feature**
   - Navigate to `/dashboard/exports`
   - Create a test export
   - Monitor job status updates
   - Download completed export

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot connect to backend API"

**Symptoms**: Network errors, CORS errors, connection refused

**Solutions**:

- Verify backend server is running: `curl http://127.0.0.1:8001/v1.0/health`
- Check `NEXT_PUBLIC_API_BASE_URL` is correct in `.env.local`
- Ensure backend CORS is configured to allow requests from `http://localhost:3000`
- Check firewall settings

#### 2. "Authentication token not found"

**Symptoms**: 401 errors, redirected to login page

**Solutions**:

- Log in through the UI to get a fresh token
- Check localStorage for `admin_auth_token` key
- Verify `NEXT_PUBLIC_TOKEN_STORAGE_KEY` matches the key used in code
- Clear browser cache and localStorage, then log in again

#### 3. "Export endpoints return 404"

**Symptoms**: Export creation fails with 404 error

**Solutions**:

- Verify backend has export endpoints implemented
- Check API version is correct: `NEXT_PUBLIC_API_VERSION=v1.0`
- Test endpoint directly: `curl http://127.0.0.1:8001/v1.0/export/hotels`
- Review backend logs for routing issues

#### 4. "Download fails with expired URL"

**Symptoms**: Download button disabled, "Expired" status

**Solutions**:

- Export downloads expire after a certain time (check backend configuration)
- Create a new export to get a fresh download URL
- Check `expires_at` timestamp in job status response

#### 5. "CORS policy error"

**Symptoms**: Browser console shows CORS error

**Solutions**:

- Backend must include CORS headers:
  ```
  Access-Control-Allow-Origin: http://localhost:3000
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  ```
- For development, backend should allow `http://localhost:3000`
- For production, backend should allow your production domain

#### 6. "Environment variables not loading"

**Symptoms**: Default values used instead of configured values

**Solutions**:

- Ensure `.env.local` file exists in project root
- Restart Next.js development server after changing environment variables
- Verify variable names start with `NEXT_PUBLIC_` for client-side access
- Check for syntax errors in `.env.local` (no spaces around `=`)

---

## Backend Requirements

For the export feature to work correctly, the backend must:

1. **Implement Export Endpoints**

   - `POST /v1.0/export/hotels` - Create hotel export
   - `POST /v1.0/export/mappings` - Create mapping export
   - `GET /v1.0/export/status/{job_id}` - Get job status
   - `GET /v1.0/export/download/{job_id}` - Download file

2. **Support Authentication**

   - Accept `Authorization: Bearer {token}` header
   - Return 401 for invalid/expired tokens
   - Return 403 for insufficient permissions

3. **Configure CORS**

   - Allow requests from frontend domain
   - Allow required methods (GET, POST, OPTIONS)
   - Allow required headers (Content-Type, Authorization)

4. **Return Proper Response Formats**
   - Job creation: Return `job_id` and initial status
   - Status endpoint: Return progress, records, timestamps
   - Download endpoint: Return file as Blob with proper MIME type

---

## Security Considerations

1. **Token Storage**

   - Tokens are stored in localStorage (not sessionStorage)
   - Tokens persist across browser sessions
   - Clear tokens on logout

2. **HTTPS in Production**

   - Always use HTTPS for production API
   - Tokens transmitted over secure connection
   - Prevent man-in-the-middle attacks

3. **Token Expiration**

   - Backend should implement token expiration
   - Frontend handles 401 errors by redirecting to login
   - Refresh tokens if supported by backend

4. **CORS Configuration**
   - Only allow specific origins in production
   - Don't use wildcard (`*`) in production
   - Validate origin on backend

---

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Export Feature Design Document](./EXPORT_FEATURE_DESIGN.md)
- [API Integration Guide](./API_INTEGRATION.md)

---

## Support

If you encounter issues not covered in this guide:

1. Check browser console for error messages
2. Review backend logs for API errors
3. Run the verification script: `node verify-export-config.js`
4. Contact the development team with:
   - Error messages from console
   - Steps to reproduce the issue
   - Environment configuration (without sensitive data)
