/**
 * Custom hook for polling export job status
 * Automatically polls processing jobs every 5 seconds until completion
 * Implements exponential backoff on repeated API errors
 * 
 * Optimizations:
 * - Page Visibility API: Pauses polling when tab is inactive
 * - Request deduplication: Prevents duplicate status checks
 * - Response caching: Caches status responses for 5 seconds
 * - Concurrent request limiting: Limits to 5 simultaneous polling requests
 * - Proper cleanup: Cleans up all intervals on unmount
 */

import { useEffect, useRef, useCallback } from 'react';
import { exportAPI } from '@/lib/api/exports';
import type { ExportJob, ExportJobStatus } from '@/lib/types/exports';

interface UseExportPollingOptions {
    jobs: ExportJob[];
    onStatusUpdate: (jobId: string, status: ExportJobStatus) => void;
    onPollingError?: (jobId: string, errorMessage: string) => void; // Callback for polling errors
    pollingInterval?: number; // default: 5000ms
}

interface PollingState {
    intervalId: NodeJS.Timeout;
    errorCount: number;
    lastPollTime: number;
    isPolling: boolean; // Track if a request is in flight
}

interface CachedStatus {
    data: ExportJobStatus;
    timestamp: number;
}

const DEFAULT_POLLING_INTERVAL = 5000; // 5 seconds
const MAX_ERROR_COUNT = 3; // Stop polling after 3 consecutive failures
const EXPONENTIAL_BACKOFF_BASE = 2; // Multiplier for backoff
const CACHE_DURATION = 5000; // 5 seconds cache
const MAX_CONCURRENT_POLLS = 10; // Maximum concurrent polling requests (Requirement 8.5)

/**
 * Hook for automatic polling of export job status
 * 
 * Features:
 * - Polls only jobs with "processing" status
 * - Uses separate interval for each job to avoid race conditions
 * - Stops polling when job reaches "completed" or "failed" status
 * - Implements exponential backoff on repeated API errors
 * - Cleans up all intervals on unmount
 * - Pauses polling when tab is inactive (Page Visibility API)
 * - Deduplicates concurrent requests for the same job
 * - Caches status responses for 5 seconds
 * - Limits concurrent polling requests to 5 maximum
 * 
 * @param options - Configuration options for polling behavior
 */
