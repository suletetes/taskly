// Image optimization utilities for modern web performance

class ImageOptimizer {
  constructor() {
    this.supportedFormats = this.detectSupportedFormats();
    this.lazyLoadObserver = null;
    this.initLazyLoading();
  }
  
  // Detect browser support for modern image formats
  detectSupportedFormats() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const formats = {
      webp: false,
      avif: false,
      jpeg2000: false
    };
    
    // Check WebP support
    try {
      formats.webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) {
      formats.webp = false;
    }
    
    // Check AVIF support (newer browsers)
    try {
      formats.avif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (e) {
      formats.avif = false;
    }
    
    return formats;
  }
  
  // Get optimized image URL based on browser support and requirements
  getOptimizedImageUrl(baseUrl, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = 'auto',
      dpr = window.devicePixelRatio || 1
    } = options;
    
    // Calculate actual dimensions considering device pixel ratio
    const actualWidth = width ? Math.round(width * dpr) : undefined;
    const actualHeight = height ? Math.round(height * dpr) : undefined;
    
    // Determine best format
    let targetFormat = format;
    if (format === 'auto') {
      if (this.supportedFormats.avif) {
        targetFormat = 'avif';
      } else if (this.supportedFormats.webp) {
        targetFormat = 'webp';
      } else {
        targetFormat = 'jpeg';
      }
    }
    
    // Build optimized URL (assuming a service like Cloudinary or similar)
    const params = new URLSearchParams();
    
    if (actualWidth) params.append('w', actualWidth);
    if (actualHeight) params.append('h', actualHeight);
    if (quality !== 80) params.append('q', quality);
    if (targetFormat !== 'jpeg') params.append('f', targetFormat);
    
    // Add optimization flags
    params.append('c', 'fill'); // Crop mode
    params.append('g', 'auto'); // Auto gravity
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  // Generate responsive image srcset
  generateSrcSet(baseUrl, sizes = [320, 640, 768, 1024, 1280, 1536], options = {}) {
    return sizes
      .map(size => {
        const url = this.getOptimizedImageUrl(baseUrl, {
          ...options,
          width: size
        });
        return `${url} ${size}w`;
      })
      .join(', ');
  }
  
  // Initialize lazy loading with Intersection Observer
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyLoadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              this.lazyLoadObserver.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }
  
  // Load image with optimization
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (srcset) {
      img.srcset = srcset;
    }
    if (src) {
      img.src = src;
    }
    
    img.classList.remove('lazy');
    img.classList.add('loaded');
    
    // Add fade-in animation
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease-in-out';
    
    img.onload = () => {
      img.style.opacity = '1';
    };
  }
  
  // Register image for lazy loading
  observeImage(img) {
    if (this.lazyLoadObserver) {
      img.classList.add('lazy');
      this.lazyLoadObserver.observe(img);
    } else {
      // Fallback for browsers without Intersection Observer
      this.loadImage(img);
    }
  }
  
  // Preload critical images
  preloadImage(url, options = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      // Set up responsive loading if sizes provided
      if (options.sizes) {
        img.srcset = this.generateSrcSet(url, options.sizes, options);
        img.sizes = options.sizesAttribute || '100vw';
      }
      
      img.src = this.getOptimizedImageUrl(url, options);
    });
  }
  
  // Convert image to WebP if supported
  async convertToWebP(file, quality = 0.8) {
    if (!this.supportedFormats.webp) {
      return file;
    }
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(resolve, 'image/webp', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Compress image for upload
  async compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Generate placeholder for lazy loading
  generatePlaceholder(width, height, color = '#f3f4f6') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle pattern
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(width / 2 - 10, height / 2 - 10, 20, 20);
    
    return canvas.toDataURL();
  }
  
  // Create blur placeholder from image
  async createBlurPlaceholder(imageUrl, blurAmount = 10) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Small canvas for blur effect
        canvas.width = 40;
        canvas.height = 30;
        
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL());
      };
      
      img.src = imageUrl;
    });
  }
}

// React hook for image optimization
export const useImageOptimization = () => {
  const optimizer = new ImageOptimizer();
  
  return {
    getOptimizedUrl: (url, options) => optimizer.getOptimizedImageUrl(url, options),
    generateSrcSet: (url, sizes, options) => optimizer.generateSrcSet(url, sizes, options),
    preloadImage: (url, options) => optimizer.preloadImage(url, options),
    compressImage: (file, maxWidth, maxHeight, quality) => 
      optimizer.compressImage(file, maxWidth, maxHeight, quality),
    convertToWebP: (file, quality) => optimizer.convertToWebP(file, quality),
    supportedFormats: optimizer.supportedFormats
  };
};

// React component for optimized images
export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  lazy = true,
  quality = 80,
  sizes = '100vw',
  placeholder = true,
  ...props 
}) => {
  const optimizer = new ImageOptimizer();
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef(null);
  
  React.useEffect(() => {
    if (lazy && imgRef.current) {
      optimizer.observeImage(imgRef.current);
    }
  }, [lazy]);
  
  const optimizedSrc = optimizer.getOptimizedImageUrl(src, {
    width,
    height,
    quality
  });
  
  const srcSet = optimizer.generateSrcSet(src, [320, 640, 768, 1024, 1280, 1536], {
    height,
    quality
  });
  
  const placeholderSrc = placeholder 
    ? optimizer.generatePlaceholder(width || 400, height || 300)
    : null;
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Placeholder */}
      {placeholder && !loaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(5px)' }}
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        data-src={lazy ? optimizedSrc : undefined}
        data-srcset={lazy ? srcSet : undefined}
        src={lazy ? undefined : optimizedSrc}
        srcSet={lazy ? undefined : srcSet}
        sizes={sizes}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary-100 dark:bg-secondary-700">
          <span className="text-secondary-500 dark:text-secondary-400 text-sm">
            Failed to load image
          </span>
        </div>
      )}
      
      {/* Loading indicator */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Create singleton instance
const imageOptimizer = new ImageOptimizer();

export default imageOptimizer;