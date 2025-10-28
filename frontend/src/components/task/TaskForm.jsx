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
    <div className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6 border-b border-secondary-200 dark:border-secondary-700 pb-4">
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          type="button"
          className="p-2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
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
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.title 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-secondary-300 dark:border-secondary-600'
            }`}
            placeholder="Enter task title..."
            maxLength={200}
            disabled={loading}
          />
          {errors.title && <span className="text-red-600 dark:text-red-400 text-sm mt-1 block">{errors.title}</span>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter task description..."
            rows={4}
            maxLength={1000}
            disabled={loading}
          />
          <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 text-right">
            {formData.description.length}/1000
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="due" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              id="due"
              name="due"
              value={formData.due}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.due 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-secondary-300 dark:border-secondary-600'
              }`}
              min={format(new Date(), 'yyyy-MM-dd')}
              disabled={loading}
            />
            {errors.due && <span className="text-red-600 dark:text-red-400 text-sm mt-1 block">{errors.due}</span>}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Priority *
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.priority 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-secondary-300 dark:border-secondary-600'
              }`}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && <span className="text-red-600 dark:text-red-400 text-sm mt-1 block">{errors.priority}</span>}
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Tags
          </label>
          <div className="border border-secondary-300 dark:border-secondary-600 rounded-lg p-2 bg-white dark:bg-secondary-700">
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm rounded-full">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
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
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-secondary-900 dark:text-secondary-100 placeholder-secondary-500"
                placeholder="Add tags..."
                disabled={loading}
              />
            </div>
          </div>
          <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
            Press Enter or comma to add tags
          </div>
        </div>

        <div>
          <label htmlFor="labels" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Labels
          </label>
          <div className="border border-secondary-300 dark:border-secondary-600 rounded-lg p-2 bg-white dark:bg-secondary-700">
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.labels.map((label, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-sm rounded-full">
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="ml-2 text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-200"
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
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-secondary-900 dark:text-secondary-100 placeholder-secondary-500"
                placeholder="Add labels..."
                disabled={loading}
              />
            </div>
          </div>
          <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
            Press Enter or comma to add labels
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-secondary-200 dark:border-secondary-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="small" />
                <span className="ml-2">{isEditing ? 'Updating...' : 'Creating...'}</span>
              </div>
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