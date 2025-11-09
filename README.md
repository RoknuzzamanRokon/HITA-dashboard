This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

This frontend application requires a backend API server to be running. The backend should be available at:

- **Default URL**: `http://127.0.0.1:8002`
- **API Version**: `v1.0`
- **Full API URL**: `http://127.0.0.1:8002/v1.0`

### Backend Requirements

1. The backend server must be running and accessible
2. CORS must be configured to allow requests from `http://localhost:3000`
3. Authentication endpoints must be available for login

If you see connection errors in the console, ensure:

- ✅ Backend server is running at the configured URL
- ✅ CORS headers are properly configured
- ✅ You have valid authentication credentials

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002
NEXT_PUBLIC_API_VERSION=v1.0

# Disable mock auth - only use real API
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCKS=false
```

See `.env.example` for all available configuration options.

## Development Mode Features

### Automatic Mock Data Fallback

When running in development mode (`NODE_ENV=development`), the application automatically falls back to mock data if the backend API is not available. This allows you to:

- ✅ Develop and test UI components without a running backend
- ✅ See realistic data in the interface
- ✅ Test user interactions and workflows
- ✅ Work offline or when backend is unavailable

**How it works:**

- When an API call fails with a network error (status 0), the app automatically returns mock data
- You'll see console messages like `🔧 Using mock data for development`
- Mock data is only used in development mode - production always requires a real backend

**Note:** Mock data is for UI development only. To test real API integration, ensure your backend is running.

## Troubleshooting

### Connection Errors

If you see "Cannot connect to backend API" errors:

1. **Check Backend Status**: Ensure your backend server is running at `http://127.0.0.1:8002`
2. **Verify CORS**: Backend must allow requests from `http://localhost:3000`
3. **Check Network**: Use browser DevTools Network tab to inspect failed requests
4. **Authentication**: Ensure you're logged in with valid credentials

**In Development:** The app will automatically use mock data if the backend is unavailable. Look for `🔧 Using mock data for development` messages in the console.

### Common Issues

- **Empty error objects `{}`**: Usually indicates a CORS or network connection issue (mock data will be used in development)
- **401 Unauthorized**: Your authentication token may have expired - try logging in again
- **403 Forbidden**: You don't have permission for the requested operation
- **404 Not Found**: The requested resource doesn't exist or the endpoint URL is incorrect

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
