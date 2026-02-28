/**
 * Custom hook for managing export jobs state and operations
 * Handles job creation, status updates, deletion, and persistence
 */

import { useState, useCallback, useEffect } from 'react';
import { exportAPI } from '@/lib/api/exports';
import { useRetryManager } from './use-retry-manager';
import { useNotification } from '@/lib/components/notifications/notification-provider';
import type {
    ExportJob,
    HotelExportFilters,
    MappingExportFilters,
    ExportJobStatus,
} from '@/lib/types/exports';

const STORAGE_KEY = 'export_jobs';
const EXPIRATION_HOURS = 24;

interface UseExportJobsReturn {
    jobs: ExportJob[];
    createHotelExport: (filters: HotelExportFilters) => Promise<void>;
    createMappingExport: (filters: MappingExportFilters) => Promise<void>;
    refreshJobStatus: (jobId: string) => Promise<void>;
    refreshJobs: () => Promise<void>;
    deleteJob: (jobId: string) => Promise<void>;
    clearCompletedJobs: () => Promise<void>;
    isCreating: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Helper to check if a date is valid
 */
const isValidDate = (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Save jobs to localStorage
 */
const saveJobsToStorage = (jobs: ExportJob[]): void => {
    try {
        const serializedJobs = jobs.map((job) => ({
            ...job,
            createdAt: isValidDate(job.createdAt) ? job.createdAt.toISOString() : new Date().toISOString(),
            startedAt: isValidDate(job.startedAt) ? job.startedAt!.toISOString() : null,
            completedAt: isValidDate(job.completedAt) ? job.completedAt!.toISOString() : null,
            expiresAt: isValidDate(job.expiresAt) ? job.expiresAt!.toISOString() : null,
            estimatedCompletionTime: isValidDate(job.estimatedCompletionTime) ? job.estimatedCompletionTime!.toISOString() : null,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedJobs));
        console.log('Jobs saved to localStorage:', serializedJobs.length);
    } catch (err) {
        console.error('Error saving jobs to localStorage:', err);
    }
};

/**
 * Load jobs from localStorage
 */
const loadJobsFromStorage = (): ExportJob[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        const now = new Date();
        const expirationTime = EXPIRATION_HOURS * 60 * 60 * 1000; // 24 hours in milliseconds

        // Deserialize and filter expired jobs
        const jobs: ExportJob[] = parsed
            .map((job: any) => {
                const createdAt = new Date(job.createdAt);
                return {
                    ...job,
                    createdAt: isValidDate(createdAt) ? createdAt : new Date(), // Fallback to now if invalid
                    startedAt: job.startedAt ? new Date(job.startedAt) : null,
                    completedAt: job.completedAt ? new Date(job.completedAt) : null,
                    expiresAt: job.expiresAt ? new Date(job.expiresAt) : null,
                    estimatedCompletionTime: job.estimatedCompletionTime ? new Date(job.estimatedCompletionTime) : null,
                };
            })
            .filter((job: ExportJob) => {
                // Ensure all dates are valid objects before using them
                if (!isValidDate(job.createdAt)) return false;

                // Remove jobs older than 24 hours
                const age = now.getTime() - job.createdAt.getTime();
                return age < expirationTime;
            });

        console.log('Jobs loaded from localStorage:', jobs.length);
        return jobs;
    } catch (err) {
        console.error('Error loading jobs from localStorage:', err);
        return [];
    }
};

/**
 * Hook for managing export jobs
 * Provides functions to create, update, and manage export jobs
 */
export function useExportJobs(): UseExportJobsReturn {
    const [jobs, setJobs] = useState<ExportJob[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true); // Add loading state
    const [error, setError] = useState<string | null>(null);
    const retryManager = useRetryManager();
    const { addNotification } = useNotification();

    // Load jobs from API on mount, with localStorage as fallback
    useEffect(() => {
        const loadJobs = async () => {
            try {
                console.log('🔄 Loading export jobs from API...');

                // Try to fetch from API first
                const response = await exportAPI.getExportJobs();

                if (response.success && response.data) {
                    console.log(`✅ Loaded ${response.data.jobs.length} jobs from API`);

                    // Convert API response to ExportJob format
                    const apiJobs: ExportJob[] = response.data.jobs.map((job: any) => {
                        // Normalize export type (API returns plural, frontend uses singular)
                        let exportType: 'hotel' | 'mapping' = 'mapping';
                        if (job.export_type === 'mappings') {
                            exportType = 'mapping';
                        } else if (job.export_type === 'hotels' || job.export_type === 'hotel') {
                            exportType = 'hotel';
                        }

                        return {
                            jobId: job.job_id,
                            exportType,
                            status: job.status,
                            progress: job.progress_percentage || 0,
                            processedRecords: job.processed_records || 0,
                            totalRecords: job.total_records || 0,
                            createdAt: new Date(job.created_at),
                            startedAt: job.started_at ? new Date(job.started_at) : null,
                            completedAt: job.completed_at ? new Date(job.completed_at) : null,
                            expiresAt: job.expires_at ? new Date(job.expires_at) : null,
                            estimatedCompletionTime: null,
                            errorMessage: job.error_message || null,
                            downloadUrl: job.download_url || null,
                            filters: {
                                ...(job.filters || {}),
                                format: job.format || job.filters?.format || 'json', // Ensure format is always present
                            },
                        };
                    });

                    setJobs(apiJobs);

                    // Also save to localStorage as cache
                    saveJobsToStorage(apiJobs);
                    setError(null); // Clear any previous errors
                } else {
                    // Check if this is an API key error (401 with API key message)
                    const errorMessage = response.error?.message || '';
                    const isApiKeyError = response.error?.status === 401 &&
                        (errorMessage.includes('API Key') || errorMessage.includes('X-API-Key'));

                    if (isApiKeyError) {
                        // Set error to show in UI, but don't redirect
                        setError(errorMessage);
                        console.warn('⚠️ API key required for export endpoints');
                    }

                    // Load from localStorage as fallback
                    const loadedJobs = loadJobsFromStorage();
                    setJobs(loadedJobs);
                }
            } catch (error) {
                console.error('❌ Error loading jobs from API:', error);
                // Fallback to localStorage on error
                const loadedJobs = loadJobsFromStorage();
                setJobs(loadedJobs);
            } finally {
                setIsLoadingJobs(false);
            }
        };

        loadJobs();
    }, []);

    // Save jobs to localStorage whenever they change
    useEffect(() => {
        if (jobs.length > 0) {
            saveJobsToStorage(jobs);
        }
    }, [jobs]);

    // Check for expired jobs and update their status
    useEffect(() => {
        const checkExpiration = () => {
            const now = new Date();
            let hasExpiredJobs = false;

            setJobs((prevJobs) =>
                prevJobs.map((job) => {
                    // Only check completed jobs that haven't been marked as expired
                    if (
                        job.status === 'completed' &&
                        job.expiresAt &&
                        new Date(job.expiresAt) < now
                    ) {
                        hasExpiredJobs = true;
                        console.log(`Job ${job.jobId} has expired`);
                        return {
                            ...job,
                            status: 'expired' as const,
                        };
                    }
                    return job;
                })
            );

            if (hasExpiredJobs) {
                console.log('Expired jobs detected and updated');
            }
        };

        // Check immediately on mount
        checkExpiration();

        // Check every minute for expired jobs
        const intervalId = setInterval(checkExpiration, 60000);

        return () => clearInterval(intervalId);
    }, []);

    /**
     * Convert API response to ExportJob format
     */
    const convertToExportJob = useCallback(
        (
            jobId: string,
            exportType: 'hotel' | 'mapping',
            filters: HotelExportFilters | MappingExportFilters,
            status: ExportJobStatus
        ): ExportJob => {
            return {
                jobId,
                exportType,
                status: status.status,
                progress: status.progress_percentage,
                processedRecords: status.processed_records,
                totalRecords: status.total_records,
                createdAt: new Date(status.created_at),
                startedAt: status.started_at ? new Date(status.started_at) : null,
                completedAt: status.completed_at ? new Date(status.completed_at) : null,
                expiresAt: status.expires_at ? new Date(status.expires_at) : null,
                estimatedCompletionTime: null, // Not provided in status response
                errorMessage: status.error_message,
                downloadUrl: status.download_url,
                filters,
            };
        },
        []
    );

    /**
     * Create a hotel export job
     */
    const createHotelExport = useCallback(
        async (filters: HotelExportFilters): Promise<void> => {
            const operationId = `create-hotel-${Date.now()}`;
            setIsCreating(true);
            setError(null);

            try {
                console.log('Creating hotel export with filters:', filters);

                const response = await exportAPI.createHotelExport(filters);

                if (!response.success || !response.data) {
                    const errorMessage =
                        response.error?.message || 'Failed to create hotel export';
                    const errorStatus = response.error?.status || 0;
                    setError(errorMessage);

                    // Determine if retry is allowed based on error type
                    const canRetryOperation = retryManager.canRetry('create-hotel-export', operationId) &&
                        errorStatus !== 403 && // Don't retry permission errors
                        errorStatus !== 400; // Don't retry validation errors

                    // Show error notification with retry button if applicable (Requirement 6.1, 6.2)
                    if (canRetryOperation) {
                        const retryCount = retryManager.getRetryCount('create-hotel-export', operationId);
                        addNotification({
                            type: 'error',
                            title: 'Export Creation Failed',
                            message: errorMessage,
                            action: {
                                label: 'Retry',
                                onClick: () => {
                                    retryManager.incrementRetry('create-hotel-export', operationId);
                                    createHotelExport(filters);
                                },
                            },
                            autoDismiss: false,
                            retryMetadata: {
                                operationType: 'create-hotel-export',
                                operationId,
                                retryCount,
                            },
                        });
                    } else {
                        // Show final error message without retry button (Requirement 6.4)
                        const retryCount = retryManager.getRetryCount('create-hotel-export', operationId);
                        const finalMessage = retryCount >= 3
                            ? `${errorMessage} Maximum retry attempts reached.`
                            : errorMessage;

                        addNotification({
                            type: 'error',
                            title: 'Export Creation Failed',
                            message: finalMessage,
                            autoDismiss: false,
                        });
                    }

                    throw new Error(errorMessage);
                }

                const { job_id, created_at, estimated_completion_time } = response.data;

                // Reset retry count on success
                retryManager.resetRetry('create-hotel-export', operationId);

                // Create initial job object with "pending" status (Requirement 1.5)
                const newJob: ExportJob = {
                    jobId: job_id,
                    exportType: 'hotel',
                    status: 'pending',
                    progress: 0,
                    processedRecords: 0,
                    totalRecords: response.data.estimated_records || 0,
                    createdAt: new Date(created_at),
                    startedAt: null,
                    completedAt: null,
                    expiresAt: null,
                    estimatedCompletionTime: estimated_completion_time ? new Date(estimated_completion_time) : null,
                    errorMessage: null,
                    downloadUrl: null,
                    filters,
                };

                // Add job to state
                setJobs((prevJobs) => [newJob, ...prevJobs]);

                console.log('Hotel export job created successfully:', job_id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to create hotel export';
                console.error('Error creating hotel export:', errorMessage);
                setError(errorMessage);
                throw err;
            } finally {
                setIsCreating(false);
            }
        },
        [retryManager, addNotification]
    );

    /**
     * Create a mapping export job
     */
    const createMappingExport = useCallback(
        async (filters: MappingExportFilters): Promise<void> => {
            const operationId = `create-mapping-${Date.now()}`;
            setIsCreating(true);
            setError(null);

            try {
                console.log('Creating mapping export with filters:', filters);

                const response = await exportAPI.createMappingExport(filters);

                if (!response.success || !response.data) {
                    const errorMessage =
                        response.error?.message || 'Failed to create mapping export';
                    const errorStatus = response.error?.status || 0;
                    setError(errorMessage);

                    // Determine if retry is allowed based on error type
                    const canRetryOperation = retryManager.canRetry('create-mapping-export', operationId) &&
                        errorStatus !== 403 && // Don't retry permission errors
                        errorStatus !== 400; // Don't retry validation errors

                    // Show error notification with retry button if applicable (Requirement 6.1, 6.2)
                    if (canRetryOperation) {
                        const retryCount = retryManager.getRetryCount('create-mapping-export', operationId);
                        addNotification({
                            type: 'error',
                            title: 'Export Creation Failed',
                            message: errorMessage,
                            action: {
                                label: 'Retry',
                                onClick: () => {
                                    retryManager.incrementRetry('create-mapping-export', operationId);
                                    createMappingExport(filters);
                                },
                            },
                            autoDismiss: false,
                            retryMetadata: {
                                operationType: 'create-mapping-export',
                                operationId,
                                retryCount,
                            },
                        });
                    } else {
                        // Show final error message without retry button (Requirement 6.4)
                        const retryCount = retryManager.getRetryCount('create-mapping-export', operationId);
                        const finalMessage = retryCount >= 3
                            ? `${errorMessage} Maximum retry attempts reached.`
                            : errorMessage;

                        addNotification({
                            type: 'error',
                            title: 'Export Creation Failed',
                            message: finalMessage,
                            autoDismiss: false,
                        });
                    }

                    throw new Error(errorMessage);
                }

                const { job_id, created_at, estimated_completion_time } = response.data;

                // Reset retry count on success
                retryManager.resetRetry('create-mapping-export', operationId);

                // Create initial job object with "pending" status (Requirement 1.5)
                const newJob: ExportJob = {
                    jobId: job_id,
                    exportType: 'mapping',
                    status: 'pending',
                    progress: 0,
                    processedRecords: 0,
                    totalRecords: response.data.estimated_records || 0,
                    createdAt: new Date(created_at),
                    startedAt: null,
                    completedAt: null,
                    expiresAt: null,
                    estimatedCompletionTime: estimated_completion_time ? new Date(estimated_completion_time) : null,
                    errorMessage: null,
                    downloadUrl: null,
                    filters,
                };

                // Add job to state
                setJobs((prevJobs) => [newJob, ...prevJobs]);

                console.log('Mapping export job created successfully:', job_id);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to create mapping export';
                console.error('Error creating mapping export:', errorMessage);
                setError(errorMessage);
                throw err;
            } finally {
                setIsCreating(false);
            }
        },
        [retryManager, addNotification]
    );

    /**
     * Refresh the status of a specific job
     */
    const refreshJobStatus = useCallback(async (jobId: string): Promise<void> => {
        setError(null);

        try {
            console.log('Refreshing status for job:', jobId);

            const response = await exportAPI.getExportStatus(jobId);

            if (!response.success || !response.data) {
                const errorMessage =
                    response.error?.message || 'Failed to refresh job status';
                setError(errorMessage);
                throw new Error(errorMessage);
            }

            const statusData = response.data;

            // Update the job in state
            setJobs((prevJobs) =>
                prevJobs.map((job) => {
                    if (job.jobId === jobId) {
                        return {
                            ...job,
                            status: statusData.status,
                            progress: statusData.progress_percentage,
                            processedRecords: statusData.processed_records,
                            totalRecords: statusData.total_records,
                            startedAt: statusData.started_at
                                ? new Date(statusData.started_at)
                                : job.startedAt,
                            completedAt: statusData.completed_at
                                ? new Date(statusData.completed_at)
                                : job.completedAt,
                            expiresAt: statusData.expires_at
                                ? new Date(statusData.expires_at)
                                : job.expiresAt,
                            errorMessage: statusData.error_message,
                            downloadUrl: statusData.download_url,
                        };
                    }
                    return job;
                })
            );

            console.log('Job status refreshed successfully:', statusData);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to refresh job status';
            console.error('Error refreshing job status:', errorMessage);
            setError(errorMessage);
            throw err;
        }
    }, []);

    /**
     * Delete a job from the list (API + local state)
     */
    const deleteJob = useCallback(async (jobId: string): Promise<void> => {
        console.log('Deleting job:', jobId);

        try {
            // Call API to delete job
            const response = await exportAPI.deleteExportJob(jobId);

            if (response.success) {
                console.log(`✅ Job deleted from API: ${jobId}`);
            } else {
                console.warn(`⚠️ API delete failed, removing from local state only`);
            }
        } catch (error) {
            console.error('Error deleting job from API:', error);
            // Continue to remove from local state even if API fails
        }

        // Remove from local state regardless of API result
        setJobs((prevJobs) => prevJobs.filter((job) => job.jobId !== jobId));
    }, []);

    /**
     * Clear all completed and failed jobs from the list (API + local state)
     */
    const clearCompletedJobs = useCallback(async (): Promise<void> => {
        console.log('Clearing completed and failed jobs');

        try {
            // Call API to clear completed jobs
            const response = await exportAPI.clearCompletedJobs();

            if (response.success) {
                console.log(`✅ Cleared ${response.data?.deleted_count || 0} jobs from API`);
            } else {
                console.warn(`⚠️ API clear failed, removing from local state only`);
            }
        } catch (error) {
            console.error('Error clearing jobs from API:', error);
            // Continue to remove from local state even if API fails
        }

        // Remove from local state regardless of API result
        setJobs((prevJobs) =>
            prevJobs.filter(
                (job) => job.status !== 'completed' && job.status !== 'failed' && job.status !== 'expired'
            )
        );
    }, []);

    /**
     * Refresh all jobs from API
     * Useful after API key validation or when user wants to manually refresh
     */
    const refreshJobs = useCallback(async (): Promise<void> => {
        setIsLoadingJobs(true);
        setError(null);

        try {
            console.log('🔄 Refreshing export jobs from API...');

            const response = await exportAPI.getExportJobs();

            if (response.success && response.data) {
                console.log(`✅ Refreshed ${response.data.jobs.length} jobs from API`);

                // Convert API response to ExportJob format
                const apiJobs: ExportJob[] = response.data.jobs.map((job: any) => {
                    // Normalize export type (API returns plural, frontend uses singular)
                    let exportType: 'hotel' | 'mapping' = 'mapping';
                    if (job.export_type === 'mappings') {
                        exportType = 'mapping';
                    } else if (job.export_type === 'hotels' || job.export_type === 'hotel') {
                        exportType = 'hotel';
                    }

                    return {
                        jobId: job.job_id,
                        exportType,
                        status: job.status,
                        progress: job.progress_percentage || 0,
                        processedRecords: job.processed_records || 0,
                        totalRecords: job.total_records || 0,
                        createdAt: new Date(job.created_at),
                        startedAt: job.started_at ? new Date(job.started_at) : null,
                        completedAt: job.completed_at ? new Date(job.completed_at) : null,
                        expiresAt: job.expires_at ? new Date(job.expires_at) : null,
                        estimatedCompletionTime: null,
                        errorMessage: job.error_message || null,
                        downloadUrl: job.download_url || null,
                        filters: {
                            ...(job.filters || {}),
                            format: job.format || job.filters?.format || 'json',
                        },
                    };
                });

                setJobs(apiJobs);
                saveJobsToStorage(apiJobs);
            } else {
                const errorMessage = response.error?.message || 'Failed to refresh jobs';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh jobs';
            console.error('❌ Error refreshing jobs:', errorMessage);
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoadingJobs(false);
        }
    }, []);

    return {
        jobs,
        createHotelExport,
        createMappingExport,
        refreshJobStatus,
        refreshJobs,
        deleteJob,
        clearCompletedJobs,
        isCreating,
        isLoading: isLoadingJobs, // Expose loading state
        error,
    };
}
