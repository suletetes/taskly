import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import taskService from '../services/taskService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import DocumentHead from '../components/common/DocumentHead'

const AddTask = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due: new Date().toISOString().split('T')[0], // Today's date
    priority: ''
  })
  const [tags, setTags] = useState(['work'])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handlePriorityChange = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority
    }))

    if (validationErrors.priority) {
      setValidationErrors(prev => ({
        ...prev,
        priority: null
      }))
    }
  }

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (!tags.includes(newTag)) {
        setTags(prev => [...prev, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const quickDate = (option) => {
    const today = new Date()
    let targetDate = new Date(today)

    switch (option) {
      case 'today':
        break
      case 'tomorrow':
        targetDate.setDate(today.getDate() + 1)
        break
      case 'nextweek':
        targetDate.setDate(today.getDate() + 7)
        break
      default:
        break
    }

    setFormData(prev => ({
      ...prev,
      due: targetDate.toISOString().split('T')[0]
    }))
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Task Title is required.'
    }

    if (!formData.due) {
      errors.due = 'Due Date is required.'
    } else {
      const dueDate = new Date(formData.due)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dueDate < today) {
        errors.due = 'Due date cannot be in the past.'
      }
    }

    if (!formData.priority) {
      errors.priority = 'Priority is required.'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const taskData = {
        ...formData,
        tags,
        user: user.id || user._id
      }

      await taskService.createTask(taskData)
      
      // Navigate back to tasks or profile
      navigate(`/users/${user.id || user._id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(-1) // Go back to previous page
  }

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <p>Please log in to create tasks.</p>
      </div>
    )
  }

  return (
    <>
      <DocumentHead 
        title="Add New Task - Taskly"
        description="Create a new task to stay organized and productive."
        keywords="add task, create task, task management, productivity"
      />
      
      {/* Add Task Section */}
      <div className="bloc none l-bloc mt-3" id="bloc-add-task">
        <div className="container bloc-lg-lg">
          <div className="row">
            <div className="col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-8 offset-lg-2">
              {error && (
                <ErrorMessage
                  message={error}
                  onClose={() => setError(null)}
                />
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-lg-12">
                    <h2 className="mb-4 text-lg-center">
                      <i className="fa fa-plus-circle me-2"></i>Add New Task
                    </h2>
                  </div>
                  
                  {/* Task Title */}
                  <div className="text-lg-start col-12">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="task-title">
                        <h4><i className="fa fa-heading me-1"></i> Task Title <span className="text-danger">*</span></h4>
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
                        id="task-title" 
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Finalize design proposal" 
                        autoFocus
                        disabled={loading}
                      />
                      {validationErrors.title && (
                        <div className="invalid-feedback">{validationErrors.title}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Task Description */}
                  <div className="text-lg-start col-12">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="task-desc">
                        <h4><i className="fa fa-align-left me-1"></i>Description</h4>
                      </label>
                      <textarea 
                        className="form-control" 
                        id="task-desc" 
                        name="description" 
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Details or notes about this task"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  {/* Due Date */}
                  <div className="text-lg-start col-12">
                    <div className="form-group mb-3">
                      <label className="form-label fs-5" htmlFor="due-date">
                        <h4><i className="fa fa-calendar-alt me-1"></i>Due Date <span className="text-danger">*</span></h4>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${validationErrors.due ? 'is-invalid' : ''}`}
                        id="due-date"
                        name="due"
                        value={formData.due}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={loading}
                      />
                      {validationErrors.due && (
                        <div className="invalid-feedback">{validationErrors.due}</div>
                      )}
                      <div className="mt-2">
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary btn-sm me-1"
                          onClick={() => quickDate('today')}
                          disabled={loading}
                        >
                          Today
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary btn-sm me-1"
                          onClick={() => quickDate('tomorrow')}
                          disabled={loading}
                        >
                          Tomorrow
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => quickDate('nextweek')}
                          disabled={loading}
                        >
                          Next Week
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Priority */}
                  <div className="text-lg-start col-12">
                    <div className="form-group mb-3">
                      <label className="form-label fs-5">
                        <h4><i className="fa fa-bolt me-1"></i>Priority <span className="text-danger">*</span></h4>
                      </label>
                      <div className="btn-group w-100" role="group" aria-label="Priority">
                        <input 
                          type="radio" 
                          className="btn-check" 
                          name="priority" 
                          id="priority-low"
                          value="low" 
                          checked={formData.priority === 'low'}
                          onChange={() => handlePriorityChange('low')}
                          disabled={loading}
                        />
                        <label className="btn btn-outline-primary" htmlFor="priority-low">
                          <i className="fa fa-circle text-primary me-1"></i>Low
                        </label>
                        
                        <input 
                          type="radio" 
                          className="btn-check" 
                          name="priority" 
                          id="priority-medium"
                          value="medium" 
                          checked={formData.priority === 'medium'}
                          onChange={() => handlePriorityChange('medium')}
                          disabled={loading}
                        />
                        <label className="btn btn-outline-warning" htmlFor="priority-medium">
                          <i className="fa fa-circle text-warning me-1"></i>Medium
                        </label>
                        
                        <input 
                          type="radio" 
                          className="btn-check" 
                          name="priority" 
                          id="priority-high"
                          value="high" 
                          checked={formData.priority === 'high'}
                          onChange={() => handlePriorityChange('high')}
                          disabled={loading}
                        />
                        <label className="btn btn-outline-danger" htmlFor="priority-high">
                          <i className="fa fa-circle text-danger me-1"></i>High
                        </label>
                      </div>
                      {validationErrors.priority && (
                        <div className="invalid-feedback d-block">{validationErrors.priority}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="text-lg-start col-12">
                    <div className="form-group mb-3">
                      <label className="form-label fs-5">
                        <i className="fa fa-tags me-1"></i>Tags
                      </label>
                      <div className="mb-2" id="tag-list">
                        {tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1 tag-item">
                            {tag}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white btn-sm ms-1 remove-tag" 
                              aria-label="Remove"
                              onClick={() => removeTag(tag)}
                              disabled={loading}
                            />
                          </span>
                        ))}
                      </div>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="tag-input" 
                        placeholder="+ Add"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        disabled={loading}
                      />
                      <small className="form-text text-muted">Press Enter to add tags. Click × to remove.</small>
                    </div>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="d-flex gap-2 mt-3">
                  <button 
                    className="bloc-button btn btn-wire w-50" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-plus me-1"></i>Add Task
                      </>
                    )}
                  </button>
                  <button 
                    className="bloc-button btn btn-outline-secondary w-50" 
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <i className="fa fa-times me-1"></i>Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddTask