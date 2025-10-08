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