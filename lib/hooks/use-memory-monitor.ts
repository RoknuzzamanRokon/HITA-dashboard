/**
 * React hook for memory monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { memoryMonitor, type MemoryInfo } from '@/lib/utils/memory-monitor';

export interface UseMemoryMonitorOptions {
    monitoringInterval?: number;
    autoStart?: boolean;
}

export function useMemoryMonitor(options: UseMemoryMonitorOptions = {}) {
    const { monitoringInterval = 5000, autoStart = true } = options;

    const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);

    const updateMemoryInfo = useCallback(() => {
        const info = memoryMonitor.getMemoryInfo();
        setMemoryInfo(info);
    }, []);

    const checkMemoryForOperation = useCallback((itemCount: number, bytesPerItem?: number) => {
        return memoryMonitor.canPerformOperation(itemCount, bytesPerItem);
    }, []);

    const getRecommendedLimit = useCallback(() => {
        return memoryMonitor.getRecommendedDisplayLimit();
    }, []);

    const clearMemory = useCallback(() => {
        memoryMonitor.clearMemory();
        updateMemoryInfo();
    }, [updateMemoryInfo]);

    const getWarningMessage = useCallback((itemCount: number) => {
        return memoryMonitor.getMemoryWarning(itemCount);
    }, []);

    // Start monitoring effect - only runs once on mount if autoStart is true
    useEffect(() => {
        if (!autoStart) return;

        setIsMonitoring(true);
        updateMemoryInfo(); // Get initial reading

        const stopMonitoringFn = memoryMonitor.startMonitoring(monitoringInterval);
        const unsubscribe = memoryMonitor.subscribe(setMemoryInfo);

        return () => {
            stopMonitoringFn();
            unsubscribe();
            setIsMonitoring(false);
        };
    }, []); // Empty dependency array - only run once on mount

    const startMonitoring = useCallback(() => {
        if (isMonitoring) return () => { };

        setIsMonitoring(true);
        updateMemoryInfo();

        const stopMonitoringFn = memoryMonitor.startMonitoring(monitoringInterval);
        const unsubscribe = memoryMonitor.subscribe(setMemoryInfo);

        return () => {
            stopMonitoringFn();
            unsubscribe();
            setIsMonitoring(false);
        };
    }, [isMonitoring, monitoringInterval, updateMemoryInfo]);

    const stopMonitoring = useCallback(() => {
        setIsMonitoring(false);
    }, []);

    return {
        memoryInfo,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        updateMemoryInfo,
        checkMemoryForOperation,
        getRecommendedLimit,
        clearMemory,
        getWarningMessage,

        // Computed values
        isMemorySupported: memoryInfo !== null,
        isLowMemory: memoryInfo?.isLowMemory ?? false,
        isHighMemory: memoryInfo?.isHighMemory ?? false,
        usagePercentage: memoryInfo?.usagePercentage ?? 0,
    };
}