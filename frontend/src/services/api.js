import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Clear invalid token
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login page
      window.location.href = '/login'
      
      return Promise.reject(error)
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.'
    }

    return Promise.reject(error)
  }
)

// Generic API methods with retry logic
const apiService = {
  // GET request with retry
  async get(url, config = {}) {
    const maxRetries = config.retries || 2
    let lastError

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await api.get(url, config)
        return response.data
      } catch (error) {
        lastError = error
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break
        }
        
        // Wait before retry (exponential backoff)
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }
    
    throw lastError
  },

  // POST request with retry
  async post(url, data, config = {}) {
    const maxRetries = config.retries || 1 // Less retries for POST to avoid duplicates
    let lastError

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await api.post(url, data, config)
        return response.data
      } catch (error) {
        lastError = error
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break
        }
        
        // Wait before retry
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }
    
    throw lastError
  },

  // PUT request with retry
  async put(url, data, config = {}) {
    const maxRetries = config.retries || 1
    let lastError

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await api.put(url, data, config)
        return response.data
      } catch (error) {
        lastError = error
        
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break
        }
        
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }
    
    throw lastError
  },

  // PATCH request with retry
  async patch(url, data, config = {}) {
    const maxRetries = config.retries || 1
    let lastError

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await api.patch(url, data, config)
        return response.data
      } catch (error) {
        lastError = error
        
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break
        }
        
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }
    
    throw lastError
  },

  // DELETE request with retry
  async delete(url, config = {}) {
    const maxRetries = config.retries || 1
    let lastError

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await api.delete(url, config)
        return response.data
      } catch (error) {
        lastError = error
        
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break
        }
        
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }
    
    throw lastError
  }
}

export default apiService
export { api }