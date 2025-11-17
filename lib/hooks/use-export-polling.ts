/**
 * Custom hook for polling export job status
 * Automatically polls processing jobs every 5 seconds until completion
 * Implements exponential backoff on repeated API errors
 */

import { useEffect, useRef } from 'react';
import { exportAPI } from '@/lib/api/exports';
import type { ExportJob, ExportJobStatus } from '@/lib/types/exports';

interface UseExportPollingOptions {
    jobs: ExportJob[];
    onStatusUpdate: (jobId: string, status: ExportJobStatus) => void;
    pollingInterval?: number; // default: 5000ms
}

interface PollingState {
    intervalId: NodeJS.Timeout;
    errorCount: number;
    lastPollTime: number;
}

const DEFAULT_POLLING_INTERVAL = 5000; // 5 seconds
const MAX_ERROR_COUNT = 3; // Stop polling after 3 consecutive failures
const EXPONENTIAL_BACKOFF_BASE = 2; // Multiplier for backoff

/**
 * Hook for automatic polling of export job status
 * 
 * Features:
 * - Polls only jobs with "processing" status
 * - Uses separate interval for each job to avoid race conditions
 * - Stops polling when job reaches "completed" or "failed" status
 * - Implements exponential backoff on repeated API errors
 * - Cleans up all intervals on unmount
 * 
 * @param options - Configuration options for polling behavior
 */
export function useExportPolling({
    jobs,
    onStatusUpdate,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
}: UseExportPollingOptions): void {
    // Store polling state for each job
    const pollingStatesRef = useRef<Map<string, PollingState>>(new Map());

    useEffect(() => {
        const pollingStates = pollingStatesRef.current;

        // Get jobs that need polling (status = "processing")
        const processingJobs = jobs.filter((job) => job.status === 'processing');

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

                try {
                    console.log(`📊 Polling status for job: ${job.jobId}`);

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

                    // Success - reset error count
                    state.errorCount = 0;
                    state.lastPollTime = Date.now();

                    const statusData = response.data;
                    console.log(
                        `✅ Job ${job.jobId} status: ${statusData.status} (${statusData.progress_percentage}%)`
                    );

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
                    }
                }
            };

            // Start polling interval
            const intervalId = setInterval(pollJobStatus, pollingInterval);

            // Store polling state
            pollingStates.set(job.jobId, {
                intervalId,
                errorCount: 0,
                lastPollTime: Date.now(),
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
    }, [jobs, onStatusUpdate, pollingInterval]);

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
