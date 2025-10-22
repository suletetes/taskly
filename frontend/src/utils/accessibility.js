// Accessibility utilities and helpers

// Focus management
export class FocusManager {
    constructor() {
        this.focusStack = []
    }

    // Save current focus and set new focus
    pushFocus(element) {
        this.focusStack.push(document.activeElement)
        if (element && element.focus) {
            element.focus()
        }
    }

    // Restore previous focus
    popFocus() {
        const previousElement = this.focusStack.pop()
        if (previousElement && previousElement.focus) {
            previousElement.focus()
        }
    }

    // Trap focus within an element
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus()
                        e.preventDefault()
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus()
                        e.preventDefault()
                    }
                }
            }
        }

        element.addEventListener('keydown', handleTabKey)
        firstElement.focus()

        return () => {
            element.removeEventListener('keydown', handleTabKey)
        }
    }
}

// Screen reader announcements
export class ScreenReaderAnnouncer {
    constructor() {
        this.liveRegion = this.createLiveRegion()
    }

    createLiveRegion() {
        const region = document.createElement('div')
        region.setAttribute('aria-live', 'polite')
        region.setAttribute('aria-atomic', 'true')
        region.style.position = 'absolute'
        region.style.left = '-10000px'
        region.style.width = '1px'
        region.style.height = '1px'
        region.style.overflow = 'hidden'
        document.body.appendChild(region)
        return region
    }

    announce(message, priority = 'polite') {
        this.liveRegion.setAttribute('aria-live', priority)
        this.liveRegion.textContent = message

        // Clear after announcement
        setTimeout(() => {
            this.liveRegion.textContent = ''
        }, 1000)
    }

    announceError(message) {
        this.announce(message, 'assertive')
    }

    announceSuccess(message) {
        this.announce(message, 'polite')
    }
}

// Keyboard navigation helpers
export const KeyboardNavigation = {
    // Handle arrow key navigation in lists
    handleArrowNavigation: (e, items, currentIndex, onIndexChange) => {
        let newIndex = currentIndex

        switch (e.key) {
            case 'ArrowDown':
                newIndex = Math.min(currentIndex + 1, items.length - 1)
                e.preventDefault()
                break
            case 'ArrowUp':
                newIndex = Math.max(currentIndex - 1, 0)
                e.preventDefault()
                break
            case 'Home':
                newIndex = 0
                e.preventDefault()
                break
            case 'End':
                newIndex = items.length - 1
                e.preventDefault()
                break
            default:
                return
        }

        if (newIndex !== currentIndex) {
            onIndexChange(newIndex)
            if (items[newIndex] && items[newIndex].focus) {
                items[newIndex].focus()
            }
        }
    },

    // Handle escape key
    handleEscape: (e, callback) => {
        if (e.key === 'Escape') {
            callback()
        }
    },

    // Handle enter and space for custom buttons
    handleActivation: (e, callback) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            callback()
        }
    }
}

// ARIA helpers
export const AriaHelpers = {
    // Generate unique IDs for ARIA relationships
    generateId: (prefix = 'aria') => {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
    },

    // Set ARIA expanded state
    setExpanded: (element, expanded) => {
        element.setAttribute('aria-expanded', expanded.toString())
    },

    // Set ARIA selected state
    setSelected: (element, selected) => {
        element.setAttribute('aria-selected', selected.toString())
    },

    // Set ARIA pressed state for toggle buttons
    setPressed: (element, pressed) => {
        element.setAttribute('aria-pressed', pressed.toString())
    },

    // Set ARIA hidden state
    setHidden: (element, hidden) => {
        element.setAttribute('aria-hidden', hidden.toString())
        if (hidden) {
            element.setAttribute('tabindex', '-1')
        } else {
            element.removeAttribute('tabindex')
        }
    },

    // Set ARIA live region
    setLiveRegion: (element, politeness = 'polite') => {
        element.setAttribute('aria-live', politeness)
        element.setAttribute('aria-atomic', 'true')
    }
}

