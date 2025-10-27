import { useCallback } from 'react'

const useErrorHandler = () => {
  // Use a safer approach that doesn't depend on NotificationProvider
  const showError = useCallback((message, options = {}) => {
    console.error('Error:', message)
    // Fallback to console if notification context is not available
    try {
      const { useNotification } = require('../context/NotificationContext')
      const notification = useNotification()
      if (notification?.showError) {
        notification.showError(message, options)
      }
    } catch (e) {
      // If notification context is not available, just log
      console.error('Notification context not available:', message)
    }
  }, [])

  const showWarning = useCallback((message, options = {}) => {
    console.warn('Warning:', message)
    try {
      const { useNotification } = require('../context/NotificationContext')
      const notification = useNotification()
      if (notification?.showWarning) {
        notification.showWarning(message, options)
      }
    } catch (e) {
      console.warn('Notification context not available:', message)
    }
  }, [])

  const handleError = useCallback((error, options = {}) => {
    console.error('Error handled by useErrorHandler:', error)

    let errorMessage = 'An unexpected error occurred'
    let shouldRetry = false

    // Parse different types of errors
    if (error?.response) {
      // API response error
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          errorMessage = data?.error?.message || data?.message || 'Invalid request'
          break
        case 401:
          errorMessage = 'You are not authorized. Please log in again.'
          // Don't show notification for 401 as it's handled by interceptor
          return
        case 403:
          errorMessage = 'You do not have permission to perform this action'
          break
        case 404:
          errorMessage = 'The requested resource was not found'
          break
        case 409:
          errorMessage = data?.error?.message || 'A conflict occurred'
          break
        case 422:
          errorMessage = data?.error?.message || 'Validation failed'
          break
        case 429:
          errorMessage = 'Too many requests. Please try again later.'
          shouldRetry = true
          break
        case 500:
          errorMessage = 'Server error. Please try again later.'
          shouldRetry = true
          break
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporarily unavailable. Please try again later.'
          shouldRetry = true
          break
        default:
          errorMessage = data?.error?.message || data?.message || `Error ${status}: ${error.response.statusText}`
      }
    } else if (error?.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection and try again.'
      shouldRetry = true
    } else if (error?.message) {
      // JavaScript error
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    // Show notification
    const notificationOptions = {
      duration: shouldRetry ? 0 : 5000, // Don't auto-dismiss if retry is available
      ...options
    }

    if (shouldRetry && options.onRetry) {
      notificationOptions.onRetry = options.onRetry
    }

    if (shouldRetry) {
      showError(errorMessage, notificationOptions)
    } else {
      showError(errorMessage, notificationOptions)
    }

    // Report to monitoring service if available
    if (window.reportError && error instanceof Error) {
      window.reportError(error, {
        context: options.context || 'useErrorHandler',
        userId: options.userId,
        timestamp: new Date().toISOString()
      })
    }
  }, [showError])

  const handleWarning = useCallback((message, options = {}) => {
    showWarning(message, options)
  }, [showWarning])

  const handleValidationError = useCallback((validationErrors, options = {}) => {
    if (Array.isArray(validationErrors)) {
      // Multiple validation errors
      const errorMessage = validationErrors.map(err => err.message || err).join(', ')
      showError(`Validation failed: ${errorMessage}`, options)
    } else if (typeof validationErrors === 'object') {
      // Object with field errors
      const errors = Object.values(validationErrors).flat()
      const errorMessage = errors.join(', ')
      showError(`Validation failed: ${errorMessage}`, options)
    } else {
      // Single validation error
      showError(`Validation failed: ${validationErrors}`, options)
    }
  }, [showError])

  return {
    handleError,
    handleWarning,
    handleValidationError
  }
}

export default useErrorHandler