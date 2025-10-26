// JavaScript utility to fix color contrast issues
export const fixColorContrast = () => {
  // Force light theme
  document.documentElement.style.setProperty('color-scheme', 'light')
  document.body.style.setProperty('color', '#212529', 'important')
  document.body.style.setProperty('background-color', '#ffffff', 'important')
  
  // Fix any elements that might have dark text on dark backgrounds
  const fixElements = () => {
    const elements = document.querySelectorAll('*')
    elements.forEach(el => {
      const computedStyle = window.getComputedStyle(el)
      const color = computedStyle.color
      const backgroundColor = computedStyle.backgroundColor
      
      // If text is very dark or invisible
      if (color === 'rgb(0, 0, 0)' || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
        el.style.setProperty('color', '#212529', 'important')
      }
      
      // If background is very dark
      if (backgroundColor === 'rgb(0, 0, 0)' || backgroundColor.includes('rgba(0, 0, 0')) {
        el.style.setProperty('background-color', 'transparent', 'important')
      }
    })
  }
  
  // Run immediately
  fixElements()
  
  // Run after DOM changes
  const observer = new MutationObserver(fixElements)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  })
  
  return () => observer.disconnect()
}

// Force high contrast mode
export const enableHighContrast = () => {
  const style = document.createElement('style')
  style.textContent = `
    * {
      color: #000000 !important;
      background-color: #ffffff !important;
    }
    
    .btn-primary {
      background-color: #0066cc !important;
      color: #ffffff !important;
    }
    
    .btn-secondary {
      background-color: #666666 !important;
      color: #ffffff !important;
    }
    
    a {
      color: #0066cc !important;
    }
    
    .text-muted {
      color: #333333 !important;
    }
  `
  document.head.appendChild(style)
  
  return () => document.head.removeChild(style)
}

// Auto-fix colors on page load
export const initColorFixes = () => {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixColorContrast)
  } else {
    fixColorContrast()
  }
  
  // Also fix on window load
  window.addEventListener('load', fixColorContrast)
  
  // Check for user preference
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    enableHighContrast()
  }
}