import apiService from './api'

const authService = {
  // User registration
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData)
      
      if (response.success && response.data.user) {
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
      
      if (response.success && response.data.user) {
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
      //console.warn('Logout API call failed:', error.message)
    } finally {
      // Always clear local storage
      localStorage.removeItem('user')
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me', {
        suppressGlobalErrorHandler: true // Don't show global error for auth checks
      })
      
      if (response.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response.data.user
      }
      
      return null
    } catch (error) {
      // If not authenticated, just clear storage and return null (don't throw)
      if (error.response?.status === 401) {
        this.clearAuthData()
        return null
      }
      
      // For network errors, throw a more specific error
      if (error.code === 'ERR_NETWORK') {
        const networkError = new Error('Backend server is not available')
        networkError.code = 'BACKEND_UNAVAILABLE'
        throw networkError
      }
      
      // For other errors, clear data and throw
      this.clearAuthData()
      throw this.handleAuthError(error)
    }
  },

  // Check if user is authenticated (we'll verify with server)
  async isAuthenticated() {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      return false
    }
  },

  // Check if user data exists in localStorage (quick check)
  hasStoredUser() {
    const user = localStorage.getItem('user')
    return !!user
  },

  // Get stored user data
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      //console.error('Error parsing stored user data:', error)
      this.clearAuthData()
      return null
    }
  },

  // Clear authentication data
  clearAuthData() {
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

    // Clear auth data for 401 and 403 errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      this.clearAuthData()
    }

    // Create a standardized error object
    const authError = new Error(message)
    authError.status = error.response?.status
    authError.code = error.response?.data?.error?.code
    
    return authError
  },

  // Get user's teams
  async getUserTeams() {
    try {
      const response = await apiService.get('/auth/teams')
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Get user's projects
  async getUserProjects() {
    try {
      const response = await apiService.get('/auth/projects')
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Get user's permissions for a specific team
  async getTeamPermissions(teamId) {
    try {
      const response = await apiService.get(`/auth/teams/${teamId}/permissions`)
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Get user's permissions for a specific project
  async getProjectPermissions(projectId) {
    try {
      const response = await apiService.get(`/auth/projects/${projectId}/permissions`)
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Update user profile with team/project context
  async updateUserProfile(userData) {
    try {
      const response = await apiService.put('/auth/profile', userData)
      
      if (response.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Validate team invite code
  async validateTeamInvite(inviteCode) {
    try {
      const response = await apiService.get(`/auth/invites/${inviteCode}/validate`)
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Join team via invite code
  async joinTeamByInvite(inviteCode) {
    try {
      const response = await apiService.post(`/auth/invites/${inviteCode}/join`)
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Leave team
  async leaveTeam(teamId) {
    try {
      const response = await apiService.post(`/auth/teams/${teamId}/leave`)
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Leave project
  async leaveProject(projectId) {
    try {
      const response = await apiService.post(`/auth/projects/${projectId}/leave`)
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  },

  // Refresh token (placeholder for future implementation)
  async refreshToken() {
    // This would be implemented if the backend supports token refresh
    // For now, we'll redirect to login when token expires
    throw new Error('Token refresh not implemented')
  }
}

export default authService