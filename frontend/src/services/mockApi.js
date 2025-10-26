// Mock API for development when backend is not running
const mockUsers = [
  {
    _id: '1',
    username: 'johndoe',
    fullname: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661915/avatar-1_rltonx.jpg',
    stats: {
      completed: 12,
      failed: 2,
      completionRate: 85
    },
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    _id: '2',
    username: 'janedoe',
    fullname: 'Jane Doe',
    email: 'jane@example.com',
    avatar: 'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661916/avatar-2_pcpiuc.jpg',
    stats: {
      completed: 8,
      failed: 1,
      completionRate: 89
    },
    created_at: '2024-01-20T14:15:00Z'
  },
  {
    _id: '3',
    username: 'bobsmith',
    fullname: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661917/avatar-3_uge9uz.jpg',
    stats: {
      completed: 15,
      failed: 0,
      completionRate: 100
    },
    created_at: '2024-01-10T09:45:00Z'
  },
  {
    _id: '4',
    username: 'alicejohnson',
    fullname: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://res.cloudinary.com/dbdbod1wt/image/upload/v1751661918/avatar-4_u7ekxu.jpg',
    stats: {
      completed: 6,
      failed: 3,
      completionRate: 67
    },
    created_at: '2024-02-01T16:20:00Z'
  }
]

const mockTasks = [
  {
    _id: '1',
    title: 'Complete project proposal',
    description: 'Write and submit the quarterly project proposal',
    due: '2024-12-31T23:59:59Z',
    priority: 'high',
    status: 'in-progress',
    tags: ['work', 'urgent'],
    user: '1',
    created_at: '2024-12-01T10:00:00Z'
  },
  {
    _id: '2',
    title: 'Review team performance',
    description: 'Conduct quarterly performance reviews for team members',
    due: '2024-12-28T17:00:00Z',
    priority: 'medium',
    status: 'completed',
    tags: ['management', 'hr'],
    user: '1',
    created_at: '2024-11-15T14:30:00Z'
  }
]

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApiService = {
  // Users endpoints
  async getUsers(page = 1, limit = 10, search = '') {
    await delay(500) // Simulate network delay
    
    let filteredUsers = mockUsers
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.fullname.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: {
        items: paginatedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredUsers.length / limit),
          totalItems: filteredUsers.length,
          hasNextPage: endIndex < filteredUsers.length,
          hasPreviousPage: page > 1
        }
      }
    }
  },

  async getUserById(id) {
    await delay(300)
    const user = mockUsers.find(u => u._id === id)
    if (!user) {
      throw new Error('User not found')
    }
    return {
      success: true,
      data: user
    }
  },

  async getUserStats(id) {
    await delay(200)
    const user = mockUsers.find(u => u._id === id)
    if (!user) {
      throw new Error('User not found')
    }
    return {
      success: true,
      data: {
        completed: user.stats.completed,
        failed: user.stats.failed,
        ongoing: 3,
        completionRate: user.stats.completionRate,
        streak: 5,
        avgTime: '2.5 hrs'
      }
    }
  },

  // Tasks endpoints
  async getUserTasks(userId, page = 1, limit = 10) {
    await delay(400)
    const userTasks = mockTasks.filter(task => task.user === userId)
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTasks = userTasks.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: {
        items: paginatedTasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(userTasks.length / limit),
          totalItems: userTasks.length,
          hasNextPage: endIndex < userTasks.length,
          hasPreviousPage: page > 1
        }
      }
    }
  },

  async getAllTasks(page = 1, limit = 10) {
    await delay(400)
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTasks = mockTasks.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: {
        items: paginatedTasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(mockTasks.length / limit),
          totalItems: mockTasks.length,
          hasNextPage: endIndex < mockTasks.length,
          hasPreviousPage: page > 1
        }
      }
    }
  },

  // Auth endpoints
  async login(credentials) {
    await delay(800)
    // Mock successful login
    return {
      success: true,
      data: {
        user: mockUsers[0],
        token: 'mock-jwt-token-' + Date.now()
      }
    }
  },

  async signup(userData) {
    await delay(1000)
    // Mock successful signup
    const newUser = {
      _id: Date.now().toString(),
      ...userData,
      stats: {
        completed: 0,
        failed: 0,
        completionRate: 0
      },
      created_at: new Date().toISOString()
    }
    return {
      success: true,
      data: {
        user: newUser,
        token: 'mock-jwt-token-' + Date.now()
      }
    }
  }
}

export default mockApiService