// Color contrast checker
export const ColorContrast = {
    // Calculate relative luminance
    getLuminance: (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    },

    // Calculate contrast ratio
    getContrastRatio: function(color1, color2) {
        const lum1 = ColorContrast.getLuminance(...color1)
        const lum2 = ColorContrast.getLuminance(...color2)
        const brightest = Math.max(lum1, lum2)
        const darkest = Math.min(lum1, lum2)
        return (brightest + 0.05) / (darkest + 0.05)
    },

    // Check if contrast meets WCAG standards
    meetsWCAG: (color1, color2, level = 'AA') => {
        const ratio = this.getContrastRatio(color1, color2)
        const thresholds = {
            'AA': 4.5,
            'AAA': 7,
            'AA-large': 3,
            'AAA-large': 4.5
        }
        return ratio >= thresholds[level]
    }
}

// Reduced motion detection
export const MotionPreferences = {
    // Check if user prefers reduced motion
    prefersReducedMotion: () => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },

    // Get animation duration based on user preference
    getAnimationDuration: (normalDuration) => {
        return this.prefersReducedMotion() ? 0 : normalDuration
    },

    // Apply reduced motion styles
    applyReducedMotion: (element) => {
        if (this.prefersReducedMotion()) {
            element.style.animation = 'none'
            element.style.transition = 'none'
        }
    }
}

// Skip links functionality
export const SkipLinks = {
    // Create skip link
    createSkipLink: (targetId, text = 'Skip to main content') => {
        const skipLink = document.createElement('a')
        skipLink.href = `#${targetId}`
        skipLink.textContent = text
        skipLink.className = 'skip-link'
        skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 9999;
      border-radius: 4px;
    `

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px'
        })

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px'
        })

        return skipLink
    },

    // Add skip links to page
    addSkipLinks: (links) => {
        const container = document.createElement('div')
        container.className = 'skip-links'

        links.forEach(({ targetId, text }) => {
            const skipLink = this.createSkipLink(targetId, text)
            container.appendChild(skipLink)
        })

        document.body.insertBefore(container, document.body.firstChild)
    }
}

// Form accessibility helpers
export const FormAccessibility = {
    // Associate label with form control
    associateLabel: (label, control) => {
        const id = AriaHelpers.generateId('form-control')
        control.id = id
        label.setAttribute('for', id)
    },

    // Add error message to form control
    addErrorMessage: (control, message) => {
        const errorId = AriaHelpers.generateId('error')
        const errorElement = document.createElement('div')
        errorElement.id = errorId
        errorElement.textContent = message
        errorElement.className = 'error-message'
        errorElement.setAttribute('role', 'alert')

        control.setAttribute('aria-describedby', errorId)
        control.setAttribute('aria-invalid', 'true')
        control.parentNode.appendChild(errorElement)

        return errorElement
    },

    // Remove error message
    removeErrorMessage: (control) => {
        const errorId = control.getAttribute('aria-describedby')
        if (errorId) {
            const errorElement = document.getElementById(errorId)
            if (errorElement) {
                errorElement.remove()
            }
            control.removeAttribute('aria-describedby')
            control.removeAttribute('aria-invalid')
        }
    }
}

// Initialize accessibility features
export const initializeAccessibility = () => {
    // Add skip links
    SkipLinks.addSkipLinks([
        { targetId: 'main-content', text: 'Skip to main content' },
        { targetId: 'navigation', text: 'Skip to navigation' }
    ])

    // Create global screen reader announcer
    window.screenReader = new ScreenReaderAnnouncer()

    // Create global focus manager
    window.focusManager = new FocusManager()

    // Add keyboard navigation event listeners
    document.addEventListener('keydown', (e) => {
        // Global escape key handler
        if (e.key === 'Escape') {
            // Close any open modals, dropdowns, etc.
            document.dispatchEvent(new CustomEvent('global-escape'))
        }
    })

    // Apply reduced motion preferences
    if (MotionPreferences.prefersReducedMotion()) {
        document.documentElement.style.setProperty('--animation-duration', '0s')
        document.documentElement.style.setProperty('--transition-duration', '0s')
    }
}

export default {
    FocusManager,
    ScreenReaderAnnouncer,
    KeyboardNavigation,
    AriaHelpers,
    ColorContrast,
    MotionPreferences,
    SkipLinks,
    FormAccessibility,
    initializeAccessibility
}