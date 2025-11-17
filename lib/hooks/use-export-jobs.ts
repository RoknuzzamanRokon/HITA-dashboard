/**
 * Custom hook for managing export jobs state and operations
 * Handles job creation, status updates, deletion, and persistence
 */

import { useState, useCallback } from 'react';
import { exportAPI } from '@/lib/api/exports';
import type {
    ExportJob,
    HotelExportFilters,
    MappingExportFilters,
    ExportJobStatus,
} from '@/lib/types/exports';

interface UseExportJobsReturn {
    jobs: ExportJob[];
    createHotelExport: (filters: HotelExportFilters) => Promise<void>;
    createMappingExport: (filters: MappingExportFilters) => Promise<void>;
    refreshJobStatus: (jobId: string) => Promise<void>;
    deleteJob: (jobId: string) => void;
    clearCompletedJobs: () => void;
    isCreating: boolean;
    error: string | null;
}

/**
 * Hook for managing export jobs
 * Provides functions to create, update, and manage export jobs
 */
export function useExportJobs(): UseExportJobsReturn {
    const [jobs, setJobs] = useState<ExportJob[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setIsCreating(true);
            setError(null);

            try {
                console.log('Creating hotel export with filters:', filters);

                const response = await exportAPI.createHotelExport(filters);

                if (!response.success || !response.data) {
                    const errorMessage =
                        response.error?.message || 'Failed to create hotel export';
                    setError(errorMessage);
                    throw new Error(errorMessage);
                }

                const { job_id, created_at } = response.data;

                // Create initial job object
                const newJob: ExportJob = {
                    jobId: job_id,
                    exportType: 'hotel',
                    status: 'processing',
                    progress: 0,
                    processedRecords: 0,
                    totalRecords: response.data.estimated_records || 0,
                    createdAt: new Date(created_at),
                    startedAt: null,
                    completedAt: null,
                    expiresAt: null,
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
        []
    );

    /**
     * Create a mapping export job
     */
    const createMappingExport = useCallback(
        async (filters: MappingExportFilters): Promise<void> => {
            setIsCreating(true);
            setError(null);

            try {
                console.log('Creating mapping export with filters:', filters);

                const response = await exportAPI.createMappingExport(filters);

                if (!response.success || !response.data) {
                    const errorMessage =
                        response.error?.message || 'Failed to create mapping export';
                    setError(errorMessage);
                    throw new Error(errorMessage);
                }

                const { job_id, created_at } = response.data;

                // Create initial job object
                const newJob: ExportJob = {
                    jobId: job_id,
                    exportType: 'mapping',
                    status: 'processing',
                    progress: 0,
                    processedRecords: 0,
                    totalRecords: response.data.estimated_records || 0,
                    createdAt: new Date(created_at),
                    startedAt: null,
                    completedAt: null,
                    expiresAt: null,
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
        []
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
     * Delete a job from the list
     */
    const deleteJob = useCallback((jobId: string): void => {
        console.log('Deleting job:', jobId);
        setJobs((prevJobs) => prevJobs.filter((job) => job.jobId !== jobId));
    }, []);

    /**
     * Clear all completed and failed jobs from the list
     */
    const clearCompletedJobs = useCallback((): void => {
        console.log('Clearing completed and failed jobs');
        setJobs((prevJobs) =>
            prevJobs.filter(
                (job) => job.status !== 'completed' && job.status !== 'failed'
            )
        );
    }, []);

    return {
        jobs,
        createHotelExport,
        createMappingExport,
        refreshJobStatus,
        deleteJob,
        clearCompletedJobs,
        isCreating,
        error,
    };
}
