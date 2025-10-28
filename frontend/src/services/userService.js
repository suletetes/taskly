import apiService from './api'

const userService = {
  // Get public users for home page showcase
  async getPublicUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search
      } = options
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (search) params.append('search', search)
      
      const response = await apiService.get(`/users/public?${params}`)
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Get all users (authenticated)
  async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search
      } = options
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (search) params.append('search', search)
      
      const response = await apiService.get(`/users?${params}`)
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await apiService.get(`/users/${userId}`)
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/users/profile', profileData)
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiService.put('/users/profile/password', passwordData)
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Upload avatar
  async uploadAvatar(avatarData) {
    try {
      const response = await apiService.put('/users/profile/avatar', avatarData)
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Handle user service errors
  handleUserError(error) {
    let message = 'A user service error occurred'
    
    if (error.response?.data?.error?.message) {
      message = error.response.data.error.message
    } else if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }

    // Create a standardized error object
    const userError = new Error(message)
    userError.status = error.response?.status
    userError.code = error.response?.data?.error?.code
    
    return userError
  }
}

export default userService