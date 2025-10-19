import apiService from './api'

const authService = {
  // User registration
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData)
      
      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // User login
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', credentials)
      
      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // User logout
  async logout() {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error.message)
    } finally {
      // Always clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me')
      
      if (response.success && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
        return response.data
      }
      
      return null
    } catch (error) {
      // If token is invalid, clear storage
      if (error.response?.status === 401) {
        this.clearAuthData()
      }
      throw this.handleAuthError(error)
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  // Get stored user data
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      this.clearAuthData()
      return null
    }
  },

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('token')
  },

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Handle authentication errors
  handleAuthError(error) {
    let message = 'An authentication error occurred'
    
    if (error.response?.data?.error?.message) {
      message = error.response.data.error.message
    } else if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }

    // Create a standardized error object
    const authError = new Error(message)
    authError.status = error.response?.status
    authError.code = error.response?.data?.error?.code
    
    return authError
  },

  // Refresh token (placeholder for future implementation)
  async refreshToken() {
    // This would be implemented if the backend supports token refresh
    // For now, we'll redirect to login when token expires
    throw new Error('Token refresh not implemented')
  }
}

export default authService