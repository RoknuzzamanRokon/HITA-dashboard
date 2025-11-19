import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to a readable string
 */
export function formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date and time to a readable string
 */
export function formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

/**
 * Format numbers with commas
 */
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

/**
 * Calculate time remaining until expiration (Requirement 5.5)
 * Returns a human-readable string like "2h 30m" or "Expired"
 */
export function formatTimeRemaining(expiresAt: Date | string | null): string {
    if (!expiresAt) return 'N/A';

    const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();

    // If expired
    if (diffMs <= 0) {
        return 'Expired';
    }

    // Calculate time units
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Format based on time remaining
    if (diffDays > 0) {
        const hours = diffHours % 24;
        return hours > 0 ? `${diffDays}d ${hours}h` : `${diffDays}d`;
    } else if (diffHours > 0) {
        const minutes = diffMinutes % 60;
        return minutes > 0 ? `${diffHours}h ${minutes}m` : `${diffHours}h`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes}m`;
    } else {
        return 'Less than 1m';
    }
}

/**
 * Format estimated completion time (Requirement 7.4)
 * Returns a human-readable string like "~5m" or "~2h 30m"
 */
export function formatEstimatedTime(estimatedTime: Date | string | null): string {
    if (!estimatedTime) return null;

    const estimatedDate = typeof estimatedTime === 'string' ? new Date(estimatedTime) : estimatedTime;
    const now = new Date();
    const diffMs = estimatedDate.getTime() - now.getTime();

    // If time has passed
    if (diffMs <= 0) {
        return 'Soon';
    }

    // Calculate time units
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    // Format based on time remaining
    if (diffHours > 0) {
        const minutes = diffMinutes % 60;
        return minutes > 0 ? `~${diffHours}h ${minutes}m` : `~${diffHours}h`;
    } else if (diffMinutes > 0) {
        return `~${diffMinutes}m`;
    } else if (diffSeconds > 0) {
        return `~${diffSeconds}s`;
    } else {
        return 'Soon';
    }
}

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}/**

 * Animation utilities for enhanced UI components
 */

/**
 * Create a ripple effect at the click position
 */
export function createRipple(event: React.MouseEvent<HTMLElement>) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  `;

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Stagger animation delay for list items
 */
export function getStaggerDelay(index: number, baseDelay: number = 100): string {
    return `${index * baseDelay}ms`;
}

/**
 * Easing functions for smooth animations
 */
export const easings = {
    easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
    easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
    easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
    easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
} as const;

/**
 * Generate CSS custom properties for animations
 */
export function generateAnimationProps(duration: number = 300, easing: string = easings.easeOutCubic) {
    return {
        '--animation-duration': `${duration}ms`,
        '--animation-easing': easing,
    } as React.CSSProperties;
}