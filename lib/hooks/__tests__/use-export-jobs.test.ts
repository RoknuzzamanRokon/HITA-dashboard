/**
 * Unit tests for useExportJobs hook
 * Tests job creation, deletion, status updates, and persistence
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useExportJobs } from '../use-export-jobs';
import { exportAPI } from '@/lib/api/exports';
import type { HotelExportFilters, MappingExportFilters } from '@/lib/types/exports';

// Mock the export API
jest.mock('@/lib/api/exports');

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useExportJobs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Job Creation', () => {
        it('should create a hotel export job successfully', async () => {
            const mockResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing',
                    estimated_records: 1000,
                    estimated_completion_time: '2025-01-17T12:00:00Z',
                    created_at: '2025-01-17T11:00:00Z',
                    message: 'Export job created',
                },
            };

            (exportAPI.createHotelExport as jest.Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useExportJobs());

            const filters: HotelExportFilters = {
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
            };

            await act(async () => {
                await result.current.createHotelExport(filters);
            });

            expect(result.current.jobs).toHaveLength(1);
            expect(result.current.jobs[0]).toMatchObject({
                jobId: 'exp_123456',
                exportType: 'hotel',
                status: 'processing',
                progress: 0,
                processedRecords: 0,
                totalRecords: 1000,
            });
            expect(result.current.isCreating).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should create a mapping export job successfully', async () => {
            const mockResponse = {
                success: true,
                data: {
                    job_id: 'exp_789012',
                    status: 'processing',
                    estimated_records: 500,
                    estimated_completion_time: '2025-01-17T12:00:00Z',
                    created_at: '2025-01-17T11:00:00Z',
                    message: 'Export job created',
                },
            };

            (exportAPI.createMappingExport as jest.Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useExportJobs());

            const filters: MappingExportFilters = {
                filters: {
                    suppliers: ['supplier1'],
                    ittids: 'All',
                    date_from: '2025-01-01T00:00:00Z',
                    date_to: '2025-01-31T23:59:59Z',
                    max_records: 500,
                },
                format: 'csv',
            };

            await act(async () => {
                await result.current.createMappingExport(filters);
            });

            expect(result.current.jobs).toHaveLength(1);
            expect(result.current.jobs[0]).toMatchObject({
                jobId: 'exp_789012',
                exportType: 'mapping',
                status: 'processing',
                totalRecords: 500,
            });
        });

        it('should handle job creation errors', async () => {
            const mockResponse = {
                success: false,
                error: {
                    message: 'Failed to create export',
                },
            };

            (exportAPI.createHotelExport as jest.Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useExportJobs());

            const filters: HotelExportFilters = {
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
            };

            await act(async () => {
                try {
                    await result.current.createHotelExport(filters);
                } catch (error) {
                    // Expected error
                }
            });

            expect(result.current.jobs).toHaveLength(0);
            expect(result.current.error).toBe('Failed to create export');
            expect(result.current.isCreating).toBe(false);
        });
    });

    describe('Job Status Updates', () => {
        it('should refresh job status successfully', async () => {
            // First create a job
            const createResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing',
                    estimated_records: 1000,
                    estimated_completion_time: '2025-01-17T12:00:00Z',
                    created_at: '2025-01-17T11:00:00Z',
                    message: 'Export job created',
                },
            };

            (exportAPI.createHotelExport as jest.Mock).mockResolvedValue(createResponse);

            const { result } = renderHook(() => useExportJobs());

            const filters: HotelExportFilters = {
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
            };

            await act(async () => {
                await result.current.createHotelExport(filters);
            });

            // Now refresh the status
            const statusResponse = {
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

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(statusResponse);

            await act(async () => {
                await result.current.refreshJobStatus('exp_123456');
            });

            expect(result.current.jobs[0]).toMatchObject({
                jobId: 'exp_123456',
                status: 'completed',
                progress: 100,
                processedRecords: 1000,
                totalRecords: 1000,
                downloadUrl: 'https://example.com/download/exp_123456',
            });
        });
    });

    describe('Job Deletion', () => {
        it('should delete a job from the list', async () => {
            const mockResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing',
                    estimated_records: 1000,
                    estimated_completion_time: '2025-01-17T12:00:00Z',
                    created_at: '2025-01-17T11:00:00Z',
                    message: 'Export job created',
                },
            };

            (exportAPI.createHotelExport as jest.Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useExportJobs());

            const filters: HotelExportFilters = {
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
            };

            await act(async () => {
                await result.current.createHotelExport(filters);
            });

            expect(result.current.jobs).toHaveLength(1);

            act(() => {
                result.current.deleteJob('exp_123456');
            });

            expect(result.current.jobs).toHaveLength(0);
        });
    });

    describe('Clear Completed Jobs', () => {
        it('should clear all completed and failed jobs', async () => {
            // Create multiple jobs with different statuses
            const jobs = [
                {
                    success: true,
                    data: {
                        job_id: 'exp_111',
                        status: 'processing',
                        estimated_records: 1000,
                        estimated_completion_time: '2025-01-17T12:00:00Z',
                        created_at: '2025-01-17T11:00:00Z',
                        message: 'Export job created',
                    },
                },
                {
                    success: true,
                    data: {
                        job_id: 'exp_222',
                        status: 'processing',
                        estimated_records: 1000,
                        estimated_completion_time: '2025-01-17T12:00:00Z',
                        created_at: '2025-01-17T11:00:00Z',
                        message: 'Export job created',
                    },
                },
            ];

            (exportAPI.createHotelExport as jest.Mock)
                .mockResolvedValueOnce(jobs[0])
                .mockResolvedValueOnce(jobs[1]);

            const { result } = renderHook(() => useExportJobs());

            const filters: HotelExportFilters = {
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
            };

            await act(async () => {
                await result.current.createHotelExport(filters);
                await result.current.createHotelExport(filters);
            });

            // Update one job to completed
            const statusResponse1 = {
                success: true,
                data: {
                    job_id: 'exp_111',
                    status: 'completed' as const,
                    progress_percentage: 100,
                    processed_records: 1000,
                    total_records: 1000,
                    created_at: '2025-01-17T11:00:00Z',
                    started_at: '2025-01-17T11:01:00Z',
                    completed_at: '2025-01-17T11:05:00Z',
                    error_message: null,
                    download_url: 'https://example.com/download/exp_111',
                    expires_at: '2025-01-18T11:05:00Z',
                },
            };

            (exportAPI.getExportStatus as jest.Mock).mockResolvedValue(statusResponse1);

            await act(async () => {
                await result.current.refreshJobStatus('exp_111');
            });

            expect(result.current.jobs).toHaveLength(2);
            expect(result.current.jobs[0].status).toBe('completed');
            expect(result.current.jobs[1].status).toBe('processing');

            act(() => {
                result.current.clearCompletedJobs();
            });

            expect(result.current.jobs).toHaveLength(1);
            expect(result.current.jobs[0].jobId).toBe('exp_222');
        });
    });

    describe('Persistence', () => {
        it('should save jobs to localStorage', async () => {
            const mockResponse = {
                success: true,
                data: {
                    job_id: 'exp_123456',
                    status: 'processing',
                    estimated_records: 1000,
                    estimated_completion_time: '2025-01-17T12:00:00Z',
                    created_at: '2025-01-17T11:00:00Z',
                    message: 'Export job created',
                },
            };

            (exportAPI.createHotelExport as jest.Mock).mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useExportJobs());

            const filters: HotelExportFilters = {
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
            };

            await act(async () => {
                await result.current.createHotelExport(filters);
            });

            const stored = localStorageMock.getItem('export_jobs');
            expect(stored).toBeTruthy();

            const parsed = JSON.parse(stored!);
            expect(parsed).toHaveLength(1);
            expect(parsed[0].jobId).toBe('exp_123456');
        });

        it('should load jobs from localStorage on mount', () => {
            const storedJobs = [
                {
                    jobId: 'exp_123456',
                    exportType: 'hotel',
                    status: 'processing',
                    progress: 50,
                    processedRecords: 500,
                    totalRecords: 1000,
                    createdAt: new Date().toISOString(),
                    startedAt: null,
                    completedAt: null,
                    expiresAt: null,
                    errorMessage: null,
                    downloadUrl: null,
                    filters: {},
                },
            ];

            localStorageMock.setItem('export_jobs', JSON.stringify(storedJobs));

            const { result } = renderHook(() => useExportJobs());

            expect(result.current.jobs).toHaveLength(1);
            expect(result.current.jobs[0].jobId).toBe('exp_123456');
        });

        it('should filter out expired jobs on load', () => {
            const oldDate = new Date();
            oldDate.setHours(oldDate.getHours() - 25); // 25 hours ago

            const storedJobs = [
                {
                    jobId: 'exp_old',
                    exportType: 'hotel',
                    status: 'completed',
                    progress: 100,
                    processedRecords: 1000,
                    totalRecords: 1000,
                    createdAt: oldDate.toISOString(),
                    startedAt: null,
                    completedAt: null,
                    expiresAt: null,
                    errorMessage: null,
                    downloadUrl: null,
                    filters: {},
                },
                {
                    jobId: 'exp_new',
                    exportType: 'hotel',
                    status: 'processing',
                    progress: 50,
                    processedRecords: 500,
                    totalRecords: 1000,
                    createdAt: new Date().toISOString(),
                    startedAt: null,
                    completedAt: null,
                    expiresAt: null,
                    errorMessage: null,
                    downloadUrl: null,
                    filters: {},
                },
            ];

            localStorageMock.setItem('export_jobs', JSON.stringify(storedJobs));

            const { result } = renderHook(() => useExportJobs());

            expect(result.current.jobs).toHaveLength(1);
            expect(result.current.jobs[0].jobId).toBe('exp_new');
        });
    });
});
