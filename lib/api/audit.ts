/**
 * Audit API Service
 * Handles endpoints related to user activity auditing
 */

import apiClient, { ApiResponse } from './client';

// Type definitions matching the API response
export interface AuditUser {
    id: string;
    username: string;
    email: string;
    role: string;
    account_created: string;
}

export interface AuditPeriod {
    days: number;
    start_date: string;
    end_date: string;
}

export interface MostActiveDay {
    date: string;
    count: number;
}

export interface AuditSummary {
    total_activities: number;
    total_endpoint_calls: number;
    unique_endpoints_used: number;
    average_daily_activities: number;
    average_daily_endpoint_calls: number;
    most_active_day: MostActiveDay;
}

export interface TopEndpoint {
    endpoint: string;
    calls: number;
    percentage: number;
}

export interface AllEndpoint {
    endpoint: string;
    calls: number;
}

export interface EndpointUsage {
    total_calls: number;
    unique_endpoints: number;
    top_endpoints: TopEndpoint[];
    all_endpoints: AllEndpoint[];
}

export interface HttpMethodBreakdown {
    method: string;
    count: number;
    percentage: number;
}

export interface HttpMethods {
    total: number;
    breakdown: HttpMethodBreakdown[];
}

export interface StatusCodeBreakdown {
    status_code: number;
    count: number;
    percentage: number;
}

export interface StatusCodes {
    total: number;
    breakdown: StatusCodeBreakdown[];
}

export interface TimelineEntry {
    date: string;
    count: number;
}

export interface ActivityBreakdown {
    action: string;
    action_label: string;
    count: number;
    percentage: number;
}

export interface Authentication {
    successful_logins: number;
    failed_logins: number;
    logouts: number;
    success_rate: number;
}

export interface HourlyDistribution {
    hour: number;
    hour_label: string;
    count: number;
}

export interface DayOfWeekDistribution {
    day_of_week: number;
    day_name: string;
    count: number;
    percentage: number;
}

export interface Patterns {
    hourly_distribution: HourlyDistribution[];
    most_active_hour: number;
    day_of_week_distribution: DayOfWeekDistribution[];
    most_active_day_of_week: string;
}

export interface RecentActivity {
    id: number;
    action: string;
    action_label: string;
    created_at: string;
    ip_address: string;
    endpoint: string | null;
    method: string | null;
    status_code: number | null;
    details: Record<string, any>;
}

export interface MyActivityResponse {
    user: AuditUser;
    period: AuditPeriod;
    summary: AuditSummary;
    endpoint_usage: EndpointUsage;
    http_methods: HttpMethods;
    status_codes: StatusCodes;
    timeline: TimelineEntry[];
    activity_breakdown: ActivityBreakdown[];
    authentication: Authentication;
    patterns: Patterns;
    recent_activities: RecentActivity[];
}

/**
 * Fetch user's activity analytics
 * @param days Number of days to fetch activity for (default: 30)
 * @returns Promise with user activity data
 */
export async function fetchMyActivity(days: number = 30): Promise<ApiResponse<MyActivityResponse>> {
    return apiClient.get<MyActivityResponse>(`/audit/my-activity?days=${days}`);
}

export default {
    fetchMyActivity,
};
