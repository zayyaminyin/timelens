// Image optimization utilities for fast loading and fallbacks
export interface OptimizedImageConfig {
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  fit?: 'crop' | 'fill' | 'scale';
}

// Default high-performance image configuration
export const FAST_IMAGE_CONFIG: OptimizedImageConfig = {
  width: 400,
  quality: 75,
  format: 'auto',
  fit: 'crop'
};

// Ultra-fast configuration for thumbnails
export const THUMBNAIL_CONFIG: OptimizedImageConfig = {
  width: 200,
  quality: 70,
  format: 'auto',
  fit: 'crop'
};

// High-quality configuration for featured images
export const HIGH_QUALITY_CONFIG: OptimizedImageConfig = {
  width: 800,
  quality: 85,
  format: 'auto',
  fit: 'crop'
};

/**
 * Optimizes Unsplash URLs for fast loading
 */
export function optimizeImageUrl(url: string, config: OptimizedImageConfig = FAST_IMAGE_CONFIG): string {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams();
    
    // Add optimization parameters
    if (config.width) params.set('w', config.width.toString());
    if (config.quality) params.set('q', config.quality.toString());
    if (config.format) params.set('auto', config.format);
    if (config.fit) params.set('fit', config.fit);
    
    // Remove existing query params and add optimized ones
    urlObj.search = params.toString();
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to optimize image URL:', url, error);
    return url;
  }
}

/**
 * Fast-loading fallback images for different categories
 */
export const FALLBACK_IMAGES = {
  technology: 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=400&q=75&auto=format&fit=crop',
  transportation: 'https://images.unsplash.com/photo-1642099414765-5ed38e3b3437?w=400&q=75&auto=format&fit=crop',
  entertainment: 'https://images.unsplash.com/photo-1705951439619-28c0fbbd0ab0?w=400&q=75&auto=format&fit=crop',
  culture: 'https://images.unsplash.com/photo-1596539363080-b678f4c02d6e?w=400&q=75&auto=format&fit=crop',
  fashion: 'https://images.unsplash.com/photo-1577655197898-da78ff8bed68?w=400&q=75&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=400&q=75&auto=format&fit=crop'
};

/**
 * Gets appropriate fallback image for a category
 */
export function getFallbackImage(category?: string): string {
  const normalizedCategory = category?.toLowerCase() as keyof typeof FALLBACK_IMAGES;
  return FALLBACK_IMAGES[normalizedCategory] || FALLBACK_IMAGES.default;
}

/**
 * Preloads critical images for better performance
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preloads multiple images with error handling
 */
export async function preloadImages(sources: string[], maxConcurrent = 3): Promise<void> {
  const chunks = [];
  for (let i = 0; i < sources.length; i += maxConcurrent) {
    chunks.push(sources.slice(i, i + maxConcurrent));
  }

  for (const chunk of chunks) {
    try {
      await Promise.allSettled(chunk.map(preloadImage));
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }
}

/**
 * Generates optimized image sizes for responsive loading
 */
export function generateResponsiveSizes(baseUrl: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
} {
  return {
    thumbnail: optimizeImageUrl(baseUrl, { width: 150, quality: 70, format: 'auto', fit: 'crop' }),
    small: optimizeImageUrl(baseUrl, { width: 300, quality: 75, format: 'auto', fit: 'crop' }),
    medium: optimizeImageUrl(baseUrl, { width: 600, quality: 80, format: 'auto', fit: 'crop' }),
    large: optimizeImageUrl(baseUrl, { width: 1200, quality: 85, format: 'auto', fit: 'crop' })
  };
}

/**
 * Smart image loader with progressive enhancement
 */
export class SmartImageLoader {
  private static cache = new Map<string, boolean>();
  
  static async loadWithFallback(
    primaryUrl: string, 
    fallbackUrl?: string,
    timeout = 5000
  ): Promise<string> {
    // Check cache first
    if (this.cache.has(primaryUrl)) {
      return primaryUrl;
    }

    try {
      // Race between image load and timeout
      await Promise.race([
        preloadImage(primaryUrl),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
      
      this.cache.set(primaryUrl, true);
      return primaryUrl;
    } catch (error) {
      console.warn('Primary image failed to load:', primaryUrl, error);
      
      if (fallbackUrl) {
        try {
          await preloadImage(fallbackUrl);
          return fallbackUrl;
        } catch (fallbackError) {
          console.warn('Fallback image also failed:', fallbackUrl, fallbackError);
        }
      }
      
      // Return the primary URL anyway and let the browser handle it
      return primaryUrl;
    }
  }
}

/**
 * Performance monitoring for image loading
 */
export class ImagePerformanceMonitor {
  private static loadTimes = new Map<string, number>();
  
  static startTiming(url: string): void {
    this.loadTimes.set(url, Date.now());
  }
  
  static endTiming(url: string): number {
    const startTime = this.loadTimes.get(url);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      this.loadTimes.delete(url);
      
      // Log slow loading images
      if (loadTime > 2000) {
        console.warn(`Slow image load detected: ${url} took ${loadTime}ms`);
      }
      
      return loadTime;
    }
    return 0;
  }
}