/**
 * Custom hook for managing retry functionality for failed operations
 * Tracks retry counts and prevents infinite retry loops
 */

import { useRef, useCallback } from 'react';

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
    clearAllRetries: () => void;
}

/**
 * Hook for managing retry attempts for failed operations
 * Tracks retry counts per operation to prevent infinite retry loops
 */
export function useRetryManager(): UseRetryManagerReturn {
    // Store retry state for each operation
    // Key format: "operationType:operationId"
    const retryStateRef = useRef<Map<string, RetryState>>(new Map());

    /**
     * Generate key for retry state map
     */
    const getKey = useCallback((operationType: string, operationId: string): string => {
        return `${operationType}:${operationId}`;
    }, []);

    /**
     * Check if an operation can be retried
     * Returns false if max retries reached
     */
    const canRetry = useCallback(
        (operationType: string, operationId: string): boolean => {
            const key = getKey(operationType, operationId);
            const state = retryStateRef.current.get(key);

            if (!state) {
                return true; // First attempt
            }

            return state.count < MAX_RETRIES;
        },
        [getKey]
    );

    /**
     * Get current retry count for an operation
     */
    const getRetryCount = useCallback(
        (operationType: string, operationId: string): number => {
            const key = getKey(operationType, operationId);
            const state = retryStateRef.current.get(key);
            return state?.count || 0;
        },
        [getKey]
    );

    /**
     * Increment retry count for an operation
     * Returns the new retry count
     */
    const incrementRetry = useCallback(
        (operationType: string, operationId: string): number => {
            const key = getKey(operationType, operationId);
            const state = retryStateRef.current.get(key);

            const newCount = (state?.count || 0) + 1;
            const newState: RetryState = {
                count: newCount,
                lastAttempt: Date.now(),
            };

            retryStateRef.current.set(key, newState);

            console.log(
                `Retry attempt ${newCount}/${MAX_RETRIES} for ${operationType}:${operationId}`
            );

            return newCount;
        },
        [getKey]
    );

    /**
     * Reset retry count for an operation
     * Called when operation succeeds
     */
    const resetRetry = useCallback(
        (operationType: string, operationId: string): void => {
            const key = getKey(operationType, operationId);
            retryStateRef.current.delete(key);
            console.log(`Retry count reset for ${operationType}:${operationId}`);
        },
        [getKey]
    );

    /**
     * Clear all retry states
     * Useful for cleanup or reset scenarios
     */
    const clearAllRetries = useCallback((): void => {
        retryStateRef.current.clear();
        console.log('All retry states cleared');
    }, []);

    return {
        canRetry,
        getRetryCount,
        incrementRetry,
        resetRetry,
        clearAllRetries,
    };
}
