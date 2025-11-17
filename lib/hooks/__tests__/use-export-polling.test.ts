/**
 * Unit tests for useExportPolling hook
 * Tests polling intervals, cleanup, and error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useExportPolling } from '../use-export-polling';
import { exportAPI } from '@/lib/api/exports';
import type { ExportJob, ExportJobStatus } from '@/lib/types/exports';

// Mock the export API
jest.mock('@/lib/api/exports');

describe('useExportPolling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    const createMockJob = (
        jobId: string,
        status: 'processing' | 'completed' | 'failed' = 'processing'
    ): ExportJob => ({
        jobId,
        exportType: 'hotel',
        status,
        progress: 0,
        processedRecords: 0,
        totalRecords: 1000,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        expiresAt: null,
        errorMessage: null,
        downloadUrl: null,
        filters: {
            filters: {
                suppliers: ['supplier1'],
                country_codes: 'All',
                min_rating: 0,
                max_rating: 5,
                date_from: '2025-01-01T00:00:00Z',
                date_to: '2025-01-31T23:59:59Z',
                ittids: 'All',
                property_types: [],
                page: 1,
                page_size: 100,
                max_records: 1000,
            },
            format: 'json',
            include_locations: true,
            include_contacts: true,
            include_mappings: false,
        },
    });

    describe('Polling Intervals', () => {
        it('should start polling for processing jobs', async () => {
            const mockJob = createMockJob('exp_123456', 'processing');
            const onStatusUpdate = jest.fn();

            const mockStatusResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing' as const,
                    progress_percentage: 50,
                    processed_records: 500,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: null,
                    error_message: null,
                    download_url: null,
                    expires_at: null,
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(mockStatusResponse);

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Initial poll should happen immediately
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledWith('exp_123456');
            });

            expect(onStatusUpdate).toHaveBeenCalledWith('exp_123456', mockStatusResponse.data);
        });

        it('should poll at specified intervals', async () => {
            const mockJob = createMockJob('exp_123456', 'processing');
            const onStatusUpdate = jest.fn();

            const mockStatusResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing' as const,
                    progress_percentage: 50,
                    processed_records: 500,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: null,
                    error_message: null,
                    download_url: null,
                    expires_at: null,
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(mockStatusResponse);

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Wait for initial poll
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
            });

            // Advance time by 5 seconds
            act(() => {
                jest.advanceTimersByTime(5000);
            });

            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(2);
            });

            // Advance time by another 5 seconds
            act(() => {
                jest.advanceTimersByTime(5000);
            });

            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(3);
            });
        });

        it('should stop polling when job completes', async () => {
            const mockJob = createMockJob('exp_123456', 'processing');
            const onStatusUpdate = jest.fn();

            const mockStatusResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'completed' as const,
                    progress_percentage: 100,
                    processed_records: 1000,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: '2025-01-17T11:05:00Z',
                    error_message: null,
                    download_url: 'https://example.com/download/exp_123456',
                    expires_at: '2025-01-18T11:05:00Z',
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(mockStatusResponse);

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Wait for initial poll
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
            });

            // Advance time - should not poll again since job is completed
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            // Should still be 1 call (no additional polls)
            expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
        });

        it('should not poll jobs with completed status', async () => {
            const mockJob = createMockJob('exp_123456', 'completed');
            const onStatusUpdate = jest.fn();

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Advance time
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            // Should not have called the API at all
            expect(exportAPI.getExportStatus).not.toHaveBeenCalled();
        });

        it('should not poll jobs with failed status', async () => {
            const mockJob = createMockJob('exp_123456', 'failed');
            const onStatusUpdate = jest.fn();

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Advance time
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            // Should not have called the API at all
            expect(exportAPI.getExportStatus).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors and implement exponential backoff', async () => {
            const mockJob = createMockJob('exp_123456', 'processing');
            const onStatusUpdate = jest.fn();

            const mockErrorResponse = {
                success: false,
                error: {
                    message: 'API Error',
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(mockErrorResponse);

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Wait for initial poll (will fail)
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
            });

            // First error - backoff multiplier = 2^1 = 2, so next poll at 10000ms
            act(() => {
                jest.advanceTimersByTime(5000);
            });

            // Should not poll yet (needs 10000ms total)
            expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);

            act(() => {
                jest.advanceTimersByTime(5000);
            });

            // Now should poll again
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(2);
            });
        });

        it('should stop polling after max error count', async () => {
            const mockJob = createMockJob('exp_123456', 'processing');
            const onStatusUpdate = jest.fn();

            const mockErrorResponse = {
                success: false,
                error: {
                    message: 'API Error',
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(mockErrorResponse);

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Wait for initial poll (error 1)
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
            });

            // Advance to trigger second poll (error 2)
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(2);
            });

            // Advance to trigger third poll (error 3 - should stop)
            act(() => {
                jest.advanceTimersByTime(20000);
            });

            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(3);
            });

            // Advance more time - should not poll again
            act(() => {
                jest.advanceTimersByTime(100000);
            });

            // Should still be 3 calls (stopped after max errors)
            expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(3);
        });
    });

    describe('Cleanup', () => {
        it('should clean up polling intervals on unmount', async () => {
            const mockJob = createMockJob('exp_123456', 'processing');
            const onStatusUpdate = jest.fn();

            const mockStatusResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing' as const,
                    progress_percentage: 50,
                    processed_records: 500,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: null,
                    error_message: null,
                    download_url: null,
                    expires_at: null,
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(mockStatusResponse);

            const { unmount } = renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Wait for initial poll
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
            });

            // Unmount the hook
            unmount();

            // Advance time - should not poll after unmount
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            // Should still be 1 call (no polls after unmount)
            expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
        });

        it('should stop polling when job is removed from list', async () => {
            const mockJob = createMockJob('exp_123456', 'processing');
            const onStatusUpdate = jest.fn();

            const mockStatusResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing' as const,
                    progress_percentage: 50,
                    processed_records: 500,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: null,
                    error_message: null,
                    download_url: null,
                    expires_at: null,
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(mockStatusResponse);

            const { rerender } = renderHook(
                ({ jobs }) =>
                    useExportPolling({
                        jobs,
                        onStatusUpdate,
                        pollingInterval: 5000,
                    }),
                {
                    initialProps: { jobs: [mockJob] },
                }
            );

            // Wait for initial poll
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
            });

            // Remove job from list
            rerender({ jobs: [] });

            // Advance time - should not poll after job removed
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            // Should still be 1 call (no polls after job removed)
            expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
        });
    });

    describe('Multiple Jobs', () => {
        it('should poll multiple jobs independently', async () => {
            const mockJob1 = createMockJob('exp_111', 'processing');
            const mockJob2 = createMockJob('exp_222', 'processing');
            const onStatusUpdate = jest.fn();

            const mockStatusResponse1 = {
                success: true,
                data: {
                    job_id: 'exp_111',
                    status: 'processing' as const,
                    progress_percentage: 30,
                    processed_records: 300,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: null,
                    error_message: null,
                    download_url: null,
                    expires_at: null,
                },
            };

            const mockStatusResponse2 = {
                success: true,
                data: {
                    job_id: 'exp_222',
                    status: 'processing' as const,
                    progress_percentage: 70,
                    processed_records: 700,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: null,
                    error_message: null,
                    download_url: null,
                    expires_at: null,
                },
            };

            (exportAPI.getExportStatus as jest.Mock)
                .mockImplementation((jobId: string) => {
                    if (jobId === 'exp_111') {
                        return Promise.resolve(mockStatusResponse1);
                    } else if (jobId === 'exp_222') {
                        return Promise.resolve(mockStatusResponse2);
                    }
                });

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob1, mockJob2],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Wait for initial polls
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledWith('exp_111');
                expect(exportAPI.getExportStatus).toHaveBeenCalledWith('exp_222');
            });

            expect(onStatusUpdate).toHaveBeenCalledWith('exp_111', mockStatusResponse1.data);
            expect(onStatusUpdate).toHaveBeenCalledWith('exp_222', mockStatusResponse2.data);
        });
    });

    describe('Page Visibility API', () => {
        it('should pause polling when tab becomes hidden', async () => {
            const mockJob = createMockJob('exp_123456', 'processing');
            const onStatusUpdate = jest.fn();

            const mockStatusResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing' as const,
                    progress_percentage: 50,
                    processed_records: 500,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: null,
                    error_message: null,
                    download_url: null,
                    expires_at: null,
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(mockStatusResponse);

            renderHook(() =>
                useExportPolling({
                    jobs: [mockJob],
                    onStatusUpdate,
                    pollingInterval: 5000,
                })
            );

            // Wait for initial poll
            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);
            });

            // Simulate tab becoming hidden
            Object.defineProperty(document, 'visibilityState', {
                writable: true,
                configurable: true,
                value: 'hidden',
            });

            document.dispatchEvent(new Event('visibilitychange'));

            // Advance time - should not poll while hidden
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            // Should still be 1 call (paused while hidden)
            expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(1);

            // Simulate tab becoming visible again
            Object.defineProperty(document, 'visibilityState', {
                writable: true,
                configurable: true,
                value: 'visible',
            });

            document.dispatchEvent(new Event('visibilitychange'));

            // Advance time - should resume polling
            act(() => {
                jest.advanceTimersByTime(5000);
            });

            await waitFor(() => {
                expect(exportAPI.getExportStatus).toHaveBeenCalledTimes(2);
            });
        });
    });
});
