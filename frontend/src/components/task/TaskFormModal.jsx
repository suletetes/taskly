import React, { useEffect, useCallback } from 'react'
import TaskForm from './TaskForm'

const TaskFormModal = ({
  isOpen,
  task = null,
  onSubmit,
  onClose,
  loading = false,
  error = null,
  className = ''
}) => {
  // Handle escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !loading) {
      onClose()
    }
  }, [onClose, loading])

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleKeyDown])

  // Handle overlay click
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }, [onClose, loading])

  if (!isOpen) return null

  return (
    <div className={`task-form-modal ${className}`}>
      <div 
        className="modal-overlay" 
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <div className="modal-content">
          <TaskForm
            task={task}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

export default TaskFormModal