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
    const notifiedJobsRef = useRef<Map<string, Set<string>>>(new Map());

    useEffect(() => {
        jobs.forEach((job) => {
            const jobId = job.jobId;

            // Initialize tracking set for this job if it doesn't exist
            if (!notifiedJobsRef.current.has(jobId)) {
                notifiedJobsRef.current.set(jobId, new Set());
            }

            const notifiedEvents = notifiedJobsRef.current.get(jobId)!;

            // Notification for job creation (Requirement 5.1)
            // Trigger when job is first seen with processing status
            if (job.status === 'processing' && !notifiedEvents.has('created')) {
                addNotification({
                    type: 'success',
                    title: 'Export Job Created',
                    message: `Export job ${jobId} has been created and is now processing.`,
                    autoDismiss: true,
                    duration: 5000,
                });

                notifiedEvents.add('created');
                console.log(`Notification sent: Job ${jobId} created`);
            }

            // Notification for job completion (Requirement 5.2)
            // Trigger when job status changes to completed
            if (job.status === 'completed' && !notifiedEvents.has('completed')) {
                addNotification({
                    type: 'success',
                    title: 'Export Complete',
                    message: `Export job ${jobId} has completed successfully. ${job.processedRecords} records exported.`,
                    action: {
                        label: 'Download',
                        onClick: () => onDownload(jobId),
                    },
                    autoDismiss: true,
                    duration: 8000, // Longer duration for completed jobs with action
                });

                notifiedEvents.add('completed');
                console.log(`Notification sent: Job ${jobId} completed`);
            }

            // Notification for job failure (Requirement 5.3)
            // Trigger when job status changes to failed
            if (job.status === 'failed' && !notifiedEvents.has('failed')) {
                addNotification({
                    type: 'error',
                    title: 'Export Failed',
                    message:
                        job.errorMessage ||
                        `Export job ${jobId} has failed. Please try again.`,
                    autoDismiss: false, // Error notifications stay until dismissed
                });

                notifiedEvents.add('failed');
                console.log(`Notification sent: Job ${jobId} failed`);
            }

            // Notification for job expiration (Requirement 4.5, 4.6)
            // Trigger when job status changes to expired
            if (job.status === 'expired' && !notifiedEvents.has('expired')) {
                addNotification({
                    type: 'warning',
                    title: 'Export Expired',
                    message: `Export job ${jobId} has expired. The download link is no longer available. Please create a new export if needed.`,
                    autoDismiss: false, // Warning notifications stay until dismissed
                });

                notifiedEvents.add('expired');
                console.log(`Notification sent: Job ${jobId} expired`);
            }
        });

        // Cleanup: Remove tracking for jobs that no longer exist
        const currentJobIds = new Set(jobs.map((job) => job.jobId));
        const trackedJobIds = Array.from(notifiedJobsRef.current.keys());

        trackedJobIds.forEach((jobId) => {
            if (!currentJobIds.has(jobId)) {
                notifiedJobsRef.current.delete(jobId);
                console.log(`Cleanup: Removed tracking for job ${jobId}`);
            }
        });
    }, [jobs, addNotification, onDownload]);
}
