/**
 * API Client for making HTTP requests to the backend
 */

export interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export class ApiClient {
  private baseUrl: string;
  private activeRequests: Map<string, AbortController> = new Map();

  constructor(baseUrl?: string) {
    // Use the full API URL with version, not just the base URL
    const apiBaseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1.0';

    if (apiBaseUrl) {
      // Check if apiBaseUrl already contains the version to avoid double prefixing
      if (apiBaseUrl.endsWith(apiVersion) || apiBaseUrl.endsWith(`${apiVersion}/`)) {
        this.baseUrl = apiBaseUrl;
      } else {
        this.baseUrl = `${apiBaseUrl}/${apiVersion}`;
      }
    } else if (process.env.NODE_ENV === 'development') {
      this.baseUrl = 'http://localhost:8001/v1.0';
      console.warn('API URL not set, using fallback:', this.baseUrl);
    } else {
      this.baseUrl = '';
    }

    console.log('🔧 API Client initialized:', {
      baseUrl: this.baseUrl,
      apiBaseUrl,
      apiVersion,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_USE_MOCK_AUTH: process.env.NEXT_PUBLIC_USE_MOCK_AUTH
    });
  }

  // Main request method with retry logic
  async request<T = any>(endpoint: string, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = true,
      retryCount = 0,
      retryDelay = 1000
    } = options;

    // Create a unique request ID for tracking
    const requestId = `${method}-${endpoint}-${Date.now()}`;

    // Cancel any existing request to the same endpoint
    const existingController = this.activeRequests.get(endpoint);
    if (existingController) {
      console.log(`🚫 Cancelling existing request to ${endpoint}`);
      existingController.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    this.activeRequests.set(endpoint, abortController);

    // Clean up the request tracking when done
    const cleanup = () => {
      this.activeRequests.delete(endpoint);
    };

    console.log('🚀 API Request:', method, endpoint);

    // In development, return realistic mock responses for known endpoints when explicitly enabled
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      console.log(`[DEV] Mocking API call to ${endpoint}`);

      // Mock: current user profile
      if (method === 'GET' && /\/user\/me\/?$/.test(endpoint)) {
        const mockUser = {
          id: 'mock-user-1',
          username: 'demo',
          email: 'demo@example.com',
          user_status: 'super_user',
          is_active: true,
          available_points: 750,
          total_points: 1200,
          paid_status: 'Paid',
          total_rq: 42,
          using_rq_status: 'Active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-05-01T12:34:56Z',
          created_by: 'system',
          active_supplier: ['Provider A', 'Provider B'],
          last_login: '2024-10-01T08:00:00Z',
        } as unknown as T;

        return { success: true, data: mockUser };
      }

      // Default mock for other endpoints
      return { success: true, data: [] as unknown as T };
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requiresAuth) {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
        console.log('✅ Token added to headers');
      } else {
        console.warn('⚠️ No auth token found in localStorage');
        // For authenticated endpoints without token, return early with auth error
        return {
          success: false,
          error: {
            status: 401,
            message: 'Authentication required. Please log in to continue.',
            details: { reason: 'no_token' }
          }
        };
      }

      // Add X-API-Key header if available (required for export endpoints)
      const apiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('user_api_key') : null;
      if (apiKey) {
        requestHeaders['X-API-Key'] = apiKey;
        console.log('✅ API Key added to headers:', apiKey.substring(0, 10) + '...');
      } else {
        console.warn('⚠️ No API key found in localStorage');
      }
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      mode: 'cors',
      credentials: 'omit', // Changed from 'include' to avoid CORS issues
      // Use the abort controller for better connection handling
      signal: abortController.signal,
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        delete requestHeaders['Content-Type'];
        requestConfig.body = body;
        console.log('📦 Request body: FormData');
      } else if (typeof body === 'string') {
        // If body is already a string (like URL-encoded form data), use it directly
        requestConfig.body = body;
        console.log('📦 Request body (string):', body);
      } else {
        // Otherwise, JSON stringify it
        requestConfig.body = JSON.stringify(body);
        console.log('📦 Request body (JSON):', JSON.stringify(body, null, 2));
      }
    }

    // Support absolute URLs; otherwise, prepend baseUrl
    const url = /^https?:\/\//.test(endpoint) ? endpoint : `${this.baseUrl}${endpoint}`;

    try {
      console.log(`🌐 Making request to: ${url}`);
      console.log(`🔧 Request config:`, requestConfig);

      const response = await fetch(url, requestConfig);
      console.log(`📡 Response status: ${response.status}`);

      const result = await this.handleResponse<T>(response);

      // Handle authentication errors (401)
      // Requirement 6.3: Detect 401 errors, clear auth token, redirect to login, show "Session expired" message
      if (!result.success && result.error?.status === 401) {
        console.warn('🔒 Authentication error detected - redirecting to login');
        if (typeof window !== 'undefined') {
          // Clear auth token from localStorage (Requirement 6.3)
          localStorage.removeItem('admin_auth_token');

          // Store session expired message to show on login page (Requirement 6.3)
          sessionStorage.setItem('auth_error_message', 'Your session has expired. Please log in again.');

          // Redirect to login page (Requirement 6.3)
          window.location.href = '/login';
        }
        return result;
      }

      // Handle permission errors (403)
      // Requirement 6.4: Detect 403 errors, show "Permission denied" notification, suggest contacting administrator
      if (!result.success && result.error?.status === 403) {
        console.warn('🚫 Permission denied');
        return {
          success: false,
          error: {
            status: 403,
            message: "You don't have permission to perform this action. Please contact your administrator for access.",
            details: result.error?.details
          }
        };
      }

      // Retry on network errors or 5xx server errors
      if (!result.success && retryCount > 0) {
        const shouldRetry =
          result.error?.status === 0 || // Network error
          (result.error?.status && result.error.status >= 500); // Server error

        if (shouldRetry) {
          console.log(`🔄 Retrying request (${retryCount} attempts remaining)...`);
          await this.delay(retryDelay);
          return this.request<T>(endpoint, {
            ...options,
            retryCount: retryCount - 1,
            retryDelay: retryDelay * 1.5 // Exponential backoff
          });
        }
      }

      cleanup();
      return result;
    } catch (err) {
      console.error('API request failed:', err);
      console.error('Request URL:', url);
      console.error('Request config:', requestConfig);

      let errorMessage = 'Network error';
      let errorStatus = 0;

      // Handle different types of errors
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.warn('🚫 Request was cancelled or timed out');
        cleanup();
        errorMessage = 'Request was cancelled. Please try again.';
        errorStatus = 408; // Request Timeout
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        console.error('🚨 CORS Error detected - this is likely a backend CORS configuration issue');
        console.error('💡 Your backend needs to allow requests from http://localhost:3000');

        errorMessage = `Cannot connect to backend API at ${this.baseUrl}. Please ensure:\n1. Backend server is running at ${this.baseUrl}\n2. CORS is configured to allow requests from ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}`;
        errorStatus = 0;
      } else if (err instanceof Error) {
        // Handle connection reset errors more gracefully
        if (err.message.includes('connection') || err.message.includes('network')) {
          console.warn('🔌 Connection issue detected - this is usually temporary');
          errorMessage = 'Connection interrupted. Please try again.';
          errorStatus = 0;
        } else {
          errorMessage = err.message;
        }
      }

      // Retry on network errors (but not on abort errors to avoid infinite loops)
      if (retryCount > 0 && !(err instanceof DOMException && err.name === 'AbortError')) {
        console.log(`🔄 Retrying request after error (${retryCount} attempts remaining)...`);
        await this.delay(retryDelay);
        return this.request<T>(endpoint, {
          ...options,
          retryCount: retryCount - 1,
          retryDelay: retryDelay * 1.5
        });
      }

      cleanup();
      return {
        success: false,
        error: {
          status: errorStatus,
          message: errorMessage,
          details: err instanceof Error ? { name: err.name, stack: err.stack } : undefined
        },
      };
    }
  }

  // Delay helper for retry logic
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cancel all active requests (useful for cleanup on navigation)
  public cancelAllRequests(): void {
    console.log(`🚫 Cancelling ${this.activeRequests.size} active requests`);
    for (const [endpoint, controller] of this.activeRequests) {
      controller.abort();
    }
    this.activeRequests.clear();
  }

  // Parse and normalize responses
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type') || '';
    let data: any = null;

    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response content-type: ${contentType}`);

    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
        console.log(`📡 Response data:`, data);
      } catch (parseError) {
        console.error('📡 Failed to parse JSON response:', parseError);
      }
    } else {
      // Try to get text content for non-JSON responses
      try {
        const textData = await response.text();
        console.log(`📡 Response text:`, textData);
        data = textData;
      } catch (textError) {
        console.error('📡 Failed to get text response:', textError);
      }
    }

    if (!response.ok) {
      // Only log unexpected errors to console
      // 400 (validation/user errors), 403 (permission), 404 (not found) are expected and should be treated as info
      const isExpectedError = response.status === 400 || response.status === 403 || response.status === 404;

      if (!isExpectedError) {
        console.error(`❌ Error response - Status: ${response.status}`);
        console.error(`❌ Error data:`, JSON.stringify(data, null, 2));
      } else {
        // Just log as info for expected errors
        console.log(`ℹ️ Expected error response - Status: ${response.status}`, data?.message || data?.error || 'No message');
      }

      // For 422 validation errors, show detailed field errors
      if (response.status === 422 && data && data.detail) {
        console.error('❌ Validation errors:');
        if (Array.isArray(data.detail)) {
          data.detail.forEach((err: any) => {
            console.error(`  - Field: ${err.loc?.join('.')} | Error: ${err.msg} | Type: ${err.type}`);
          });
        } else {
          console.error('  -', data.detail);
        }
      }

      return {
        success: false,
        error: {
          status: response.status,
          message: (data && (data.message || data.error || data.detail)) || response.statusText || 'Unknown error',
          details: data && (data.details || data.errors || data.detail),
        },
      };
    }

    console.log(`📡 Success response - Data:`, data);
    return { success: true, data: data as T };
  }

  // Convenience methods with retry support
  async get<T = any>(endpoint: string, requiresAuth = true, retryCount = 2): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth, retryCount });
  }

  async post<T = any>(endpoint: string, body?: any, requiresAuth = true, retryCount = 2): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth, retryCount });
  }

  async put<T = any>(endpoint: string, body?: any, requiresAuth = true, retryCount = 2): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth, retryCount });
  }

  async patch<T = any>(endpoint: string, body?: any, requiresAuth = true, retryCount = 2): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth, retryCount });
  }

  async delete<T = any>(endpoint: string, requiresAuth = true, retryCount = 2): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth, retryCount });
  }

  // Simple health check helper used by dashboard
  async healthCheck(): Promise<ApiResponse<{ ok?: boolean }>> {
    // Prefer a lightweight check; in dev with mocks enabled, always healthy
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      return { success: true, data: { ok: true } };
    }

    // Try a conventional health endpoint, fall back to success=false on error
    try {
      const res = await this.get<any>('/health', false);
      if (res.success) {
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return {
        success: false,
        error: { status: 0, message: err instanceof Error ? err.message : 'Network error' },
      };
    }
  }
}

export const apiClient = new ApiClient();

// Add global cleanup to prevent connection reset errors
if (typeof window !== 'undefined') {
  // Cancel all requests when the page is about to unload
  window.addEventListener('beforeunload', () => {
    apiClient.cancelAllRequests();
  });

  // Cancel all requests when the page becomes hidden (tab switch, minimize, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      console.log('🔄 Page hidden, cancelling active requests to prevent connection errors');
      apiClient.cancelAllRequests();
    }
  });
}

export default apiClient;