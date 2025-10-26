import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { setGlobalErrorHandler } from '../services/api'
import useErrorHandler from '../hooks/useErrorHandler'

const ErrorContext = createContext()

export const ErrorProvider = ({ children }) => {
  const { handleError, handleWarning, handleValidationError } = useErrorHandler()

  // Set up global error handlers
  useEffect(() => {
    // Set API error handler
    setGlobalErrorHandler(handleError)

    // Global unhandled promise rejection handler
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      handleError(event.reason, {
        context: 'Unhandled Promise Rejection'
      })
      event.preventDefault() // Prevent default browser error handling
    }

    // Global JavaScript error handler
    const handleGlobalError = (event) => {
      console.error('Global JavaScript error:', event.error)
      handleError(event.error, {
        context: 'Global JavaScript Error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
      setGlobalErrorHandler(null)
    }
  }, [handleError])

  const value = {
    handleError,
    handleWarning,
    handleValidationError
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}

export const useError = () => {
  const context = useContext(ErrorContext)
  
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  
  return context
}

export default ErrorContext