/**
 * User management related types
 */

import { User, UserRole } from './auth';

export interface UserListItem extends User {
    lastLogin?: string;
    totalPoints?: number;
    usedPoints?: number;
    activeSuppliers?: string[];
    paidStatus?: string;
    totalRequests?: number;
    usingRqStatus?: string;
    createdBy?: string;
    actions?: never; // Virtual field for actions column
}

export interface UserFormData {
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    isActive: boolean;
    pointBalance?: number;
}

export interface UserFilters {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
}

export interface UserSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    sortBy?: keyof UserListItem;
    sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<UserRole, number>;
    totalPointsDistributed: number;
    totalPointsUsed: number;
}

/**
 * User Edit Management Types
 */

export interface DetailedUserInfo {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    api_key: string | null;
    points: {
        total_points: number;
        current_points: number;
        total_used_points: number;
        paid_status: string;
        total_rq: number;
    };
    active_suppliers: string[];
    total_suppliers: number;
    created_at: string;
    updated_at: string;
    user_status: string;
    is_active: boolean;
    using_rq_status: string;
    created_by: string;
    viewed_by: {
        user_id: string;
        username: string;
        email: string;
        role: string;
    };
}

export type AllocationType =
    | "admin_user_package"
    | "one_year_package"
    | "one_month_package"
    | "per_request_point"
    | "guest_point";

export interface PointAllocationRequest {
    receiver_email: string;
    receiver_id: string;
    allocation_type: AllocationType;
}

export interface SupplierManagementRequest {
    provider_activision_list: string[];
}

export interface ActionResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        status: number;
        message: string;
        details?: any;
    };
}