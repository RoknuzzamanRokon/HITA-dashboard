/**
 * Dashboard API Service
 * Handles endpoints related to dashboard analytics and points summary
 */

import apiClient, { ApiResponse } from './client';

// Type definitions matching the API response
export interface PointsByRole {
    role: string;
    user_count: number;
    total_points: string;
    current_points: string;
    avg_points: number;
    points_utilization: string;
}

export interface TransactionType {
    type: string;
    count: number;
    total_points: string;
    avg_points: number;
    percentage_of_total: number;
}

export interface TopPointHolder {
    user_id: string;
    username: string;
    role: string;
    current_points: number;
    total_points: number;
    points_used: number;
}

export interface PointsEconomy {
    total_points_in_system: string;
    total_points_distributed: string;
    points_utilization_rate: string;
    average_user_balance: string;
    data_available: boolean;
}

export interface HighestPointHolder {
    user_id: string;
    username: string;
    role: string;
    current_points: number;
    total_points: number;
    points_used: number;
}

export interface FinancialInsights {
    total_roles_with_points: number;
    most_active_transaction_type: string;
    highest_point_holder: HighestPointHolder;
    transaction_activity_level: string;
}

export interface DataQuality {
    points_data_available: boolean;
    transaction_data_available: boolean;
    users_with_points: number;
    transaction_types_count: number;
}

export interface RequestedBy {
    user_id: string;
    username: string;
    role: string;
}

export interface PointsSummaryResponse {
    points_by_role: PointsByRole[];
    recent_transactions_30d: number;
    transaction_types: TransactionType[];
    top_point_holders: TopPointHolder[];
    points_economy: PointsEconomy;
    financial_insights: FinancialInsights;
    data_quality: DataQuality;
    timestamp: string;
    requested_by: RequestedBy;
}

// Supplier Info Types
export interface AccessibleSupplier {
    supplierName: string;
    totalHotels: number;
    accessType: string;
    permissionGrantedAt: string | null;
    lastUpdated: string;
    availabilityStatus: string;
}

export interface AccessSummary {
    totalSuppliersInSystem: number;
    accessibleSuppliersCount: number;
    permissionBased: boolean;
}

export interface SupplierAnalytics {
    totalHotelsAccessible: number;
    activeSuppliers: number;
    inactiveSuppliers: number;
    accessCoveragePercentage: number;
}

export interface ResponseMetadata {
    generatedAt: string;
}

export interface SupplierInfoResponse {
    userId: string;
    role: string;
    accessSummary: AccessSummary;
    supplierAnalytics: SupplierAnalytics;
    accessibleSuppliers: AccessibleSupplier[];
    responseMetadata: ResponseMetadata;
}

/**
 * Fetch points summary and analytics
 * @returns Promise with points summary data
 */
export async function fetchPointsSummary(): Promise<ApiResponse<PointsSummaryResponse>> {
    return apiClient.get<PointsSummaryResponse>('/dashboard/points-summary');
}

/**
 * Fetch active suppliers information
 * @returns Promise with supplier data
 */
export async function fetchSupplierInfo(): Promise<ApiResponse<SupplierInfoResponse>> {
    return apiClient.get<SupplierInfoResponse>('/hotels/check-my-active-suppliers-info');
}

export default {
    fetchPointsSummary,
    fetchSupplierInfo,
};
