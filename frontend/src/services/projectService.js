import apiService from './api'

const projectService = {
  // Get user's projects
  async getUserProjects(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      })
      
      if (status) params.append('status', status)
      if (search) params.append('search', search)
      
      const response = await apiService.get(`/projects?${params}`)
      return response
    } catch (error) {
      throw this.handleProjectError(error)
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const response = await apiService.post('/projects', projectData)
      return response
    } catch (error) {
      throw this.handleProjectError(error)
    }
  },

  // Update project
  async updateProject(projectId, projectData) {
    try {
      const response = await apiService.put(`/projects/${projectId}`, projectData)
      return response
    } catch (error) {
      throw this.handleProjectError(error)
    }
  },

  // Delete project
  async deleteProject(projectId) {
    try {
      const response = await apiService.delete(`/projects/${projectId}`)
      return response
    } catch (error) {
      throw this.handleProjectError(error)
    }
  },

  // Get project by ID
  async getProjectById(projectId) {
    try {
      const response = await apiService.get(`/projects/${projectId}`)
      return response
    } catch (error) {
      throw this.handleProjectError(error)
    }
  },

  // Handle project service errors
  handleProjectError(error) {
    let message = 'A project service error occurred'
    
    if (error.response?.data?.error?.message) {
      message = error.response.data.error.message
    } else if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }

    // Create a standardized error object
    const projectError = new Error(message)
    projectError.status = error.response?.status
    projectError.code = error.response?.data?.error?.code
    
    return projectError
  }
}

export default projectService