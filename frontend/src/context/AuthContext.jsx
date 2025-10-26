import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import authService from '../services/authService'

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false, // Set to false initially to prevent blocking
  error: null,
  backendAvailable: true
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  SET_BACKEND_UNAVAILABLE: 'SET_BACKEND_UNAVAILABLE'
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }

    case AUTH_ACTIONS.SET_BACKEND_UNAVAILABLE:
      return {
        ...state,
        backendAvailable: false,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: 'Backend server is not available'
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start - only when needed
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      if (!isMounted) return

      // Only check authentication if we have stored user data or are on a protected route
      const hasStoredUser = authService.hasStoredUser()
      const currentPath = window.location.pathname
      const publicPaths = ['/', '/about', '/login', '/signup', '/users']
      const isPublicRoute = publicPaths.includes(currentPath) || currentPath.startsWith('/users/')
      
      if (!hasStoredUser && isPublicRoute) {
        // No stored user and on public route, mark as not authenticated without API call
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'No stored user data'
        })
        return
      }

      // Only try to authenticate if we have stored user data or are on a protected route
      if (hasStoredUser || !isPublicRoute) {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })

        try {
          // Try to get user data from API (session-based)
          const currentUser = await authService.getCurrentUser()
          if (isMounted) {
            if (currentUser) {
              dispatch({
                type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
                payload: currentUser
              })
            } else {
              dispatch({
                type: AUTH_ACTIONS.LOAD_USER_FAILURE,
                payload: 'No active session'
              })
            }
          }
        } catch (error) {
          if (isMounted) {
            // Clear any stale data and mark as not authenticated
            authService.clearAuthData()
            
            // Check if it's a backend unavailable error
            if (error.code === 'BACKEND_UNAVAILABLE') {
              dispatch({
                type: AUTH_ACTIONS.SET_BACKEND_UNAVAILABLE
              })
            } else {
              dispatch({
                type: AUTH_ACTIONS.LOAD_USER_FAILURE,
                payload: 'User not authenticated'
              })
            }
          }
        }
      } else {
        // On public route without stored user, just mark as not authenticated
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'No authentication needed for public route'
        })
      }
    }

    // Add a small delay to prevent rapid re-calls in development
    const timeoutId = setTimeout(initializeAuth, 100)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  // Load user from session or API
  const loadUser = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })

    try {
      // Try to get user data from API (session-based)
      const currentUser = await authService.getCurrentUser()
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: currentUser
      })
    } catch (error) {
      // Clear any stale data and mark as not authenticated
      authService.clearAuthData()
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: 'User not authenticated'
      })
    }
  }, [dispatch])

  // Login function
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await authService.login(credentials)
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user
          }
        })
        return response
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message
      })
      throw error
    }
  }, [dispatch])

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START })

    try {
      const response = await authService.register(userData)
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: {
            user: response.data.user
          }
        })
        return response
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message
      })
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.warn('Logout API call failed:', error.message)
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    })
  }

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [dispatch])

  // Set loading function
  const setLoading = (loading) => {
    dispatch({
      type: AUTH_ACTIONS.SET_LOADING,
      payload: loading
    })
  }

  // Refresh user data
  const refreshUser = async () => {
    if (state.isAuthenticated) {
      try {
        const currentUser = await authService.getCurrentUser()
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: currentUser
        })
        return currentUser
      } catch (error) {
        console.error('Failed to refresh user data:', error)
        // If refresh fails due to invalid session, logout
        if (error.status === 401) {
          logout()
        }
        throw error
      }
    }
  }

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    backendAvailable: state.backendAvailable,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
    setLoading,
    refreshUser,
    loadUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default AuthContext