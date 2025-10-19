import React, { createContext, useContext, useState, useCallback } from 'react'
import SuccessMessage from '../components/common/SuccessMessage'
import ErrorMessage from '../components/common/ErrorMessage'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      ...notification,
      timestamp: Date.now()
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    })
  }, [addNotification])

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 0, // Errors don't auto-dismiss by default
      ...options
    })
  }, [addNotification])

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    })
  }, [addNotification])

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    })
  }, [addNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  )
}

const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => {
        const { id, type, message, ...props } = notification

        switch (type) {
          case 'success':
            return (
              <SuccessMessage
                key={id}
                message={message}
                onClose={() => onRemove(id)}
                className="notification-item"
                {...props}
              />
            )
          case 'error':
            return (
              <ErrorMessage
                key={id}
                message={message}
                onRetry={props.onRetry}
                className="notification-item error-notification"
                onClose={() => onRemove(id)}
                {...props}
              />
            )
          case 'info':
            return (
              <div key={id} className="notification-item info-notification">
                <div className="notification-content">
                  <div className="notification-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm1 15H9v-6h2v6zm0-8H9V5h2v2z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <p>{message}</p>
                  <button 
                    onClick={() => onRemove(id)}
                    className="notification-close"
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          case 'warning':
            return (
              <div key={id} className="notification-item warning-notification">
                <div className="notification-content">
                  <div className="notification-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 0L0 20h20L10 0zm1 15H9v-2h2v2zm0-4H9V7h2v4z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <p>{message}</p>
                  <button 
                    onClick={() => onRemove(id)}
                    className="notification-close"
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  
  return context
}

export default NotificationContext