'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from './loading-spinner';
import { useLazyLoad } from './performance-monitor';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

// Lazy load component with intersection observer
export function LazyLoad({ 
  children, 
  fallback = <LoadingSpinner text="Loading..." />,
  threshold = 0.1,
  rootMargin = '50px',
  className
}: LazyLoadProps) {
  const [ref, isVisible] = useLazyLoad(threshold);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}

// Higher-order component for lazy loading
export function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner text="Loading..." />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Lazy load images
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  threshold?: number;
}

export function LazyImage({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
  fallback,
  threshold = 0.1,
  className,
  ...props 
}: LazyImageProps) {
  const [ref, isVisible] = useLazyLoad(threshold);
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (isVisible && !hasError) {
      const img = new Image();
      img.onload = () => setImageSrc(src);
      img.onerror = () => {
        setHasError(true);
        if (fallback) setImageSrc(fallback);
      };
      img.src = src;
    }
  }, [isVisible, src, fallback, hasError]);

  return (
    <img
      ref={ref as React.RefObject<HTMLImageElement>}
      src={imageSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

// Lazy load videos
interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  threshold?: number;
}

export function LazyVideo({ 
  src, 
  poster, 
  threshold = 0.1,
  className,
  ...props 
}: LazyVideoProps) {
  const [ref, isVisible] = useLazyLoad(threshold);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? (
        <video src={src} poster={poster} {...props} />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <LoadingSpinner text="Loading video..." />
        </div>
      )}
    </div>
  );
}

// Lazy load iframes
interface LazyIframeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string;
  threshold?: number;
}

export function LazyIframe({ 
  src, 
  threshold = 0.1,
  className,
  ...props 
}: LazyIframeProps) {
  const [ref, isVisible] = useLazyLoad(threshold);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? (
        <iframe src={src} {...props} />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <LoadingSpinner text="Loading content..." />
        </div>
      )}
    </div>
  );
}

// Virtual list for large datasets
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualList<T>({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem,
  className 
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div 
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => 
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}
