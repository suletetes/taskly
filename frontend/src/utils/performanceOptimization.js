// Performance optimization utilities

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
  // Preload critical CSS
  const criticalCSS = document.createElement('link')
  criticalCSS.rel = 'preload'
  criticalCSS.as = 'style'
  criticalCSS.href = '/css/critical.css'
  document.head.appendChild(criticalCSS)

  // Preload critical fonts
  const criticalFont = document.createElement('link')
  criticalFont.rel = 'preload'
  criticalFont.as = 'font'
  criticalFont.type = 'font/woff2'
  criticalFont.href = '/fonts/inter-var.woff2'
  criticalFont.crossOrigin = 'anonymous'
  document.head.appendChild(criticalFont)
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
  if ('serviceWorker' in navigator) {
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

// Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }
}