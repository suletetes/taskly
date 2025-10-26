import React, { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

const TaskForm = ({
  task = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  className = ''
}) => {
  const isEditing = !!task
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due: '',
    priority: 'medium',
    tags: [],
    labels: []
  })
  
  const [tagInput, setTagInput] = useState('')
  const [labelInput, setLabelInput] = useState('')
  const [errors, setErrors] = useState({})

  // Initialize form data when task prop changes
  useEffect(() => {
    if (task) {
      const dueDate = task.due ? format(new Date(task.due), 'yyyy-MM-dd') : ''
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due: dueDate,
        priority: task.priority || 'medium',
        tags: task.tags || [],
        labels: task.labels || []
      })
    } else {
      // Set default due date to today for new tasks
      const today = format(new Date(), 'yyyy-MM-dd')
      setFormData(prev => ({
        ...prev,
        due: today
      }))
    }
  }, [task])

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.due) {
      newErrors.due = 'Due date is required'
    } else {
      const dueDate = new Date(formData.due)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dueDate < today) {
        newErrors.due = 'Due date cannot be in the past'
      }
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }, [errors])

  // Handle tag input
  const handleTagInputChange = useCallback((e) => {
    setTagInput(e.target.value)
  }, [])

  const handleTagInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim()
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }))
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.slice(0, -1)
      }))
    }
  }, [tagInput, formData.tags])

  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }, [])

  // Handle label input
  const handleLabelInputChange = useCallback((e) => {
    setLabelInput(e.target.value)
  }, [])

  const handleLabelInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const label = labelInput.trim()
      if (label && !formData.labels.includes(label)) {
        setFormData(prev => ({
          ...prev,
          labels: [...prev.labels, label]
        }))
      }
      setLabelInput('')
    } else if (e.key === 'Backspace' && !labelInput && formData.labels.length > 0) {
      setFormData(prev => ({
        ...prev,
        labels: prev.labels.slice(0, -1)
      }))
    }
  }, [labelInput, formData.labels])

  const removeLabel = useCallback((labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      due: new Date(formData.due).toISOString()
    }

    try {
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }, [formData, validateForm, onSubmit])

  return (
    <div className={`task-form ${className}`}>
      <div className="task-form-header">
        <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
        <button
          type="button"
          className="close-btn"
          onClick={onCancel}
          aria-label="Close form"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          className="form-error"
        />
      )}

      <form onSubmit={handleSubmit} className="task-form-content">
        <div className="form-group">
          <label htmlFor="title" className="form-label required">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Enter task title..."
            maxLength={200}
            disabled={loading}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Enter task description..."
            rows={4}
            maxLength={1000}
            disabled={loading}
          />
          <div className="character-count">
            {formData.description.length}/1000
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="due" className="form-label required">
              Due Date
            </label>
            <input
              type="date"
              id="due"
              name="due"
              value={formData.due}
              onChange={handleInputChange}
              className={`form-input ${errors.due ? 'error' : ''}`}
              min={format(new Date(), 'yyyy-MM-dd')}
              disabled={loading}
            />
            {errors.due && <span className="error-text">{errors.due}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="priority" className="form-label required">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className={`form-select ${errors.priority ? 'error' : ''}`}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && <span className="error-text">{errors.priority}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags" className="form-label">
            Tags
          </label>
          <div className="tag-input-container">
            <div className="tag-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag-item">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className="tag-input"
                placeholder="Add tags..."
                disabled={loading}
              />
            </div>
          </div>
          <div className="input-help">
            Press Enter or comma to add tags
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="labels" className="form-label">
            Labels
          </label>
          <div className="label-input-container">
            <div className="label-list">
              {formData.labels.map((label, index) => (
                <span key={index} className="label-item">
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="label-remove"
                    aria-label={`Remove label ${label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="labels"
                value={labelInput}
                onChange={handleLabelInputChange}
                onKeyDown={handleLabelInputKeyDown}
                className="label-input"
                placeholder="Add labels..."
                disabled={loading}
              />
            </div>
          </div>
          <div className="input-help">
            Press Enter or comma to add labels
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Task' : 'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TaskForm