import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../context/NotificationContext'
import LoadingSpinner from '../components/common/LoadingSpinner'


const Signup = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '/img/placeholder-user.png'
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, isAuthenticated, error, clearError } = useAuth()
  const { showSuccess } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()

  // Avatar options matching the EJS template
  const avatarOptions = [
    '/img/placeholder-user.png',
    '/img/avatars/avatar-1.jpg',
    '/img/avatars/avatar-2.jpg',
    '/img/avatars/avatar-3.jpg',
    '/img/avatars/avatar-4.jpg',
    '/img/avatars/avatar-5.jpg',
    '/img/avatars/avatar-6.jpg',
    '/img/avatars/avatar-7.jpg',
    '/img/avatars/avatar-8.jpg',
    '/img/avatars/avatar-9.jpg',
    '/img/avatars/avatar-10.jpg',
    '/img/avatars/avatar-11.jpg',
    '/img/avatars/avatar-12.jpg',
    '/img/avatars/avatar-13.jpg'
  ]

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = location.state?.from || '/'
      navigate(returnTo, { replace: true })
    }
  }, [isAuthenticated, navigate, location.state])

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  const validateForm = () => {
    const newErrors = {}

    // Full name validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required'
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = 'Full name must be at least 2 characters long'
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters long'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Clear confirm password error if passwords now match
    if (name === 'password' && formData.confirmPassword && value === formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }))
    }

    // Clear auth error when user modifies form
    if (error) {
      clearError()
    }
  }

  const handleAvatarSelect = (avatarUrl) => {
    setFormData(prev => ({
      ...prev,
      avatar: avatarUrl
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        fullname: formData.fullname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        avatar: formData.avatar
      })

      showSuccess('Account created successfully! Welcome to Taskly.')

      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Registration failed:', err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bloc none l-bloc" style={{
      backgroundImage: 'url("/img/background/signup.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <div className="container bloc-xl-lg">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-7">
            <div className="signup-card bg-white shadow-lg rounded-4 p-4">
              <h2 className="mb-4 text-center fw-bold text-dark">Create Your Taskly Account</h2>

              {/* Avatar Section */}
              <div className="col-12 mt-5">
                <h4 className="mb-4 text-center">Select Avatar</h4>
              </div>
              <div className="avatar-preview mb-4">
                <img
                  id="avatar-large"
                  className="avatar-large"
                  src={formData.avatar}
                  alt="Selected avatar"
                />
              </div>
              <div className="avatar-gallery mb-5 flex-wrap justify-center">
                {avatarOptions.map((avatarUrl, index) => (
                  <picture key={index}>
                    <img
                      src={avatarUrl}
                      className={`avatar-thumb img-fluid rounded-circle shadow ${formData.avatar === avatarUrl ? 'selected' : ''}`}
                      alt={`Avatar ${index + 1}`}
                      width="64"
                      height="64"
                      style={{ objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => handleAvatarSelect(avatarUrl)}
                    />
                  </picture>
                ))}
              </div>

              {/* Signup Form */}
              <form id="signup-form" onSubmit={handleSubmit} noValidate>
                {/* Avatar Hidden Input */}
                <input type="hidden" name="avatar" value={formData.avatar} />

                {/* Full Name and Username */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold" htmlFor="fullname">Full Name</label>
                    <input
                      id="fullname"
                      className={`form-control shadow-sm ${errors.fullname ? 'is-invalid' : ''}`}
                      required
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      disabled={isSubmitting}
                    />
                    {errors.fullname && <div className="invalid-feedback">{errors.fullname}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold" htmlFor="username">Username</label>
                    <input
                      id="username"
                      className={`form-control shadow-sm ${errors.username ? 'is-invalid' : ''}`}
                      required
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      autoComplete="username"
                      disabled={isSubmitting}
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                  </div>
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    className={`form-control shadow-sm ${errors.email ? 'is-invalid' : ''}`}
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Password and Confirm Password */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold" htmlFor="password">Password</label>
                    <input
                      id="password"
                      className={`form-control shadow-sm ${errors.password ? 'is-invalid' : ''}`}
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      type="password"
                      minLength="6"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <small id="password-strength" className="text-muted">Must be at least 6 characters.</small>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      className={`form-control shadow-sm ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      required
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      type="password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </div>

                {/* Global Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Signup Buttons & CTA */}
                <div className="d-grid gap-3 d-md-flex justify-content-between align-items-center mt-4">
                  {/* Go Back Button */}
                  <Link to="/" className="btn btn-outline-secondary shadow-sm fw-bold py-2 px-4">
                    Go Back
                  </Link>

                  {/* Submit Button */}
                  <button
                    className="btn btn-secondary rounded shadow-sm fw-bold py-2 px-4"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ms-2">Creating Account...</span>
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                {/* Login CTA */}
                <p className="text-center mt-4 mb-0">
                  Already have an account?{' '}
                  <Link to="/login" state={location.state} className="text-primary text-decoration-underline fw-semibold">
                    Login here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup