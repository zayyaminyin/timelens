import React, { useState, useCallback, useRef, useEffect } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  hideOnError?: boolean;
  maxRetries?: number;
  showSkeleton?: boolean;
  priority?: boolean;
}

export function ImageWithFallback({ 
  hideOnError = false, 
  maxRetries = 2, // Reduced from 3
  showSkeleton = true,
  priority = false,
  className = '',
  ...props 
}: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(props.src)
  const [hasLoaded, setHasLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Super fast URL optimization - simplified approach
  const optimizeImageUrl = useCallback((url: string, attempt: number = 0): string => {
    if (!url || typeof url !== 'string') return url;

    // For Unsplash URLs, use the simplest format
    if (url.includes('images.unsplash.com')) {
      const photoIdMatch = url.match(/photo-([a-zA-Z0-9_-]+)/);
      if (photoIdMatch) {
        const photoId = photoIdMatch[1];
        
        switch (attempt) {
          case 0:
            // First attempt: optimized format
            return `https://images.unsplash.com/photo-${photoId}?w=600&q=75`;
          case 1:
            // Second attempt: minimal format
            return `https://images.unsplash.com/photo-${photoId}?w=400`;
          default:
            // Final attempt: absolute minimal
            return `https://images.unsplash.com/photo-${photoId}`;
        }
      }
    }

    return url;
  }, []);

  const handleError = useCallback(() => {
    console.log(`Image failed: ${currentSrc}, retry: ${retryCount}`);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Try optimized URLs
    if (retryCount < maxRetries && currentSrc && typeof currentSrc === 'string') {
      const nextRetry = retryCount + 1;
      const optimizedUrl = optimizeImageUrl(currentSrc, nextRetry);
      
      if (optimizedUrl !== currentSrc) {
        setRetryCount(nextRetry);
        setCurrentSrc(optimizedUrl);
        setIsLoading(true);
        return;
      }
    }

    // All retries failed
    setDidError(true);
    setIsLoading(false);
    setHasLoaded(false);
    
    if (props.onError) {
      props.onError({} as React.SyntheticEvent<HTMLImageElement, Event>);
    }
  }, [currentSrc, retryCount, maxRetries, props.onError, optimizeImageUrl]);

  const handleLoad = useCallback(() => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsLoading(false);
    setDidError(false);
    setHasLoaded(true);
    
    if (props.onLoad) {
      props.onLoad({} as React.SyntheticEvent<HTMLImageElement, Event>);
    }
  }, [props.onLoad]);

  // Reset states when src changes
  useEffect(() => {
    if (props.src !== currentSrc) {
      setCurrentSrc(props.src);
      setDidError(false);
      setIsLoading(true);
      setRetryCount(0);
      setHasLoaded(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [props.src, currentSrc]);

  // Faster timeout for quick fallback
  useEffect(() => {
    if (isLoading && !didError && currentSrc) {
      timeoutRef.current = setTimeout(() => {
        if (!hasLoaded) {
          console.log('Image timeout, triggering retry');
          handleError();
        }
      }, 5000); // Reduced from 10 seconds to 5
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, didError, currentSrc, hasLoaded, handleError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const { src, alt, style, onError, onLoad, ...rest } = props;

  // Hide on error
  if (hideOnError && didError) {
    return null;
  }

  // Fast skeleton loading - simplified
  if (showSkeleton && isLoading && !didError) {
    return (
      <div
        className={`relative overflow-hidden bg-muted/50 animate-pulse ${className}`}
        style={style}
      >
        {/* Simplified shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
        
        {/* Fast loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-muted-foreground/20 border-t-muted-foreground/60 animate-spin"></div>
        </div>
        
        {/* Load actual image invisibly */}
        <img 
          ref={imgRef}
          src={currentSrc} 
          alt={alt} 
          className="opacity-0 w-full h-full object-cover" 
          onError={handleError}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
          {...rest} 
        />
      </div>
    );
  }

  // Clean error state
  if (didError) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-muted/30 border border-border/30 rounded-lg overflow-hidden ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-muted-foreground/10 flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground/70 font-medium">Image unavailable</p>
        </div>
        
        <img 
          src={ERROR_IMG_SRC} 
          alt="Error loading image" 
          className="sr-only" 
          {...rest} 
          data-original-url={src} 
        />
      </div>
    );
  }

  // Successful image with instant fade-in
  return (
    <img 
      ref={imgRef}
      src={currentSrc} 
      alt={alt} 
      className={`transition-opacity duration-200 ${hasLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={style} 
      onError={handleError}
      onLoad={handleLoad}
      loading={priority ? 'eager' : 'lazy'}
      {...rest} 
    />
  );
}