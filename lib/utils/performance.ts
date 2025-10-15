/**
 * Performance optimization utilities for animations and components
 * Provides lazy loading, hardware acceleration, and reduced motion support
 */

import React from 'react';

/**
 * Lazy loading hook for heavy components
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
): [T | null, boolean] {
    const [Component, setComponent] = React.useState<T | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        let isMounted = true;

        importFn()
            .then((module) => {
                if (isMounted) {
                    setComponent(() => module.default);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error('Failed to load component:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [importFn]);

    return [Component, isLoading];
}

/**
 * Intersection Observer hook for lazy loading with performance optimization
 */
export function useIntersectionObserver(
    options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement | null>, boolean] {
    const [isIntersecting, setIsIntersecting] = React.useState(false);
    const elementRef = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);

                // Disconnect after first intersection for performance
                if (entry.isIntersecting && options.rootMargin !== '0px') {
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [options]);

    return [elementRef, isIntersecting];
}

/**
 * Reduced motion preference detection
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
}

/**
 * Hardware acceleration utilities
 */
export const hardwareAcceleration = {
    /**
     * Apply hardware acceleration styles to an element
     */
    enable: (element: HTMLElement) => {
        element.style.transform = element.style.transform || 'translateZ(0)';
        element.style.willChange = 'transform, opacity';
    },

    /**
     * Remove hardware acceleration styles
     */
    disable: (element: HTMLElement) => {
        element.style.willChange = 'auto';
    },

    /**
     * CSS properties for hardware acceleration
     */
    styles: {
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden' as const,
        perspective: '1000px',
    },
};

/**
 * Performance-optimized animation hook
 */
export function usePerformanceOptimizedAnimation(
    animationFn: () => void,
    dependencies: React.DependencyList = [],
    options: {
        throttle?: number;
        useRAF?: boolean;
        reducedMotion?: boolean;
    } = {}
) {
    const { throttle = 16, useRAF = true, reducedMotion = true } = options;
    const prefersReducedMotion = useReducedMotion();
    const rafRef = React.useRef<number | undefined>(undefined);
    const lastCallRef = React.useRef<number>(0);

    const optimizedAnimation = React.useCallback(() => {
        if (reducedMotion && prefersReducedMotion) {
            return; // Skip animation if reduced motion is preferred
        }

        const now = Date.now();
        if (now - lastCallRef.current < throttle) {
            return; // Throttle animation calls
        }

        lastCallRef.current = now;

        if (useRAF) {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = requestAnimationFrame(animationFn);
        } else {
            animationFn();
        }
    }, [animationFn, throttle, useRAF, reducedMotion, prefersReducedMotion]);

    React.useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        optimizedAnimation();
    }, dependencies);

    return optimizedAnimation;
}

/**
 * Debounced resize observer for responsive components
 */
export function useResizeObserver(
    callback: (entry: ResizeObserverEntry) => void,
    debounceMs: number = 100
): React.RefObject<HTMLElement | null> {
    const elementRef = React.useRef<HTMLElement>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    React.useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                entries.forEach(callback);
            }, debounceMs);
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [callback, debounceMs]);

    return elementRef;
}

/**
 * Memory-efficient animation state manager
 */
export function useAnimationState<T extends string>(
    initialState: T,
    states: Record<T, { duration: number; easing?: string }>
) {
    const [currentState, setCurrentState] = React.useState<T>(initialState);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    const transition = React.useCallback((newState: T) => {
        if (currentState === newState || isAnimating) return;

        setIsAnimating(true);
        setCurrentState(newState);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsAnimating(false);
        }, states[newState].duration);
    }, [currentState, isAnimating, states]);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        currentState,
        isAnimating,
        transition,
        config: states[currentState],
    };
}

/**
 * Viewport-based animation trigger
 */
export function useViewportAnimation(
    threshold: number = 0.1,
    triggerOnce: boolean = true
) {
    const [isVisible, setIsVisible] = React.useState(false);
    const [hasTriggered, setHasTriggered] = React.useState(false);
    const elementRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        const element = elementRef.current;
        if (!element || (triggerOnce && hasTriggered)) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        setHasTriggered(true);
                        observer.disconnect();
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, triggerOnce, hasTriggered]);

    return { isVisible, elementRef };
}

/**
 * Performance monitoring for animations
 */
export class AnimationPerformanceMonitor {
    private static instance: AnimationPerformanceMonitor;
    private metrics: Map<string, number[]> = new Map();

    static getInstance(): AnimationPerformanceMonitor {
        if (!AnimationPerformanceMonitor.instance) {
            AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor();
        }
        return AnimationPerformanceMonitor.instance;
    }

    startMeasure(name: string): void {
        performance.mark(`${name}-start`);
    }

    endMeasure(name: string): number {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        const measure = performance.getEntriesByName(name, 'measure')[0];
        const duration = measure.duration;

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const measurements = this.metrics.get(name)!;
        measurements.push(duration);

        // Keep only last 100 measurements
        if (measurements.length > 100) {
            measurements.shift();
        }

        return duration;
    }

    getAverageTime(name: string): number {
        const measurements = this.metrics.get(name);
        if (!measurements || measurements.length === 0) return 0;

        return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
    }

    clearMetrics(name?: string): void {
        if (name) {
            this.metrics.delete(name);
        } else {
            this.metrics.clear();
        }
    }
}

/**
 * CSS-in-JS performance optimization
 */
export function createOptimizedStyles(
    styles: Record<string, React.CSSProperties>,
    prefersReducedMotion: boolean = false
): Record<string, React.CSSProperties> {
    const optimizedStyles: Record<string, React.CSSProperties> = {};

    Object.entries(styles).forEach(([key, style]) => {
        optimizedStyles[key] = {
            ...style,
            ...hardwareAcceleration.styles,
            // Disable animations if reduced motion is preferred
            ...(prefersReducedMotion && {
                animationDuration: '0.01ms',
                transitionDuration: '0.01ms',
            }),
        };
    });

    return optimizedStyles;
}

/**
 * Batch DOM updates for better performance
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
        updates.forEach(update => update());
    });
}

/**
 * Optimized scroll handler
 */
export function useOptimizedScroll(
    callback: (scrollY: number) => void,
    throttleMs: number = 16
) {
    const lastScrollY = React.useRef(0);
    const ticking = React.useRef(false);

    const handleScroll = React.useCallback(() => {
        lastScrollY.current = window.scrollY;

        if (!ticking.current) {
            requestAnimationFrame(() => {
                callback(lastScrollY.current);
                ticking.current = false;
            });
            ticking.current = true;
        }
    }, [callback]);

    React.useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);
}