/**
 * Lazy loading wrapper component for performance optimization
 * Provides lazy loading with intersection observer and fallback UI
 */

import React from "react";
import {
  useIntersectionObserver,
  useReducedMotion,
} from "../../utils/performance";

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
  minHeight?: string;
  showSkeleton?: boolean;
}

/**
 * Skeleton loader component
 */
const SkeletonLoader: React.FC<{ className?: string; minHeight?: string }> = ({
  className = "",
  minHeight = "200px",
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
      style={{ minHeight }}
    >
      <div
        className={`h-full w-full rounded-lg ${
          prefersReducedMotion
            ? "bg-gray-300 dark:bg-gray-600"
            : "animate-pulse bg-gray-300 dark:bg-gray-600"
        }`}
      />
    </div>
  );
};

/**
 * Lazy wrapper component that loads content when it enters the viewport
 */
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = "50px",
  triggerOnce = true,
  className = "",
  minHeight = "200px",
  showSkeleton = true,
}) => {
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
  });

  const [hasLoaded, setHasLoaded] = React.useState(false);

  React.useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  const shouldRender = triggerOnce ? hasLoaded : isIntersecting;

  return (
    <div ref={elementRef} className={className} style={{ minHeight }}>
      {shouldRender ? (
        children
      ) : fallback ? (
        fallback
      ) : showSkeleton ? (
        <SkeletonLoader className={className} minHeight={minHeight} />
      ) : (
        <div style={{ minHeight }} />
      )}
    </div>
  );
};

/**
 * Higher-order component for lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<LazyWrapperProps, "children"> = {}
) {
  const LazyComponent = React.forwardRef<any, P>((props, ref) => (
    <LazyWrapper {...options}>
      <Component {...props} ref={ref} />
    </LazyWrapper>
  ));

  LazyComponent.displayName = `LazyWrapper(${
    Component.displayName || Component.name
  })`;

  return LazyComponent;
}

/**
 * Lazy image component with progressive loading
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  blurDataURL,
  onLoad,
  onError,
  className = "",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = React.useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div ref={elementRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder or blur image */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Blur data URL background */}
      {blurDataURL && !isLoaded && !hasError && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isIntersecting && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Lazy component loader with dynamic imports
 */
interface LazyComponentProps {
  importFn: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
  onError?: (error: Error) => void;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  importFn,
  fallback,
  props = {},
  onError,
}) => {
  const [Component, setComponent] =
    React.useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    importFn()
      .then((module) => {
        if (isMounted) {
          setComponent(() => module.default);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
          onError?.(err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [importFn, onError]);

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400">
        <p>Failed to load component</p>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
      </div>
    );
  }

  if (isLoading || !Component) {
    return fallback || <SkeletonLoader />;
  }

  return <Component {...props} />;
};

export default LazyWrapper;
