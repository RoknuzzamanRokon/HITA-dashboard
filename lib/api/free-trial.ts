/**
 * Free Trial API Client
 * Handles all API calls related to free trial registration and management
 */

export interface FreeTrialRequest {
    username: string;
    business_name: string;
    email: string;
    phone_number: string;
    message?: string;
}

export interface FreeTrialResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
        id: string;
        username: string;
        business_name: string;
        email: string;
        phone_number: string;
        message?: string;
        status: string;
        request_date: string;
    };
    details?: Record<string, string>;
}

export interface TrialRequestDetail {
    id: string;
    username: string;
    business_name: string;
    email: string;
    phone_number: string;
    message?: string;
    status: "pending" | "approved" | "rejected" | "active" | "expired";
    api_key: string | null;
    trial_start_date: string | null;
    trial_end_date: string | null;
    request_date: string;
    approved_date: string | null;
    approved_by: string | null;
    rejection_reason: string | null;
    notes: string | null;
    ip_address: string | null;
    user_agent: string | null;
    activity_log?: Array<{
        action: string;
        action_date: string;
        performed_by: string | null;
        details: any;
    }>;
}

export interface FilterParams {
    status?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
}

export interface ApprovalData {
    trial_duration_days?: number;
    notes?: string;
}

export interface RejectionData {
    rejection_reason: string;
    notes?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        requests: T[];
        pagination: {
            current_page: number;
            total_pages: number;
            total_items: number;
            items_per_page: number;
        };
    };
}

export interface StatisticsResponse {
    success: boolean;
    data: {
        total_requests: number;
        pending: number;
        approved: number;
        rejected: number;
        active_trials: number;
        expired_trials: number;
        requests_this_month: number;
        approval_rate: number;
        recent_requests: Array<{
            id: string;
            business_name: string;
            email: string;
            status: string;
            request_date: string;
        }>;
    };
}

class FreeTrialAPI {
    private baseURL: string;

    constructor() {
        // Use environment variable or default to /api/v1
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    }

    /**
     * Submit a new free trial request
     */
    async submitRequest(data: FreeTrialRequest): Promise<FreeTrialResponse> {
        try {
            const response = await fetch(`${this.baseURL}/free-trial/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit request");
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || "Network error occurred");
        }
    }

    /**
     * Get all trial requests (Admin only)
     */
    async getAllRequests(
        filters: FilterParams,
        token: string
    ): Promise<PaginatedResponse<TrialRequestDetail>> {
        try {
            const queryString = new URLSearchParams(
                filters as Record<string, string>
            ).toString();
            const response = await fetch(
                `${this.baseURL}/admin/free-trial/requests?${queryString}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch requests");
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || "Network error occurred");
        }
    }

    /**
     * Get a single trial request by ID (Admin only)
     */
    async getRequestById(
        id: string,
        token: string
    ): Promise<{ success: boolean; data: TrialRequestDetail }> {
        try {
            const response = await fetch(
                `${this.baseURL}/admin/free-trial/requests/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch request");
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || "Network error occurred");
        }
    }

    /**
     * Approve a trial request (Admin only)
     */
    async approveRequest(
        id: string,
        data: ApprovalData,
        token: string
    ): Promise<FreeTrialResponse> {
        try {
            const response = await fetch(
                `${this.baseURL}/admin/free-trial/requests/${id}/approve`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to approve request");
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || "Network error occurred");
        }
    }

    /**
     * Reject a trial request (Admin only)
     */
    async rejectRequest(
        id: string,
        data: RejectionData,
        token: string
    ): Promise<FreeTrialResponse> {
        try {
            const response = await fetch(
                `${this.baseURL}/admin/free-trial/requests/${id}/reject`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to reject request");
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || "Network error occurred");
        }
    }

    /**
     * Update trial request notes (Admin only)
     */
    async updateNotes(
        id: string,
        notes: string,
        token: string
    ): Promise<FreeTrialResponse> {
        try {
            const response = await fetch(
                `${this.baseURL}/admin/free-trial/requests/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ notes }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update notes");
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || "Network error occurred");
        }
    }

    /**
     * Check trial status by email (Public)
     */
    async checkStatus(
        email: string
    ): Promise<{
        success: boolean;
        data: {
            status: string;
            request_date: string;
            trial_start_date: string | null;
            trial_end_date: string | null;
            days_remaining: number | null;
        };
    }> {
        try {
            const response = await fetch(
                `${this.baseURL}/free-trial/status/${encodeURIComponent(email)}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to check status");
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || "Network error occurred");
        }
    }

    /**
     * Get trial statistics (Admin only)
     */
    async getStatistics(token: string): Promise<StatisticsResponse> {
        try {
            const response = await fetch(
                `${this.baseURL}/admin/free-trial/statistics`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch statistics");
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || "Network error occurred");
        }
    }
}

// Export singleton instance
export const freeTrialAPI = new FreeTrialAPI();

// Export class for testing or custom instances
export default FreeTrialAPI;
