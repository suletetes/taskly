import React from 'react'

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  overlay = false,
  fullScreen = false,
  color = 'primary',
  className = ''
}) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }[size]

  const colorClass = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    success: 'spinner-success',
    danger: 'spinner-danger',
    warning: 'spinner-warning',
    info: 'spinner-info',
    light: 'spinner-light',
    dark: 'spinner-dark'
  }[color]

  const containerClass = [
    'loading-spinner',
    overlay && 'loading-overlay',
    fullScreen && 'loading-fullscreen',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className={`spinner ${sizeClass} ${colorClass}`}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  )
}

// Inline spinner for buttons and small spaces
export const InlineSpinner = ({ size = 'small', color = 'primary' }) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium'
  }[size]

  const colorClass = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    light: 'spinner-light',
    dark: 'spinner-dark'
  }[color]

  return (
    <div className={`inline-spinner ${sizeClass} ${colorClass}`}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}

// Dots loading animation
export const DotsLoader = ({ color = 'primary', size = 'medium' }) => {
  const colorClass = `dots-${color}`
  const sizeClass = `dots-${size}`

  return (
    <div className={`dots-loader ${colorClass} ${sizeClass}`}>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  )
}

// Pulse loading animation
export const PulseLoader = ({ color = 'primary', size = 'medium' }) => {
  const colorClass = `pulse-${color}`
  const sizeClass = `pulse-${size}`

  return (
    <div className={`pulse-loader ${colorClass} ${sizeClass}`}>
      <div className="pulse-circle"></div>
    </div>
  )
}

export default LoadingSpinner