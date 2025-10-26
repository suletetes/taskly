import apiService from './api'

const userService = {
  // Get all users with pagination
  async getUsers(page = 1, limit = 10, search = '', endpoint = '/users') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })
      
      const response = await apiService.get(`${endpoint}?${params}`)
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
  async updateUser(userId, userData) {
    try {
      const response = await apiService.put(`/users/${userId}`, userData)
      
      // Update stored user data if updating current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (currentUser.id === userId || currentUser._id === userId) {
        localStorage.setItem('user', JSON.stringify(response.data))
      }
      
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Delete user account
  async deleteUser(userId) {
    try {
      const response = await apiService.delete(`/users/${userId}`)
      
      // Clear auth data if deleting current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (currentUser.id === userId || currentUser._id === userId) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Update user password
  async updatePassword(userId, passwordData) {
    try {
      const response = await apiService.put(`/users/${userId}/password`, passwordData)
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Upload user avatar
  async uploadAvatar(userId, avatarFile) {
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      
      const response = await apiService.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Update stored user data if updating current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (currentUser.id === userId || currentUser._id === userId) {
        const updatedUser = { ...currentUser, avatar: response.data.avatar }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Get user statistics
  async getUserStats(userId) {
    try {
      const response = await apiService.get(`/users/${userId}/stats`)
      return response
    } catch (error) {
      throw this.handleUserError(error)
    }
  },

  // Search users
  async searchUsers(query, page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({
        search: query,
        page: page.toString(),
        limit: limit.toString()
      })
      
      const response = await apiService.get(`/users/search?${params}`)
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