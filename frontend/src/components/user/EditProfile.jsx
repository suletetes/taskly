import React, { useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import userService from '../../services/userService'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import SuccessMessage from '../common/SuccessMessage'

const EditProfile = ({ user, onUpdate, onCancel }) => {
  const { updateUser } = useAuth()
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || ''
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const fileInputRef = useRef(null)

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setAvatar(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
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

      const userId = user?.id || user?._id

      // Update profile data
      const updatedUser = await userService.updateUser(userId, formData)

      // Upload avatar if selected
      if (avatar) {
        const avatarResponse = await userService.uploadAvatar(userId, avatar)
        updatedUser.data.avatar = avatarResponse.data.avatar
      }

      // Update auth context
      if (updateUser) {
        updateUser(updatedUser.data)
      }

      setSuccess('Profile updated successfully!')

      // Call parent update handler
      if (onUpdate) {
        onUpdate(updatedUser.data)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getAvatarUrl = (avatar) => {
    if (avatarPreview) return avatarPreview
    if (!avatar) return '/img/placeholder-user.png'
    if (avatar.startsWith('http')) return avatar
    return `/uploads/avatars/${avatar}`
  }

  return (
    <div className="edit-profile">
      <div className="edit-profile-header">
        <h2>Edit Profile</h2>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <SuccessMessage
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* Avatar Upload */}
        <div className="form-group avatar-upload">
          <label>Profile Picture</label>
          <div className="avatar-upload-container">
            <div className="current-avatar">
              <img
                src={getAvatarUrl(user?.avatar)}
                alt="Profile"
                className="avatar-preview"
              />
            </div>
            <div className="avatar-upload-controls">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="avatar-input"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
              >
                Choose New Photo
              </button>
              <p className="avatar-help">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* First Name */}
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={validationErrors.firstName ? 'error' : ''}
            disabled={loading}
          />
          {validationErrors.firstName && (
            <span className="error-text">{validationErrors.firstName}</span>
          )}
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={validationErrors.lastName ? 'error' : ''}
            disabled={loading}
          />
          {validationErrors.lastName && (
            <span className="error-text">{validationErrors.lastName}</span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={validationErrors.email ? 'error' : ''}
            disabled={loading}
          />
          {validationErrors.email && (
            <span className="error-text">{validationErrors.email}</span>
          )}
        </div>

        {/* Bio */}
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows="4"
            placeholder="Tell us about yourself..."
            disabled={loading}
          />
        </div>

        {/* Form Actions */}
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
            {loading ? <LoadingSpinner size="small" message="" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProfile