'use client';

import React from 'react';
import Image from 'next/image';
import { LazyImage } from './lazy-load';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  className?: string;
  fill?: boolean;
  lazy?: boolean;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  className,
  fill = false,
  lazy = true,
  fallback,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  // Generate blur data URL if not provided
  const defaultBlurDataURL = blurDataURL || 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=';

  // If lazy loading is disabled or priority is set, use Next.js Image directly
  if (!lazy || priority) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
        sizes={sizes}
        className={cn('object-cover', className)}
        fill={fill}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    );
  }

  // Use lazy loading for better performance
  return (
    <LazyImage
      src={src}
      alt={alt}
      placeholder={defaultBlurDataURL}
      fallback={fallback}
      className={cn('object-cover', className)}
      onLoad={onLoad}
      onError={onError}
      {...(width && height ? { width, height } : {})}
    />
  );
}

// Responsive image component
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | number;
}

export function ResponsiveImage({
  src,
  alt,
  breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 },
  aspectRatio = 'square',
  className,
  ...props
}: ResponsiveImageProps) {
  // Generate sizes attribute based on breakpoints
  const sizes = [
    breakpoints.sm && `(max-width: ${breakpoints.sm}px) 100vw`,
    breakpoints.md && `(max-width: ${breakpoints.md}px) 50vw`,
    breakpoints.lg && `(max-width: ${breakpoints.lg}px) 33vw`,
    breakpoints.xl && `(max-width: ${breakpoints.xl}px) 25vw`,
    '100vw'
  ].filter(Boolean).join(', ');

  // Generate aspect ratio class
  const aspectRatioClass = typeof aspectRatio === 'number' 
    ? `aspect-[${aspectRatio}]`
    : {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        landscape: 'aspect-[4/3]',
      }[aspectRatio];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      sizes={sizes}
      className={cn(aspectRatioClass, className)}
      {...props}
    />
  );
}

// Avatar component with fallback
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const fallbackInitials = alt
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn(
      'relative overflow-hidden rounded-full bg-gray-200 flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          className="object-cover"
          fallback={fallback}
          lazy={false} // Avatars are usually above the fold
        />
      ) : (
        <span className="text-gray-600 font-medium text-sm">
          {fallbackInitials}
        </span>
      )}
    </div>
  );
}

// Image gallery component
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {images.map((image, index) => (
        <div key={index} className="group cursor-pointer">
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            aspectRatio="square"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {image.caption && (
            <p className="mt-2 text-sm text-gray-600 text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
