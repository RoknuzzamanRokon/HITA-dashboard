/**
 * API related types
 */

export interface ApiError {
    status: number;
    message: string;
    details?: any;
}

export interface ApiResponse<T = any> {
    data?: T;
    error?: ApiError;
    success: boolean;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

export interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    requiresAuth?: boolean;
}