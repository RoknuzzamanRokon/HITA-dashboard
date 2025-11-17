/**
 * Export feature related types
 */

// Export job status from API
export interface ExportJobStatus {
    job_id: string;
    status: 'processing' | 'completed' | 'failed';
    progress_percentage: number;
    processed_records: number;
    total_records: number;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    error_message: string | null;
    download_url: string | null;
    expires_at: string | null;
}

// Export job creation response
export interface ExportJobResponse {
    job_id: string;
    status: string;
    estimated_records: number;
    estimated_completion_time: string;
    created_at: string;
    message: string;
}

// Hotel export filters
export interface HotelExportFilters {
    filters: {
        suppliers: string[];
        country_codes: string | 'All';
        min_rating: number;
        max_rating: number;
        date_from: string; // ISO 8601 format
        date_to: string;
        ittids: string | 'All';
        property_types: string[];
        page: number;
        page_size: number;
        max_records: number;
    };
    format: 'json' | 'csv';
    include_locations: boolean;
    include_contacts: boolean;
    include_mappings: boolean;
}

// Mapping export filters
export interface MappingExportFilters {
    filters: {
        suppliers: string[];
        ittids: string | 'All';
        date_from: string;
        date_to: string;
        max_records: number;
    };
    format: 'json' | 'csv';
}

// Union type for all export filters
export type ExportFilters = HotelExportFilters | MappingExportFilters;

// Export types
export type ExportType = 'hotel' | 'mapping';

// Export status types
export type ExportStatus = 'processing' | 'completed' | 'failed' | 'expired';

// Export format types
export type ExportFormat = 'json' | 'csv';

// Client-side export job state
export interface ExportJob {
    jobId: string;
    exportType: ExportType;
    status: ExportStatus;
    progress: number;
    processedRecords: number;
    totalRecords: number;
    createdAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date | null;
    errorMessage: string | null;
    downloadUrl: string | null;
    filters: ExportFilters;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    autoDismiss: boolean;
    duration?: number;
}

// Filter preset
export interface FilterPreset {
    id: string;
    name: string;
    exportType: ExportType;
    filters: ExportFilters;
    createdAt: Date;
}
