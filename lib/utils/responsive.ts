/**
 * Responsive design utilities for mobile, tablet, and desktop optimization
 * Provides breakpoint management, touch interactions, and adaptive layouts
 */

import React from 'react';

/**
 * Breakpoint definitions matching Tailwind CSS defaults
 */
export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Device type detection
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook to detect current breakpoint and device type
 */
export function useBreakpoint(): {
    breakpoint: Breakpoint | null;
    deviceType: DeviceType;
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
} {
    const [dimensions, setDimensions] = React.useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    React.useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { width, height } = dimensions;

    // Determine current breakpoint
    const breakpoint: Breakpoint | null = React.useMemo(() => {
        if (width >= breakpoints['2xl']) return '2xl';
        if (width >= breakpoints.xl) return 'xl';
        if (width >= breakpoints.lg) return 'lg';
        if (width >= breakpoints.md) return 'md';
        if (width >= breakpoints.sm) return 'sm';
        return null; // Below sm breakpoint
    }, [width]);

    // Determine device type
    const deviceType: DeviceType = React.useMemo(() => {
        if (width < breakpoints.md) return 'mobile';
        if (width < breakpoints.lg) return 'tablet';
        return 'desktop';
    }, [width]);

    return {
        breakpoint,
        deviceType,
        width,
        height,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
    };
}

/**
 * Touch device detection
 */
export function useTouchDevice(): boolean {
    const [isTouchDevice, setIsTouchDevice] = React.useState(false);

    React.useEffect(() => {
        const checkTouchDevice = () => {
            return (
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                // @ts-ignore
                navigator.msMaxTouchPoints > 0
            );
        };

        setIsTouchDevice(checkTouchDevice());
    }, []);

    return isTouchDevice;
}

/**
 * Orientation detection
 */
export function useOrientation(): 'portrait' | 'landscape' {
    const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

    React.useEffect(() => {
        const handleOrientationChange = () => {
            setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
        };

        handleOrientationChange(); // Set initial value
        window.addEventListener('resize', handleOrientationChange);
        return () => window.removeEventListener('resize', handleOrientationChange);
    }, []);

    return orientation;
}

/**
 * Responsive value hook - returns different values based on breakpoint
 */
export function useResponsiveValue<T>(values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    default: T;
}): T {
    const { deviceType } = useBreakpoint();

    return React.useMemo(() => {
        switch (deviceType) {
            case 'mobile':
                return values.mobile ?? values.default;
            case 'tablet':
                return values.tablet ?? values.default;
            case 'desktop':
                return values.desktop ?? values.default;
            default:
                return values.default;
        }
    }, [deviceType, values]);
}

/**
 * Touch gesture detection
 */
export interface TouchGesture {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    deltaX: number;
    deltaY: number;
    direction: 'left' | 'right' | 'up' | 'down' | null;
    distance: number;
}

export function useTouchGestures(
    onSwipe?: (gesture: TouchGesture) => void,
    threshold: number = 50
) {
    const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null);

    const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    }, []);

    const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
        if (!touchStart) return;

        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const deltaX = endX - touchStart.x;
        const deltaY = endY - touchStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < threshold) return;

        let direction: TouchGesture['direction'] = null;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }

        const gesture: TouchGesture = {
            startX: touchStart.x,
            startY: touchStart.y,
            endX,
            endY,
            deltaX,
            deltaY,
            direction,
            distance,
        };

        onSwipe?.(gesture);
        setTouchStart(null);
    }, [touchStart, onSwipe, threshold]);

    return {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
    };
}

/**
 * Responsive grid configuration
 */
export interface ResponsiveGridConfig {
    mobile: { columns: number; gap: string };
    tablet: { columns: number; gap: string };
    desktop: { columns: number; gap: string };
}

export function useResponsiveGrid(config: ResponsiveGridConfig) {
    const { deviceType } = useBreakpoint();

    return React.useMemo(() => {
        const currentConfig = config[deviceType];
        return {
            gridTemplateColumns: `repeat(${currentConfig.columns}, 1fr)`,
            gap: currentConfig.gap,
        };
    }, [deviceType, config]);
}

/**
 * Adaptive font size based on screen size
 */
export function useAdaptiveFontSize(
    baseSizes: {
        mobile: string;
        tablet: string;
        desktop: string;
    }
): string {
    const { deviceType } = useBreakpoint();
    return baseSizes[deviceType];
}

/**
 * Container query simulation
 */
