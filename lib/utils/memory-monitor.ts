/**
 * Memory monitoring utilities for frontend performance
 */

export interface MemoryInfo {
    usedMB: number;
    totalMB: number;
    limitMB: number;
    usagePercentage: number;
    isLowMemory: boolean;
    isHighMemory: boolean;
}

export class MemoryMonitor {
    private static instance: MemoryMonitor;
    private callbacks: ((info: MemoryInfo) => void)[] = [];

    static getInstance(): MemoryMonitor {
        if (!MemoryMonitor.instance) {
            MemoryMonitor.instance = new MemoryMonitor();
        }
        return MemoryMonitor.instance;
    }

    /**
     * Get current memory information
     */
    getMemoryInfo(): MemoryInfo | null {
        if (!('memory' in performance)) {
            return null;
        }

        const memInfo = (performance as any).memory;
        const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memInfo.totalJSHeapSize / 1048576);
        const limitMB = Math.round(memInfo.jsHeapSizeLimit / 1048576);
        const usagePercentage = Math.round((usedMB / limitMB) * 100);

        return {
            usedMB,
            totalMB,
            limitMB,
            usagePercentage,
            isLowMemory: usagePercentage > 80,
            isHighMemory: usagePercentage > 60,
        };
    }

    /**
     * Check if an operation is safe to perform based on memory usage
     */
    canPerformOperation(estimatedItemCount: number, bytesPerItem: number = 1024): boolean {
        const memInfo = this.getMemoryInfo();
        if (!memInfo) return true; // If we can't check memory, assume it's safe

        const estimatedMemoryMB = Math.round((estimatedItemCount * bytesPerItem) / 1048576);
        const projectedUsage = ((memInfo.usedMB + estimatedMemoryMB) / memInfo.limitMB) * 100;

        return projectedUsage < 90; // Don't exceed 90% of memory limit
    }

    /**
     * Get recommended display limit based on current memory usage
     */
    getRecommendedDisplayLimit(): number {
        const memInfo = this.getMemoryInfo();
        if (!memInfo) return 1000;

        if (memInfo.isLowMemory) return 250;
        if (memInfo.isHighMemory) return 500;
        return 1000;
    }

    /**
     * Subscribe to memory changes
     */
    subscribe(callback: (info: MemoryInfo) => void): () => void {
        this.callbacks.push(callback);
        return () => {
            const index = this.callbacks.indexOf(callback);
            if (index > -1) {
                this.callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Start monitoring memory usage
     */
    startMonitoring(intervalMs: number = 5000): () => void {
        const interval = setInterval(() => {
            const memInfo = this.getMemoryInfo();
            if (memInfo) {
                this.callbacks.forEach(callback => callback(memInfo));
            }
        }, intervalMs);

        return () => clearInterval(interval);
    }

    /**
     * Force garbage collection if available
     */
    forceGarbageCollection(): void {
        if ('gc' in window) {
            (window as any).gc();
        }
    }

    /**
     * Clear large objects and force cleanup
     */
    clearMemory(): void {
        // Clear any global caches or large objects
        this.forceGarbageCollection();
    }

    /**
     * Get memory usage warning message
     */
    getMemoryWarning(itemCount: number): string | null {
        const memInfo = this.getMemoryInfo();
        if (!memInfo) return null;

        if (memInfo.isLowMemory) {
            return `High memory usage (${memInfo.usagePercentage}%). Showing limited results to prevent browser crashes.`;
        }

        if (memInfo.isHighMemory && itemCount > 1000) {
            return `Memory usage is elevated (${memInfo.usagePercentage}%). Consider using pagination or filters.`;
        }

        return null;
    }
}

export const memoryMonitor = MemoryMonitor.getInstance();