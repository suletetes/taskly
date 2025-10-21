import React, { useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import userService from '../../services/userService'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import SuccessMessage from '../common/SuccessMessage'
import DocumentHead from '../common/DocumentHead'

const EditProfile = ({ user, onUpdate, onCancel }) => {
  const { updateUser } = useAuth()
  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751666550/placeholder-user_rbr3rs.png')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  // Predefined avatar options
  const avatarOptions = [
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751666550/placeholder-user_rbr3rs.png',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661915/avatar-1_rltonx.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661916/avatar-2_pcpiuc.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661917/avatar-3_uge9uz.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661918/avatar-4_u7ekxu.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661920/avatar-5_mhbem1.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661917/avatar-6_yhpqaq.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661916/avatar-7_nkwrzp.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661921/avatar-8_qou6jc.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661921/avatar-9_bvbvnm.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661915/avatar-10_whnfik.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661916/avatar-11_mfblhm.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661915/avatar-12_xua4xf.jpg',
    'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661917/avatar-13_nn8ore.jpg'
  ]

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

  const handleAvatarSelect = (avatarUrl) => {
    setSelectedAvatar(avatarUrl)
    setError(null)
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.fullname.trim()) {
      errors.fullname = 'Full name is required (min 2 characters)'
    } else if (formData.fullname.trim().length < 2) {
      errors.fullname = 'Full name must be at least 2 characters'
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required (min 3 characters)'
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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
      const updateData = {
        fullname: formData.fullname.trim(),
        username: formData.username.trim(),
        new_email: formData.email.trim(),
        avatar: selectedAvatar
      }

      // Add password fields if provided
      if (formData.currentPassword) {
        updateData.current_password = formData.currentPassword
      }
      if (formData.newPassword) {
        updateData.new_password = formData.newPassword
      }

      // Update profile data
      const updatedUser = await userService.updateUser(userId, updateData)

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

  return (
    <>
      <DocumentHead 
        title="Edit Profile - Taskly"
        description="Update your profile information, avatar, and account settings."
        keywords="edit profile, user settings, account management"
      />
      
      {/* user setting */}
      <div 
        className="bloc none l-bloc" 
        id="bloc-13"
        style={{
          backgroundImage: "url('/img/background/signup.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container bloc-lg-lg">
          <div className="row">
            <div className="col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-8 offset-lg-2">
              <div className="signup-card">
                <h1 className="mb-4 text-center">Edit User Settings</h1>
                
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

                {/* Avatar Section */}
                <div className="row">
                  <div className="col-lg-12 mt-5">
                    <h4 className="mb-4 text-lg-center">Update Profile Photo</h4>
                  </div>
                  <div className="text-lg-start col-lg-12 mb-lg-2">
                    <div className="form-group mb-3">
                      <div className="avatar-preview mb-4">
                        <img 
                          id="avatar-large" 
                          className="avatar-large"
                          src={selectedAvatar}
                          alt="Selected avatar"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="avatar-gallery mb-5 d-flex flex-wrap justify-content-center gap-2">
                        {avatarOptions.map((avatarUrl, index) => (
                          <img
                            key={index}
                            src={avatarUrl}
                            className={`avatar-thumb img-fluid rounded-circle shadow ${selectedAvatar === avatarUrl ? 'selected' : ''}`}
                            alt={`Avatar ${index + 1}`}
                            width="64"
                            height="64"
                            style={{ 
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: selectedAvatar === avatarUrl ? '3px solid #007bff' : '2px solid transparent'
                            }}
                            onClick={() => handleAvatarSelect(avatarUrl)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    {/* Name and Username Fields */}
                    <div className="row mb-4">
                      <h4 className="text-center text-secondary mb-4">Profile Information</h4>
                      <div className="col-lg-6 mb-3">
                        <label className="form-label" htmlFor="current_fullname">Current Full Name</label>
                        <input 
                          id="current_fullname" 
                          className="form-control" 
                          value={user?.fullname || ''} 
                          disabled 
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label className="form-label" htmlFor="current_username">Current Username</label>
                        <input 
                          id="current_username" 
                          className="form-control" 
                          value={user?.username || ''} 
                          disabled 
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label className="form-label" htmlFor="fullname">New Full Name</label>
                        <input 
                          id="fullname" 
                          className={`form-control ${validationErrors.fullname ? 'is-invalid' : ''}`}
                          name="fullname"
                          value={formData.fullname}
                          onChange={handleInputChange}
                          placeholder="Enter new full name" 
                          minLength="2"
                          disabled={loading}
                        />
                        {validationErrors.fullname && (
                          <div className="invalid-feedback">{validationErrors.fullname}</div>
                        )}
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label className="form-label" htmlFor="username">New Username</label>
                        <input 
                          id="username" 
                          className={`form-control ${validationErrors.username ? 'is-invalid' : ''}`}
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Enter new username" 
                          minLength="3"
                          disabled={loading}
                        />
                        {validationErrors.username && (
                          <div className="invalid-feedback">{validationErrors.username}</div>
                        )}
                      </div>
                    </div>

                    {/* Email Section */}
                    <div className="mb-4 border-bottom pb-3">
                      <h4 className="text-center text-secondary mb-4">Email Settings</h4>
                      <div className="row">
                        <div className="col-lg-12 mb-3">
                          <label className="form-label" htmlFor="current_email">Current Email</label>
                          <input 
                            id="current_email" 
                            className="form-control" 
                            value={user?.email || ''} 
                            disabled 
                          />
                        </div>
                        <div className="col-lg-12 mb-3">
                          <label className="form-label" htmlFor="email">New Email Address</label>
                          <input 
                            id="email" 
                            className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                            name="email" 
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter new email address"
                            disabled={loading}
                          />
                          {validationErrors.email && (
                            <div className="invalid-feedback">{validationErrors.email}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div className="mb-4">
                      <h4 className="text-center text-secondary mb-4">Password Settings</h4>
                      <div className="row">
                        <div className="col-lg-12 mb-3">
                          <label className="form-label" htmlFor="current_password">Current Password</label>
                          <input 
                            id="current_password" 
                            className="form-control" 
                            name="currentPassword"
                            type="password" 
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Current Password" 
                            minLength="8"
                            disabled={loading}
                          />
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label className="form-label" htmlFor="new_password">New Password</label>
                          <input 
                            id="new_password" 
                            className={`form-control ${validationErrors.newPassword ? 'is-invalid' : ''}`}
                            name="newPassword"
                            type="password" 
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="New Password" 
                            minLength="6"
                            disabled={loading}
                          />
                          <small className="text-muted">Minimum 6 characters</small>
                          {validationErrors.newPassword && (
                            <div className="invalid-feedback">{validationErrors.newPassword}</div>
                          )}
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label className="form-label" htmlFor="confirm_password">Confirm New Password</label>
                          <input 
                            id="confirm_password" 
                            className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                          {validationErrors.confirmPassword && (
                            <div className="invalid-feedback">{validationErrors.confirmPassword}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                      className="btn btn-secondary text-light w-100 shadow-sm mt-4" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? <LoadingSpinner size="small" message="" /> : 'Save Changes'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditProfile