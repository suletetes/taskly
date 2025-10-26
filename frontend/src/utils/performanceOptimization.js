// Performance optimization utilities
import React from 'react'

// Lazy loading for images
export const lazyLoadImage = (img) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target
        image.src = image.dataset.src
        image.classList.remove('lazy')
        imageObserver.unobserve(image)
      }
    })
  })

  if (img) {
    imageObserver.observe(img)
  }
}

// Preload critical resources
export const preloadCriticalResources = () => {
  // Only preload resources in production and if they exist
  if (process.env.NODE_ENV === 'production') {
    // Check and preload critical CSS if it exists
    const checkAndPreloadCSS = async () => {
      try {
        const response = await fetch('/css/critical.css', { method: 'HEAD' })
        if (response.ok) {
          const criticalCSS = document.createElement('link')
          criticalCSS.rel = 'preload'
          criticalCSS.as = 'style'
          criticalCSS.href = '/css/critical.css'
          criticalCSS.onload = () => {
            // Convert to stylesheet after preload
            setTimeout(() => {
              criticalCSS.rel = 'stylesheet'
            }, 100)
          }
          document.head.appendChild(criticalCSS)
        }
      } catch (error) {
        // File doesn't exist or network error, skip preloading
      }
    }

    // Check and preload critical fonts if they exist
    const checkAndPreloadFont = async () => {
      try {
        const response = await fetch('/fonts/inter-var.woff2', { method: 'HEAD' })
        if (response.ok) {
          const criticalFont = document.createElement('link')
          criticalFont.rel = 'preload'
          criticalFont.as = 'font'
          criticalFont.type = 'font/woff2'
          criticalFont.href = '/fonts/inter-var.woff2'
          criticalFont.crossOrigin = 'anonymous'
          document.head.appendChild(criticalFont)
        }
      } catch (error) {
        // File doesn't exist or network error, skip preloading
      }
    }

    checkAndPreloadCSS()
    checkAndPreloadFont()
  }
}

// Bundle size optimization
export const loadComponentAsync = (importFunc) => {
  return React.lazy(importFunc)
}

// Memory cleanup
export const cleanupEventListeners = (element, events) => {
  events.forEach(({ event, handler }) => {
    element.removeEventListener(event, handler)
  })
}

// Debounce function for performance
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Image optimization
export const optimizeImage = (src, width, height, quality = 80) => {
  // For production, this would integrate with an image optimization service
  const params = new URLSearchParams({
    w: width,
    h: height,
    q: quality,
    f: 'webp'
  })
  
  return `${src}?${params.toString()}`
}

// Critical resource hints
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const dnsPrefetch = document.createElement('link')
  dnsPrefetch.rel = 'dns-prefetch'
  dnsPrefetch.href = '//fonts.googleapis.com'
  document.head.appendChild(dnsPrefetch)

  // Preconnect to critical origins
  const preconnect = document.createElement('link')
  preconnect.rel = 'preconnect'
  preconnect.href = 'https://api.taskly.com'
  document.head.appendChild(preconnect)
}

// Service Worker registration
export const registerServiceWorker = () => {
  // Only register service worker in production
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      // Check if service worker file exists before registering
      fetch('/sw.js', { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            navigator.serviceWorker.register('/sw.js')
              .then((registration) => {
                console.log('SW registered: ', registration)
              })
              .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError)
              })
          }
        })
        .catch(() => {
          console.log('Service worker file not found, skipping registration')
        })
    })
  }
}

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}

// Web Vitals tracking (manual implementation)
export const trackWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window && process.env.NODE_ENV === 'development') {
    let fcpReported = false
    let lcpReported = false
    let clsValue = 0
    let clsReported = false
    
    // Track First Contentful Paint and Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint' && !fcpReported) {
          console.log('FCP:', entry.startTime)
          fcpReported = true
        }
        if (entry.name === 'largest-contentful-paint' && !lcpReported) {
          console.log('LCP:', entry.startTime)
          lcpReported = true
        }
      }
    })
    
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
    } catch (e) {
      // Silently fail for unsupported browsers
    }

    // Track Cumulative Layout Shift (report only final value)
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
    })

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      
      // Report CLS value after page load
      window.addEventListener('beforeunload', () => {
        if (!clsReported && clsValue > 0) {
          console.log('CLS:', clsValue)
          clsReported = true
        }
      })
    } catch (e) {
      // Silently fail for unsupported browsers
    }

    // Track First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime
        console.log('FID:', fid)
        fidObserver.disconnect() // Only report once
      }
    })

    try {
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // Silently fail for unsupported browsers
    }
  }
}