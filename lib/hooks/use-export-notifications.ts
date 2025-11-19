/**
 * Custom hook for managing export job notifications
 * Watches for job status changes and triggers appropriate notifications
 */

import { useEffect, useRef } from 'react';
import { useNotification } from '@/lib/components/notifications/notification-provider';
import type { ExportJob } from '@/lib/types/exports';

interface UseExportNotificationsOptions {
    jobs: ExportJob[];
    onDownload: (jobId: string) => void;
}

const NOTIFIED_JOBS_KEY = 'export_notified_jobs';

/**
 * Load notified jobs from localStorage
 */
const loadNotifiedJobs = (): Map<string, Set<string>> => {
    try {
        const stored = localStorage.getItem(NOTIFIED_JOBS_KEY);
        if (!stored) return new Map();

        const parsed = JSON.parse(stored);
        const map = new Map<string, Set<string>>();

        Object.entries(parsed).forEach(([jobId, events]) => {
            map.set(jobId, new Set(events as string[]));
        });

        return map;
    } catch (error) {
        console.error('Error loading notified jobs:', error);
        return new Map();
    }
};

/**
 * Save notified jobs to localStorage
 */
const saveNotifiedJobs = (notifiedJobs: Map<string, Set<string>>): void => {
    try {
        const obj: Record<string, string[]> = {};
        notifiedJobs.forEach((events, jobId) => {
            obj[jobId] = Array.from(events);
        });
        localStorage.setItem(NOTIFIED_JOBS_KEY, JSON.stringify(obj));
    } catch (error) {
        console.error('Error saving notified jobs:', error);
    }
};

/**
 * Hook for managing export notifications
 * Triggers notifications when jobs are created, completed, or failed
 * Implements deduplication to avoid duplicate notifications
 */
export function useExportNotifications({
    jobs,
    onDownload,
}: UseExportNotificationsOptions): void {
    const { addNotification } = useNotification();

    // Track which jobs have been notified to prevent duplicates
    // Load from localStorage on mount - use lazy initialization
    const notifiedJobsRef = useRef<Map<string, Set<string>> | null>(null);

    // Initialize on first render only
    if (notifiedJobsRef.current === null) {
        notifiedJobsRef.current = loadNotifiedJobs();
        console.log('🔄 Initialized notified jobs from localStorage:',
            Array.from(notifiedJobsRef.current.entries()).map(([id, events]) => ({
                jobId: id,
                events: Array.from(events)
            }))
        );
    }

    useEffect(() => {
        const notifiedJobs = notifiedJobsRef.current!;

        // Debug: Log loaded notification state
        console.log('📋 Loaded notified jobs:', Array.from(notifiedJobs.entries()).map(([id, events]) => ({
            jobId: id,
            events: Array.from(events)
        })));

        jobs.forEach((job) => {
            const jobId = job.jobId;

            // Initialize tracking set for this job if it doesn't exist
            if (!notifiedJobs.has(jobId)) {
                notifiedJobs.set(jobId, new Set());
            }

            const notifiedEvents = notifiedJobs.get(jobId)!;

            // Debug: Log check for each job
            console.log(`🔍 Checking job ${jobId}: status=${job.status}, notified=${Array.from(notifiedEvents)}`);

            // Notification for job creation (Requirement 1.2)
            // Trigger when job is first seen with pending or processing status
            if ((job.status === 'pending' || job.status === 'processing') && !notifiedEvents.has('created')) {
                console.log(`🔔 Showing creation notification for job ${jobId}`);
                addNotification({
                    type: 'success',
                    title: 'Export Job Created',
                    message: `${job.exportType === 'hotel' ? 'Hotel' : 'Mapping'} export (${jobId}) has been created successfully.`,
                    autoDismiss: true,
                    duration: 5000,
                });

                notifiedEvents.add('created');
                saveNotifiedJobs(notifiedJobs); // Save immediately after adding
                console.log(`✅ Notification sent: Job ${jobId} created`);
            }

            // Notification for job completion (Requirement 3.1, 3.2, 3.4)
            // Trigger when job status changes to completed
            const isCompleted = job.status === 'completed';
            const alreadyNotified = notifiedEvents.has('completed');

            console.log(`📊 Job ${jobId} completion check: isCompleted=${isCompleted}, alreadyNotified=${alreadyNotified}`);

            if (isCompleted && !alreadyNotified) {
                // Get export type and format for the notification message
                const exportTypeLabel = job.exportType === 'hotel' ? 'Hotel' : 'Mapping';
                const format = job.filters.format?.toUpperCase() || 'JSON';

                console.log(`🔔 Showing completion notification for job ${jobId}`);

                addNotification({
                    type: 'success',
                    title: 'Export Complete',
                    message: `${exportTypeLabel} export (${format}) completed successfully. ${job.processedRecords} records exported.`,
                    action: {
                        label: 'Download',
                        onClick: () => onDownload(jobId),
                    },
                    autoDismiss: true, // Auto-dismiss after 10 seconds
                    duration: 10000, // 10 seconds
                });

                notifiedEvents.add('completed');
                saveNotifiedJobs(notifiedJobs); // Save immediately after adding
                console.log(`✅ Notification sent: Job ${jobId} completed`);
            } else if (isCompleted && alreadyNotified) {
                console.log(`⏭️ Skipping notification for job ${jobId} - already notified`);
            }

            // Notification for job failure (Requirement 3.5, 6.6)
            // Trigger when job status changes to failed
            if (job.status === 'failed' && !notifiedEvents.has('failed')) {
                const exportTypeLabel = job.exportType === 'hotel' ? 'Hotel' : 'Mapping';

                console.log(`🔔 Showing failure notification for job ${jobId}`);
                addNotification({
                    type: 'error',
                    title: 'Export Failed',
                    message:
                        job.errorMessage ||
                        `${exportTypeLabel} export job ${jobId} has failed. Please try again.`,
                    autoDismiss: false, // Requirement 3.5: Persistent notification (not auto-dismissed)
                });

                notifiedEvents.add('failed');
                saveNotifiedJobs(notifiedJobs); // Save immediately after adding
                console.log(`✅ Notification sent: Job ${jobId} failed`);
            }

            // Notification for job expiration (Requirement 4.5, 4.6)
            // Trigger when job status changes to expired
            if (job.status === 'expired' && !notifiedEvents.has('expired')) {
                console.log(`🔔 Showing expiration notification for job ${jobId}`);
                addNotification({
                    type: 'warning',
                    title: 'Export Expired',
                    message: `Export job ${jobId} has expired. The download link is no longer available. Please create a new export if needed.`,
                    autoDismiss: false, // Warning notifications stay until dismissed
                });

                notifiedEvents.add('expired');
                saveNotifiedJobs(notifiedJobs); // Save immediately after adding
                console.log(`✅ Notification sent: Job ${jobId} expired`);
            }
        });

        // Cleanup: Remove tracking for jobs that no longer exist
        const currentJobIds = new Set(jobs.map((job) => job.jobId));
        const trackedJobIds = Array.from(notifiedJobs.keys());

        trackedJobIds.forEach((jobId) => {
            if (!currentJobIds.has(jobId)) {
                notifiedJobs.delete(jobId);
                console.log(`🧹 Cleanup: Removed tracking for job ${jobId}`);
            }
        });

        // Save notified jobs to localStorage after cleanup
        saveNotifiedJobs(notifiedJobs);
        console.log(`💾 Saved notified jobs to localStorage:`, Array.from(notifiedJobs.entries()).map(([id, events]) => ({
            jobId: id,
            events: Array.from(events)
        })));
    }, [jobs, addNotification, onDownload]);
}
