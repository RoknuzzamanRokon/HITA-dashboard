/**
 * Animation utilities for enhanced UI components
 * Provides smooth animations, transitions, and micro-interactions
 * Includes performance optimizations and reduced motion support
 */

import React from 'react';
import { useReducedMotion, hardwareAcceleration } from './performance';

export type AnimationType = 'slide' | 'fade' | 'scale' | 'bounce';
export type EasingType = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

/**
 * Predefined easing functions for smooth animations
 */
export const easings = {
    easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
    easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
    easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
    easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
    easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Animation duration presets
 */
export const durations = {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
} as const;

/**
 * Create a ripple effect at the click position
 */
export function createRipple(event: React.MouseEvent<HTMLElement>, color: string = 'rgba(255, 255, 255, 0.3)') {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
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
    background: ${color};
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    z-index: 0;
  `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Calculate stagger delay for list animations
 */
export function getStaggerDelay(index: number, baseDelay: number = 100): number {
    return index * baseDelay;
}

/**
 * Generate CSS custom properties for animations
 */
export function generateAnimationProps(
    duration: number = durations.normal,
    easing: string = easings.easeOutCubic,
    delay: number = 0
): React.CSSProperties {
    return {
        '--animation-duration': `${duration}ms`,
        '--animation-easing': easing,
        '--animation-delay': `${delay}ms`,
    } as React.CSSProperties;
}

/**
 * Animation configuration for different component states
 */
export const animationConfigs = {
    modal: {
        slide: {
            enter: 'animate-slide-in-from-bottom',
            exit: 'animate-slide-out-to-bottom',
        },
        fade: {
            enter: 'animate-fade-in',
            exit: 'animate-fade-out',
        },
        scale: {
            enter: 'animate-scale-in',
            exit: 'animate-scale-out',
        },
    },
    card: {
        hover: 'hover:scale-[1.02] hover:shadow-lg transition-all duration-300',
        click: 'active:scale-[0.98] transition-transform duration-150',
    },
    button: {
        hover: 'hover:scale-105 transition-transform duration-200',
        click: 'active:scale-95 transition-transform duration-150',
    },
} as const;

/**
 * Intersection Observer hook for scroll animations
 */
export function useScrollAnimation(threshold: number = 0.1) {
    const [isVisible, setIsVisible] = React.useState(false);
    const elementRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    return { isVisible, elementRef };
}

/**
 * Debounced animation trigger
 */
export function useDebounceAnimation(callback: () => void, delay: number = 300) {
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    const trigger = React.useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(callback, delay);
    }, [callback, delay]);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return trigger;
}

/**
 * Spring animation configuration
 */
export const springConfigs = {
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
    slow: { tension: 280, friction: 60 },
    molasses: { tension: 280, friction: 120 },
} as const;

/**
 * Performance-optimized animation hook with reduced motion support
 */
export function useOptimizedAnimation(
    animationClass: string,
    options: {
        duration?: number;
        delay?: number;
        reducedMotionFallback?: string;
    } = {}
) {
    const prefersReducedMotion = useReducedMotion();
    const { duration = durations.normal, delay = 0, reducedMotionFallback } = options;

    const animationProps = React.useMemo(() => {
        if (prefersReducedMotion) {
            return {
                className: reducedMotionFallback || '',
                style: {
                    ...hardwareAcceleration.styles,
                    animationDuration: '0.01ms',
                    transitionDuration: '0.01ms',
                },
            };
        }

        return {
            className: animationClass,
            style: {
                ...hardwareAcceleration.styles,
                animationDuration: `${duration}ms`,
                animationDelay: `${delay}ms`,
            },
        };
    }, [prefersReducedMotion, animationClass, duration, delay, reducedMotionFallback]);

    return animationProps;
}

/**
 * Hardware-accelerated transform hook
 */
export function useHardwareAcceleration(elementRef: React.RefObject<HTMLElement>) {
    React.useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        hardwareAcceleration.enable(element);

        return () => {
            hardwareAcceleration.disable(element);
        };
    }, [elementRef]);
}

/**
 * Optimized ripple effect with reduced motion support
 */
export function createOptimizedRipple(
    event: React.MouseEvent<HTMLElement>,
    color: string = 'rgba(255, 255, 255, 0.3)',
    prefersReducedMotion: boolean = false
) {
    if (prefersReducedMotion) {
        // Simple highlight effect instead of ripple
        const element = event.currentTarget;
        element.style.backgroundColor = color;
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 150);
        return;
    }

    createRipple(event, color);
}

/**
 * Staggered animation hook for lists
 */
export function useStaggeredAnimation(
    itemCount: number,
    baseDelay: number = 100,
    animationClass: string = 'animate-fade-in'
) {
    const prefersReducedMotion = useReducedMotion();

    return React.useMemo(() => {
        if (prefersReducedMotion) {
            return Array.from({ length: itemCount }, (_, index) => ({
                className: '',
                style: { opacity: 1 },
            }));
        }

        return Array.from({ length: itemCount }, (_, index) => ({
            className: animationClass,
            style: {
                ...hardwareAcceleration.styles,
                animationDelay: `${getStaggerDelay(index, baseDelay)}ms`,
            },
        }));
    }, [itemCount, baseDelay, animationClass, prefersReducedMotion]);
}