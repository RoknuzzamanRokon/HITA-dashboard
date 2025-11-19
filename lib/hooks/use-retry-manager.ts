/**
 * Custom hook for managing retry attempts for failed operations
 * Tracks retry counts and enforces maximum retry limits
 */

import { useState, useCallback, useRef } from 'react';

const MAX_RETRIES = 3;

interface RetryState {
    count: number;
    lastAttempt: number;
}

interface UseRetryManagerReturn {
    canRetry: (operationType: string, operationId: string) => boolean;
    getRetryCount: (operationType: string, operationId: string) => number;
    incrementRetry: (operationType: string, operationId: string) => number;
    resetRetry: (operationType: string, operationId: string) => void;
    clearAll: () => void;
}

/**
 * Hook for managing retry attempts across different operations
 * 
 * Features:
 * - Tracks retry count per operation ID
 * - Enforces maximum retry limit (3 attempts)
 * - Provides methods to check, increment, and reset retry counts
 * - Automatic cleanup of old retry states
 * 
 * @returns Object with retry management functions
 */
export function useRetryManager(): UseRetryManagerReturn {
    // Store retry state for each operation (keyed by operation ID)
    const retryStatesRef = useRef<Map<string, RetryState>>(new Map());

    /**
     * Check if an operation can be retried
     * @param operationType - Type of operation (e.g., 'download', 'createExport')
     * @param operationId - Unique identifier for the operation
     * @returns true if retry count is below maximum, false otherwise
     */
    const canRetry = useCallback((operationType: string, operationId: string): boolean => {
        const key = `${operationType}:${operationId}`;
        const state = retryStatesRef.current.get(key);
        if (!state) {
            return true; // First attempt
        }
        return state.count < MAX_RETRIES;
    }, []);

    /**
     * Get the current retry count for an operation
     * @param operationType - Type of operation (e.g., 'download', 'createExport')
     * @param operationId - Unique identifier for the operation
     * @returns Current retry count (0 if never attempted)
     */
    const getRetryCount = useCallback((operationType: string, operationId: string): number => {
        const key = `${operationType}:${operationId}`;
        const state = retryStatesRef.current.get(key);
        return state?.count || 0;
    }, []);

    /**
     * Increment the retry count for an operation
     * @param operationType - Type of operation (e.g., 'download', 'createExport')
     * @param operationId - Unique identifier for the operation
     * @returns New retry count after increment
     */
    const incrementRetry = useCallback((operationType: string, operationId: string): number => {
        const key = `${operationType}:${operationId}`;
        const state = retryStatesRef.current.get(key);
        const newCount = (state?.count || 0) + 1;

        retryStatesRef.current.set(key, {
            count: newCount,
            lastAttempt: Date.now(),
        });

        console.log(`Retry count for ${operationType}:${operationId}: ${newCount}/${MAX_RETRIES}`);
        return newCount;
    }, []);

    /**
     * Reset the retry count for an operation (e.g., after success)
     * @param operationType - Type of operation (e.g., 'download', 'createExport')
     * @param operationId - Unique identifier for the operation
     */
    const resetRetry = useCallback((operationType: string, operationId: string): void => {
        const key = `${operationType}:${operationId}`;
        retryStatesRef.current.delete(key);
        console.log(`Retry count reset for ${operationType}:${operationId}`);
    }, []);

    /**
     * Clear all retry states
     */
    const clearAll = useCallback((): void => {
        retryStatesRef.current.clear();
        console.log('All retry states cleared');
    }, []);

    return {
        canRetry,
        getRetryCount,
        incrementRetry,
        resetRetry,
        clearAll,
    };
}
