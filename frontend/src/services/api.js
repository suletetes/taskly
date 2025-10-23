import axios from 'axios'
import { mockApiService } from './mockApi'

// Global error handler for API errors
let globalErrorHandler = null
let useMockApi = false

export const setGlobalErrorHandler = (handler) => {
  globalErrorHandler = handler
}

// Check if we should use mock API (when backend is not available)
const checkBackendAvailability = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/health', {
      method: 'GET',
      timeout: 2000
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// Initialize backend availability check
checkBackendAvailability().then(isAvailable => {
  if (!isAvailable) {
    useMockApi = true
    console.warn('Backend not available, using mock API for development')
  }
})

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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

    // Call global error handler if available and not suppressed
    if (globalErrorHandler && !originalRequest.suppressGlobalErrorHandler) {
      globalErrorHandler(error, {
        context: 'API Request',
        url: originalRequest.url,
        method: originalRequest.method
      })
    }

    return Promise.reject(error)
  }
)

// Generic API methods with retry logic and mock fallback
const apiService = {
  // GET request with retry and mock fallback
  async get(url, config = {}) {
    // Use mock API if backend is not available
    if (useMockApi) {
      return this.getMockResponse(url, 'GET', config)
    }

    const maxRetries = config.retries || 2
    let lastError

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await api.get(url, config)
        return response.data
      } catch (error) {
        lastError = error
        
        // If network error, switch to mock API
        if (!error.response && i === maxRetries) {
          console.warn('Switching to mock API due to network error')
          useMockApi = true
          return this.getMockResponse(url, 'GET', config)
        }
        
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

  // Mock response handler
  async getMockResponse(url, method, config = {}, data = null) {
    const params = new URLSearchParams(url.split('?')[1] || '')
    const page = parseInt(params.get('page')) || 1
    const limit = parseInt(params.get('limit')) || 10
    const search = params.get('search') || ''

    // Route to appropriate mock endpoint
    if (url.includes('/auth/login') && method === 'POST') {
      return mockApiService.login(data)
    } else if (url.includes('/auth/register') && method === 'POST') {
      return mockApiService.register(data)
    } else if (url.includes('/auth/me')) {
      return mockApiService.getCurrentUser()
    } else if (url.includes('/users') && !url.includes('/tasks')) {
      if (url.match(/\/users\/\w+$/)) {
        const userId = url.split('/').pop()
        return mockApiService.getUserById(userId)
      } else if (url.includes('/stats')) {
        const userId = url.split('/')[2]
        return mockApiService.getUserStats(userId)
      } else {
        return mockApiService.getUsers(page, limit, search)
      }
    } else if (url.includes('/tasks')) {
      if (url.includes('/users/')) {
        const userId = url.split('/')[2]
        return mockApiService.getUserTasks(userId, page, limit)
      } else {
        return mockApiService.getAllTasks(page, limit)
      }
    }

    // Default empty response
    return {
      success: true,
      data: {
        items: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }
    }
  },

  // POST request with retry
  async post(url, data, config = {}) {
    // Use mock API if backend is not available
    if (useMockApi) {
      return this.getMockResponse(url, 'POST', config, data)
    }

    const maxRetries = config.retries || 1 // Less retries for POST to avoid duplicates
    let lastError

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await api.post(url, data, config)
        return response.data
      } catch (error) {
        lastError = error
        
        // If network error on last retry, switch to mock API for auth endpoints
        if (!error.response && i === maxRetries && url.includes('/auth/')) {
          console.warn('Switching to mock API for auth due to network error')
          useMockApi = true
          return this.getMockResponse(url, 'POST', config, data)
        }
        
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