export function useContainerQuery(
    containerRef: React.RefObject<HTMLElement>,
    breakpoints: Record<string, number>
): string | null {
    const [activeBreakpoint, setActiveBreakpoint] = React.useState<string | null>(null);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            const width = entry.contentRect.width;

            let currentBreakpoint: string | null = null;
            const sortedBreakpoints = Object.entries(breakpoints).sort(([, a], [, b]) => b - a);

            for (const [name, minWidth] of sortedBreakpoints) {
                if (width >= minWidth) {
                    currentBreakpoint = name;
                    break;
                }
            }

            setActiveBreakpoint(currentBreakpoint);
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [containerRef, breakpoints]);

    return activeBreakpoint;
}

/**
 * Safe area insets for mobile devices (notch support)
 */
export function useSafeAreaInsets(): {
    top: string;
    right: string;
    bottom: string;
    left: string;
} {
    const [insets, setInsets] = React.useState({
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    });

    React.useEffect(() => {
        const updateInsets = () => {
            const style = getComputedStyle(document.documentElement);
            setInsets({
                top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
                right: style.getPropertyValue('env(safe-area-inset-right)') || '0px',
                bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
                left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
            });
        };

        updateInsets();
        window.addEventListener('resize', updateInsets);
        return () => window.removeEventListener('resize', updateInsets);
    }, []);

    return insets;
}

/**
 * Responsive spacing utility
 */
export function getResponsiveSpacing(
    spacing: {
        mobile: string;
        tablet?: string;
        desktop?: string;
    },
    deviceType: DeviceType
): string {
    switch (deviceType) {
        case 'mobile':
            return spacing.mobile;
        case 'tablet':
            return spacing.tablet || spacing.mobile;
        case 'desktop':
            return spacing.desktop || spacing.tablet || spacing.mobile;
        default:
            return spacing.mobile;
    }
}

/**
 * Responsive class names utility
 */
export function getResponsiveClasses(
    classes: {
        mobile: string;
        tablet?: string;
        desktop?: string;
    },
    deviceType: DeviceType
): string {
    const baseClasses = classes.mobile;

    switch (deviceType) {
        case 'tablet':
            return `${baseClasses} ${classes.tablet || ''}`.trim();
        case 'desktop':
            return `${baseClasses} ${classes.tablet || ''} ${classes.desktop || ''}`.trim();
        default:
            return baseClasses;
    }
}

/**
 * Viewport height fix for mobile browsers
 */
export function useViewportHeight(): number {
    const [vh, setVh] = React.useState(
        typeof window !== 'undefined' ? window.innerHeight : 768
    );

    React.useEffect(() => {
        const updateVh = () => {
            // Use visualViewport if available (better for mobile)
            const height = window.visualViewport?.height || window.innerHeight;
            setVh(height);

            // Set CSS custom property for use in styles
            document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
        };

        updateVh();

        // Listen to both resize and visualViewport changes
        window.addEventListener('resize', updateVh);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateVh);
        }

        return () => {
            window.removeEventListener('resize', updateVh);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', updateVh);
            }
        };
    }, []);

    return vh;
}

/**
 * Responsive image loading
 */
export function useResponsiveImage(
    sources: {
        mobile: string;
        tablet?: string;
        desktop?: string;
    }
): string {
    const { deviceType } = useBreakpoint();

    return React.useMemo(() => {
        switch (deviceType) {
            case 'mobile':
                return sources.mobile;
            case 'tablet':
                return sources.tablet || sources.mobile;
            case 'desktop':
                return sources.desktop || sources.tablet || sources.mobile;
            default:
                return sources.mobile;
        }
    }, [deviceType, sources]);
}

/**
 * Touch-friendly button size
 */
export function getTouchFriendlySize(
    isTouchDevice: boolean,
    normalSize: string = '2.5rem',
    touchSize: string = '3rem'
): string {
    return isTouchDevice ? touchSize : normalSize;
}

/**
 * Responsive layout hook
 */
export function useResponsiveLayout() {
    const { deviceType, isMobile, isTablet, isDesktop } = useBreakpoint();
    const isTouchDevice = useTouchDevice();
    const orientation = useOrientation();
    const safeAreaInsets = useSafeAreaInsets();

    return {
        deviceType,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        orientation,
        safeAreaInsets,
        // Layout utilities
        sidebarCollapsed: isMobile,
        showMobileMenu: isMobile,
        cardColumns: isMobile ? 1 : isTablet ? 2 : 3,
        tableScrollable: isMobile || isTablet,
        // Touch-friendly sizes
        buttonSize: getTouchFriendlySize(isTouchDevice),
        inputHeight: getTouchFriendlySize(isTouchDevice, '2.5rem', '3rem'),
        // Spacing
        containerPadding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
        sectionSpacing: isMobile ? '2rem' : '3rem',
    };
}