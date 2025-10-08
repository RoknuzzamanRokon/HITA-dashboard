/**
 * Provider content management related types
 */

export interface Provider {
    name: string;
    totalHotels: number;
    lastSyncDate: string;
    status: "active" | "inactive" | "syncing";
    description?: string;
    systemType?: string;
}

export interface ProviderStats {
    name: string;
    totalHotels: number;
    mappedHotels: number;
    unmappedHotels: number;
    lastSyncDate: string;
    syncStatus: "success" | "error" | "in_progress" | "pending";
    errorCount?: number;
    lastErrorMessage?: string;
}

export interface ProviderHotelListParams {
    provider: string;
    page?: number;
    limit?: number;
    resumeKey?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ProviderHotelListResponse {
    hotels: ProviderHotel[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        resumeKey?: string;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    provider: string;
}

export interface ProviderHotel {
    ittid: string;
    name: string;
    providerId: string;
    providerName: string;
    systemType: string;
    mappingStatus: "mapped" | "unmapped" | "partial";
    lastUpdated: string;
    rating?: string;
    propertyType?: string;
    address?: string;
    coordinates?: {
        latitude: string;
        longitude: string;
    };
    vervotechId?: string;
    giataCode?: string;
}

export interface ExportOptions {
    format: "json" | "csv" | "excel";
    provider?: string;
    includeFields: string[];
    filters?: {
        mappingStatus?: "mapped" | "unmapped" | "partial";
        dateRange?: {
            start: string;
            end: string;
        };
        search?: string;
    };
}

export interface ExportProgress {
    id: string;
    status: "pending" | "processing" | "completed" | "error";
    progress: number;
    totalRecords?: number;
    processedRecords?: number;
    downloadUrl?: string;
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
}

export interface ProviderPermission {
    userId: string;
    providerName: string;
    hasAccess: boolean;
    grantedAt?: string;
    grantedBy?: string;
}