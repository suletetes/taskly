import React from 'react'

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`error-message ${className}`}>
      <div className="error-content">
        <h3>Something went wrong</h3>
        <p>{message || 'An unexpected error occurred. Please try again.'}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage