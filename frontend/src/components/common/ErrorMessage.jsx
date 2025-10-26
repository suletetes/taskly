import React from 'react'

const ErrorMessage = ({ 
  message, 
  onRetry, 
  onClose, 
  className = '', 
  showIcon = true,
  title = 'Something went wrong' 
}) => {
  return (
    <div className={`error-message ${className}`}>
      <div className="error-content">
        {showIcon && (
          <div className="error-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm5 13.59L13.59 15 10 11.41 6.41 15 5 13.59 8.59 10 5 6.41 6.41 5 10 8.59 13.59 5 15 6.41 11.41 10 15 13.59z"
                fill="currentColor"
              />
            </svg>
          </div>
        )}
        <div className="error-text">
          <h3>{title}</h3>
          <p>{message || 'An unexpected error occurred. Please try again.'}</p>
        </div>
        <div className="error-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              Try Again
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="error-close"
              aria-label="Close error message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage