/**
 * API Client for making HTTP requests to the backend
 */

export interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
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

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '';

    if (!this.baseUrl && process.env.NODE_ENV === 'development') {
      this.baseUrl = 'http://localhost:8002';
      console.warn('API URL not set, using fallback:', this.baseUrl);
    }
  }

  // Main request method
  async request<T = any>(endpoint: string, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, requiresAuth = true } = options;

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
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        delete requestHeaders['Content-Type'];
        requestConfig.body = body;
      } else {
        requestConfig.body = JSON.stringify(body);
      }
    }

    // Support absolute URLs; otherwise, prepend baseUrl
    const url = /^https?:\/\//.test(endpoint) ? endpoint : `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, requestConfig);
      return await this.handleResponse<T>(response);
    } catch (err) {
      console.error('API request failed:', err);
      return {
        success: false,
        error: { status: 0, message: err instanceof Error ? err.message : 'Network error' },
      };
    }
  }

  // Parse and normalize responses
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type') || '';
    let data: any = null;
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // fallthrough
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: {
          status: response.status,
          message: (data && (data.message || data.error)) || response.statusText || 'Unknown error',
          details: data && (data.details || data.errors),
        },
      };
    }

    return { success: true, data: data as T };
  }

  // Convenience methods
  async get<T = any>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T = any>(endpoint: string, body?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  async put<T = any>(endpoint: string, body?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  async patch<T = any>(endpoint: string, body?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  }

  async delete<T = any>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
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
export default apiClient;