export function useExportPolling({
    jobs,
    onStatusUpdate,
    onPollingError,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
}: UseExportPollingOptions): void {
    // Store polling state for each job
    const pollingStatesRef = useRef<Map<string, PollingState>>(new Map());

    // Cache for status responses
    const statusCacheRef = useRef<Map<string, CachedStatus>>(new Map());

    // Track if tab is visible
    const isTabVisibleRef = useRef<boolean>(true);

    // Track number of active polling requests
    const activeRequestsRef = useRef<number>(0);

    // Get cached status if available and not expired
    const getCachedStatus = useCallback((jobId: string): ExportJobStatus | null => {
        const cached = statusCacheRef.current.get(jobId);
        if (!cached) {
            return null;
        }

        const now = Date.now();
        if (now - cached.timestamp > CACHE_DURATION) {
            // Cache expired
            statusCacheRef.current.delete(jobId);
            return null;
        }

        return cached.data;
    }, []);

    // Cache status response
    const cacheStatus = useCallback((jobId: string, status: ExportJobStatus): void => {
        statusCacheRef.current.set(jobId, {
            data: status,
            timestamp: Date.now(),
        });
    }, []);

    useEffect(() => {
        const pollingStates = pollingStatesRef.current;

        // Get jobs that need polling (status = "pending" or "processing") - Requirement 2.1
        const processingJobs = jobs.filter((job) => job.status === 'pending' || job.status === 'processing');

        // Start polling for new processing jobs
        processingJobs.forEach((job) => {
            // Skip if already polling this job
            if (pollingStates.has(job.jobId)) {
                return;
            }

            console.log(`🔄 Starting polling for job: ${job.jobId}`);

            // Create polling function for this specific job
            const pollJobStatus = async () => {
                const state = pollingStates.get(job.jobId);
                if (!state) {
                    return; // Job was removed from polling
                }

                // Skip if tab is not visible (Page Visibility API optimization)
                if (!isTabVisibleRef.current) {
                    console.log(`⏸️ Skipping poll for job ${job.jobId} - tab not visible`);
                    return;
                }

                // Skip if already polling this job (request deduplication)
                if (state.isPolling) {
                    console.log(`⏭️ Skipping poll for job ${job.jobId} - request already in flight`);
                    return;
                }

                // Check if we've hit the concurrent request limit
                if (activeRequestsRef.current >= MAX_CONCURRENT_POLLS) {
                    console.log(`⏭️ Skipping poll for job ${job.jobId} - max concurrent requests (${MAX_CONCURRENT_POLLS}) reached`);
                    return;
                }

                // Check cache first
                const cachedStatus = getCachedStatus(job.jobId);
                if (cachedStatus) {
                    console.log(`💾 Using cached status for job: ${job.jobId}`);
                    onStatusUpdate(job.jobId, cachedStatus);

                    // Stop polling if job reached terminal state
                    if (cachedStatus.status === 'completed' || cachedStatus.status === 'failed') {
                        console.log(`🏁 Job ${job.jobId} reached terminal state (cached): ${cachedStatus.status}`);
                        stopPollingJob(job.jobId);
                    }
                    return;
                }

                // Mark as polling and increment active requests
                state.isPolling = true;
                activeRequestsRef.current++;

                try {
                    console.log(`📊 Polling status for job: ${job.jobId} (active requests: ${activeRequestsRef.current})`);

                    const response = await exportAPI.getExportStatus(job.jobId);

                    if (!response.success || !response.data) {
                        // API error occurred
                        state.errorCount++;
                        console.error(
                            `❌ Polling error for job ${job.jobId} (attempt ${state.errorCount}/${MAX_ERROR_COUNT}):`,
                            response.error?.message
                        );

                        // Check if we've exceeded max error count
                        if (state.errorCount >= MAX_ERROR_COUNT) {
                            console.error(
                                `🛑 Stopping polling for job ${job.jobId} after ${MAX_ERROR_COUNT} consecutive failures`
                            );
                            stopPollingJob(job.jobId);

                            // Notify about polling failure (Requirement 2.4, 6.1, 6.4)
                            if (onPollingError) {
                                const errorMessage = response.error?.message || 'Failed to fetch export status after multiple attempts';
                                onPollingError(job.jobId, errorMessage);
                            }
                            return;
                        }

                        // Implement exponential backoff
                        const backoffMultiplier = Math.pow(
                            EXPONENTIAL_BACKOFF_BASE,
                            state.errorCount
                        );
                        const backoffDelay = pollingInterval * backoffMultiplier;

                        console.log(
                            `⏳ Applying exponential backoff: ${backoffDelay}ms for job ${job.jobId}`
                        );

                        // Clear current interval and create new one with backoff delay
                        clearInterval(state.intervalId);
                        const newIntervalId = setInterval(pollJobStatus, backoffDelay);
                        state.intervalId = newIntervalId;
                        pollingStates.set(job.jobId, state);

                        return;
                    }

                    // Success - reset error count and cache the response
                    state.errorCount = 0;
                    state.lastPollTime = Date.now();

                    const statusData = response.data;
                    console.log(
                        `✅ Job ${job.jobId} status: ${statusData.status} (${statusData.progress_percentage}%)`
                    );

                    // Cache the status response
                    cacheStatus(job.jobId, statusData);

                    // Call the status update callback
                    onStatusUpdate(job.jobId, statusData);

                    // Stop polling if job reached terminal state
                    if (
                        statusData.status === 'completed' ||
                        statusData.status === 'failed'
                    ) {
                        console.log(
                            `🏁 Job ${job.jobId} reached terminal state: ${statusData.status}`
                        );
                        stopPollingJob(job.jobId);
                    }
                } catch (error) {
                    // Unexpected error
                    state.errorCount++;
                    console.error(
                        `❌ Unexpected polling error for job ${job.jobId}:`,
                        error
                    );

                    // Stop polling if max errors reached
                    if (state.errorCount >= MAX_ERROR_COUNT) {
                        console.error(
                            `🛑 Stopping polling for job ${job.jobId} after ${MAX_ERROR_COUNT} consecutive failures`
                        );
                        stopPollingJob(job.jobId);

                        // Notify about polling failure (Requirement 2.4, 6.1, 6.4)
                        if (onPollingError) {
                            const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred while polling export status';
                            onPollingError(job.jobId, errorMessage);
                        }
                    }
                } finally {
                    // Always mark as not polling and decrement active requests
                    state.isPolling = false;
                    activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
                }
            };

            // Start polling interval
            const intervalId = setInterval(pollJobStatus, pollingInterval);

            // Store polling state
            pollingStates.set(job.jobId, {
                intervalId,
                errorCount: 0,
                lastPollTime: Date.now(),
                isPolling: false,
            });

            // Do initial poll immediately
            pollJobStatus();
        });

        // Stop polling for jobs that are no longer processing
        const processingJobIds = new Set(processingJobs.map((job) => job.jobId));
        pollingStates.forEach((state, jobId) => {
            if (!processingJobIds.has(jobId)) {
                console.log(`⏹️ Stopping polling for job: ${jobId} (no longer processing)`);
                stopPollingJob(jobId);
            }
        });

        // Cleanup function to stop all polling on unmount
        return () => {
            console.log('🧹 Cleaning up all polling intervals');
            pollingStates.forEach((state, jobId) => {
                clearInterval(state.intervalId);
            });
            pollingStates.clear();
        };
    }, [jobs, onStatusUpdate, pollingInterval, getCachedStatus, cacheStatus]);

    // Set up Page Visibility API to pause polling when tab is inactive
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isVisible = document.visibilityState === 'visible';
            isTabVisibleRef.current = isVisible;

            if (isVisible) {
                console.log('👁️ Tab became visible - resuming polling');
                // Clear cache when tab becomes visible to get fresh data
                statusCacheRef.current.clear();
            } else {
                console.log('🙈 Tab became hidden - pausing polling');
            }
        };

        // Set initial visibility state
        isTabVisibleRef.current = document.visibilityState === 'visible';

        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup listener on unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    /**
     * Stop polling for a specific job
     */
    const stopPollingJob = (jobId: string): void => {
        const state = pollingStatesRef.current.get(jobId);
        if (state) {
            clearInterval(state.intervalId);
            pollingStatesRef.current.delete(jobId);
            console.log(`✋ Polling stopped for job: ${jobId}`);
        }
    };
}
