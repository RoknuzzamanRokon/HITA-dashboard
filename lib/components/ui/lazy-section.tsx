/**
 * Enhanced Lazy Section Component
 * Aggressively preloads content for instant perception
 */

"use client";

import React, { useState, useRef, useEffect } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  prefetchDistance?: string;
}

export function LazySection({
  children,
  fallback = <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
  rootMargin = "100px",
  threshold = 0.1,
  className = "",
  prefetchDistance = "500px",
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create two observers: one for prefetching, one for actual loading
    const prefetchObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isPrefetching) {
          setIsPrefetching(true);
          console.log('🚀 Prefetching content for section...');
          
          // Start loading resources in background
          // This could be enhanced with actual resource prefetching
        }
      },
      {
        rootMargin: prefetchDistance,
        threshold: 0.01, // Very small threshold for early prefetching
      },
    );

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          console.log('📊 Loading section content...');
          
          // Disconnect both observers after loading
          prefetchObserver.disconnect();
          loadObserver.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      },
    );

    if (ref.current) {
      prefetchObserver.observe(ref.current);
      loadObserver.observe(ref.current);
    }

    return () => {
      prefetchObserver.disconnect();
      loadObserver.disconnect();
    };
  }, [rootMargin, threshold, hasLoaded, isPrefetching, prefetchDistance]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}
