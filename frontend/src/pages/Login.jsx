import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../context/NotificationContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import OfflineMode from '../components/common/OfflineMode'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, isAuthenticated, isLoading, error, clearError, backendAvailable } = useAuth()
  const { showSuccess } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()

  // Add auth-page class to body for background image support
  useEffect(() => {
    document.body.classList.add('auth-page')
    return () => {
      document.body.classList.remove('auth-page')
    }
  }, [])

  // Redirect if already authenticated (only after loading is complete)
  useEffect(() => {
    if (isAuthenticated && !isLoading && !isSubmitting) {
      const returnTo = location.state?.from || '/dashboard'
      navigate(returnTo, { replace: true })
    }
  }, [isAuthenticated, isLoading, isSubmitting, navigate, location.state])



  const validateForm = () => {
    const newErrors = {}

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

    // Clear auth error when user modifies form
    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        username: formData.email.trim(), // Backend accepts username or email in username field
        password: formData.password
      })

      showSuccess('Welcome back! You have been successfully logged in.')

      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed:', err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    clearError()
    setErrors({})
  }

  // Show offline mode if backend is not available
  if (!backendAvailable) {
    return <OfflineMode />
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="bloc none l-bloc" id="bloc-8" style={{
        backgroundImage: 'url("/img/background/login.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh'
      }}>
        <div className="container bloc-xl-lg">
          <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="col-sm-10 col-md-8 col-lg-6">
              <div className="login-card bg-white shadow-lg rounded-4 p-4 text-center">
                <LoadingSpinner size="large" />
                <p className="mt-3 text-muted">Checking authentication...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bloc none l-bloc" id="bloc-8" style={{
      backgroundImage: 'url("/img/background/login.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh'
    }}>
      <div className="container bloc-xl-lg">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-6">
            <div className="login-card bg-white shadow-lg rounded-4 p-4">
              {/* Header */}
              <h2 className="mb-4 text-center fw-bold text-dark">Login to Taskly</h2>

              {/* Login Form */}
              <form id="login-form" onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    className={`form-control shadow-sm ${errors.email ? 'is-invalid' : ''}`}
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="password">Password</label>
                  <input
                    id="password"
                    className={`form-control shadow-sm ${errors.password ? 'is-invalid' : ''}`}
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    type="password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {/* Global Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  className="btn btn-secondary w-100 rounded shadow-sm mt-3 fw-bold py-2"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ms-2">Logging in...</span>
                    </>
                  ) : (
                    'Login'
                  )}
                </button>

                {/* Signup CTA */}
                <p className="text-center mt-4 mb-0">
                  <span className="text-muted">Don't have an account?</span>{' '}
                  <Link to="/signup" state={location.state} className="text-primary fw-semibold text-decoration-underline">
                    Sign up here
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

export default Login