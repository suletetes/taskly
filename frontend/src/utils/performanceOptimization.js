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
    // Preload critical CSS if it exists
    fetch('/css/critical.css', { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const criticalCSS = document.createElement('link')
          criticalCSS.rel = 'preload'
          criticalCSS.as = 'style'
          criticalCSS.href = '/css/critical.css'
          document.head.appendChild(criticalCSS)
        }
      })
      .catch(() => {
        // File doesn't exist, skip preloading
      })

    // Preload critical fonts if they exist
    fetch('/fonts/inter-var.woff2', { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const criticalFont = document.createElement('link')
          criticalFont.rel = 'preload'
          criticalFont.as = 'font'
          criticalFont.type = 'font/woff2'
          criticalFont.href = '/fonts/inter-var.woff2'
          criticalFont.crossOrigin = 'anonymous'
          document.head.appendChild(criticalFont)
        }
      })
      .catch(() => {
        // File doesn't exist, skip preloading
      })
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
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
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
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Track First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime)
        }
        if (entry.name === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
      }
    })
    
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
    } catch (e) {
      // Fallback for browsers that don't support these metrics
      console.log('Performance observer not supported')
    }

    // Track Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      console.log('CLS:', clsValue)
    })

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.log('Layout shift observer not supported')
    }

    // Track First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime)
      }
    })

    try {
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.log('First input observer not supported')
    }
  }
}