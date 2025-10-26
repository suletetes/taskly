import React from 'react'
import { formatDistanceToNow, format, isPast } from 'date-fns'

const TaskCard = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  showUser = false,
  className = '' 
}) => {
  const {
    _id,
    title,
    description,
    due,
    priority,
    status,
    tags = [],
    labels = [],
    user,
    createdAt,
    updatedAt
  } = task

  const dueDate = new Date(due)
  const isOverdue = isPast(dueDate) && status !== 'completed'
  const isCompleted = status === 'completed'
  const isFailed = status === 'failed'

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return ''
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'failed': return 'status-failed'
      case 'in-progress': return 'status-in-progress'
      default: return ''
    }
  }

  const handleToggleComplete = () => {
    if (onToggleComplete && !isFailed) {
      onToggleComplete(_id, !isCompleted)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id, title)
    }
  }

  return (
    <div className={`task-card ${getStatusClass(status)} ${className}`}>
      <div className="task-card-header">
        <div className="task-title-section">
          <button
            className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
            onClick={handleToggleComplete}
            disabled={isFailed}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.5 4.5L6 12L2.5 8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <h3 className={`task-title ${isCompleted ? 'completed' : ''}`}>
            {title}
          </h3>
        </div>
        
        <div className="task-actions">
          <button
            className="task-action-btn edit-btn"
            onClick={handleEdit}
            aria-label="Edit task"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="task-action-btn delete-btn"
            onClick={handleDelete}
            aria-label="Delete task"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4H14M12.5 4V13.5C12.5 14.3284 11.8284 15 11 15H5C4.17157 15 3.5 14.3284 3.5 13.5V4M6.5 1H9.5C10.0523 1 10.5 1.44772 10.5 2V4H5.5V2C5.5 1.44772 5.94772 1 6.5 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {description && (
        <p className="task-description">{description}</p>
      )}

      <div className="task-meta">
        <div className="task-priority">
          <span className={`priority-badge ${getPriorityClass(priority)}`}>
            {priority}
          </span>
        </div>

        <div className="task-due-date">
          <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M11 2H3C2.44772 2 2 2.44772 2 3V11C2 11.5523 2.44772 12 3 12H11C11.5523 12 12 11.5523 12 11V3C12 2.44772 11.5523 2 11 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 1V3M5 1V3M2 5H12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {format(dueDate, 'MMM dd, yyyy')}
          </span>
          {isOverdue && !isCompleted && (
            <span className="overdue-indicator">Overdue</span>
          )}
        </div>
      </div>

      {(tags.length > 0 || labels.length > 0) && (
        <div className="task-tags">
          {tags.map((tag, index) => (
            <span key={`tag-${index}`} className="task-tag">
              #{tag}
            </span>
          ))}
          {labels.map((label, index) => (
            <span key={`label-${index}`} className="task-label">
              {label}
            </span>
          ))}
        </div>
      )}

      {showUser && user && (
        <div className="task-user">
          <span className="user-name">{user.name || user.username}</span>
        </div>
      )}

      <div className="task-footer">
        <div className="task-status">
          <span className={`status-indicator ${getStatusClass(status)}`}>
            {status === 'in-progress' ? 'In Progress' : 
             status === 'completed' ? 'Completed' : 
             status === 'failed' ? 'Failed' : status}
          </span>
        </div>
        
        <div className="task-timestamps">
          <span className="created-at">
            Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
          {updatedAt !== createdAt && (
            <span className="updated-at">
              Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard