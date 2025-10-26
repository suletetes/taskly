import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import userService from '../services/userService'
import taskService from '../services/taskService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import DocumentHead from '../components/common/DocumentHead'
import SafeImage from '../components/common/SafeImage'

const Profile = () => {
  const { user: currentUser, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  })

  const userId = currentUser?.id || currentUser?._id
  const tasksPerPage = 10

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !currentUser || !isAuthenticated) return

      try {
        setLoading(true)
        setError(null)

        // Fetch user stats
        const statsResponse = await userService.getUserStats(userId)
        setStats(statsResponse.data?.stats || {})

        // Fetch user tasks
        const tasksResponse = await taskService.getUserTasks(userId, {
          page: currentPage,
          limit: tasksPerPage
        })
        setTasks(tasksResponse.data.tasks || tasksResponse.data.items || tasksResponse.data || [])
        setPagination(tasksResponse.data.pagination || {
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        })

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId, currentPage, currentUser, isAuthenticated])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTaskStatus = (task) => {
    const now = new Date()
    const dueDate = new Date(task.due)

    if (task.status === 'completed') return 'completed'
    if (task.status === 'failed') return 'failed'
    if (task.status === 'in-progress' && dueDate < now) return 'failed'
    return task.status || 'in-progress'
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          borderClass: 'success',
          iconClass: 'fa fa-check-circle fa-2x text-success me-3',
          badgeClass: 'badge bg-success ms-auto align-self-start px-3 py-2 fs-6',
          badgeIcon: 'fa fa-check me-1',
          badgeText: 'Completed'
        }
      case 'failed':
        return {
          borderClass: 'danger',
          iconClass: 'fa fa-times-circle fa-2x text-danger me-3',
          badgeClass: 'badge bg-danger ms-auto align-self-start px-3 py-2 fs-6',
          badgeIcon: 'fa fa-exclamation-triangle me-1',
          badgeText: 'Failed'
        }
      default:
        return {
          borderClass: 'info',
          iconClass: 'fa fa-spinner fa-2x text-info me-3',
          badgeClass: 'badge bg-info text-dark ms-auto align-self-start px-3 py-2 fs-6',
          badgeIcon: 'fa fa-hourglass-half me-1',
          badgeText: 'In Progress'
        }
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.updateTaskStatus(taskId, 'completed')
      // Refresh tasks
      const tasksResponse = await taskService.getUserTasks(userId, {
        page: currentPage,
        limit: tasksPerPage
      })
      setTasks(tasksResponse.data.tasks || tasksResponse.data.items || tasksResponse.data || [])

      // Refresh stats
      const statsResponse = await userService.getUserStats(userId)
      setStats(statsResponse.data?.stats || {})
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId)
        // Refresh tasks
        const tasksResponse = await taskService.getUserTasks(userId, {
          page: currentPage,
          limit: tasksPerPage
        })
        setTasks(tasksResponse.data.tasks || tasksResponse.data.items || tasksResponse.data || [])

        // Refresh stats
        const statsResponse = await userService.getUserStats(userId)
        setStats(statsResponse.data?.stats || {})
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await userService.deleteUser(userId)
        logout()
        navigate('/')
      } catch (err) {
        console.error('Failed to delete account:', err)
      }
    }
  }

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    const pages = []

    if (pagination.hasPreviousPage) {
      pages.push(
        <li key="prev" className="page-item">
          <button
            className="page-link"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
        </li>
      )
    }

    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <button
            className="page-link"
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </li>
      )
    }

    if (pagination.hasNextPage) {
      pages.push(
        <li key="next" className="page-item">
          <button
            className="page-link"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </li>
      )
    }

    return (
      <nav className="d-flex justify-content-center mt-5" aria-label="Task pagination">
        <ul className="pagination pagination-lg">
          {pages}
        </ul>
      </nav>
    )
  }

  if (!currentUser) {
    return (
      <div className="bloc l-bloc py-5 bg-light">
        <div className="container text-center">
          <h1>Profile</h1>
          <p>Please log in to view your profile.</p>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bloc l-bloc py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <LoadingSpinner size="large" message="Loading profile..." />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bloc l-bloc py-5 bg-light">
        <div className="container">
          <ErrorMessage message={error} />
        </div>
      </div>
    )
  }

  return (
    <>
      <DocumentHead
        title={`${currentUser.fullname || currentUser.username || 'User'} - Profile | Taskly`}
        description={`View your profile, tasks, and productivity statistics.`}
        keywords="user profile, tasks, productivity, statistics"
      />

      {/* User Profile */}
      <div className="bloc l-bloc py-5" id="bloc-tasks" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '400px'
      }}>
        <div className="container bloc-lg bloc-no-padding-lg">
          {/* User Info Section */}
          <div className="row align-items-center justify-content-center text-center text-white mb-5">
            <div className="col-12 col-md-8 col-lg-6">
              {/* Profile Picture */}
              <div className="position-relative d-inline-block mb-4">
                <SafeImage
                  src={currentUser.avatar?.startsWith('http') ? currentUser.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${currentUser.avatar}`}
                  fallbackSrc={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/img/placeholder-user.png`}
                  className="rounded-circle border border-4 border-white shadow-lg"
                  alt="User avatar"
                  width="200"
                  height="200"
                  style={{ 
                    objectFit: 'cover',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}
                />
                <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-3 border-white" 
                     style={{ width: '40px', height: '40px' }}>
                  <i className="fa fa-check text-white d-flex align-items-center justify-content-center h-100"></i>
                </div>
              </div>

              {/* User Details */}
              <h1 className="display-5 fw-bold mb-3 text-white">{currentUser.fullname || 'User Name'}</h1>
              
              <div className="d-flex justify-content-center align-items-center gap-4 mb-3 flex-wrap">
                <div className="d-flex align-items-center">
                  <i className="fa fa-user me-2 text-white-50"></i>
                  <span className="text-white-50">@{currentUser.username || 'username'}</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fa fa-calendar me-2 text-white-50"></i>
                  <span className="text-white-50">Joined {formatDate(currentUser.created_at || currentUser.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
                <Link
                  to="/tasks/new"
                  className="btn btn-lg px-4 rounded-pill shadow"
                  style={{ 
                    fontWeight: '600 !important',
                    color: '#667eea !important',
                    backgroundColor: 'white !important',
                    border: 'none !important',
                    textDecoration: 'none !important'
                  }}
                >
                  <i className="fa fa-plus me-2"></i>Add Task
                </Link>
                <Link
                  to="/profile/edit"
                  className="btn btn-lg px-4 rounded-pill"
                  style={{ 
                    fontWeight: '600 !important',
                    borderWidth: '2px !important',
                    borderColor: 'white !important',
                    color: 'white !important',
                    backgroundColor: 'transparent !important',
                    textDecoration: 'none !important'
                  }}
                >
                  <i className="fa fa-edit me-2"></i>Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row g-4 justify-content-center mt-4">
            <div className="col-6 col-md-3">
              <div className="card bg-white bg-opacity-90 border-0 rounded-4 shadow text-center h-100">
                <div className="card-body py-4">
                  <i className="fa fa-check-circle text-success mb-2" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="fw-bold text-success mb-1">{stats.completed || 0}</h3>
                  <p className="text-muted mb-0 fw-semibold">Completed</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-white bg-opacity-90 border-0 rounded-4 shadow text-center h-100">
                <div className="card-body py-4">
                  <i className="fa fa-tasks text-info mb-2" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="fw-bold text-info mb-1">{stats.ongoing || 0}</h3>
                  <p className="text-muted mb-0 fw-semibold">Ongoing</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-white bg-opacity-90 border-0 rounded-4 shadow text-center h-100">
                <div className="card-body py-4">
                  <i className="fa fa-bolt text-warning mb-2" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="fw-bold text-warning mb-1">{stats.streak || 0}</h3>
                  <p className="text-muted mb-0 fw-semibold">Day Streak</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-white bg-opacity-90 border-0 rounded-4 shadow text-center h-100">
                <div className="card-body py-4">
                  <i className="fa fa-percentage text-primary mb-2" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="fw-bold text-primary mb-1">{stats.completionRate || 0}%</h3>
                  <p className="text-muted mb-0 fw-semibold">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bloc l-bloc py-5 bg-light">
        <div className="container bloc-lg bloc-no-padding-lg">

          {/* Task Cards */}
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">
                  <i className="fa fa-tasks text-primary me-2"></i>
                  My Tasks
                </h3>
                <span className="badge bg-primary rounded-pill px-3 py-2">
                  {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
              </div>
              <div className="d-flex flex-column gap-4">
                {tasks && tasks.length > 0 ? (
                  tasks.map(task => {
                    const dynamicStatus = getTaskStatus(task)
                    const statusConfig = getStatusConfig(dynamicStatus)

                    return (
                      <div
                        key={task._id || task.id}
                        className={`card shadow-lg border-0 rounded-4 overflow-hidden glass-card border-start border-5 border-${statusConfig.borderClass}`}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <span className={statusConfig.iconClass}></span>
                            <div>
                              <h4 className="card-title mb-1 fw-bold">{task.title}</h4>
                              <small className="text-muted">
                                <i className="fa fa-calendar-alt me-1"></i>
                                Due: {new Date(task.due).toISOString().split('T')[0]}
                              </small>
                            </div>
                            <span className={statusConfig.badgeClass}>
                              <i className={statusConfig.badgeIcon}></i> {statusConfig.badgeText}
                            </span>
                          </div>
                          <p className="card-text text-muted mb-3">
                            {task.description || 'No description provided.'}
                          </p>
                          <div className="mb-3">
                            {task.tags && task.tags.length > 0 && task.tags.map((tag, index) => (
                              <span key={index} className="badge bg-secondary me-1">{tag}</span>
                            ))}
                            {task.priority === 'high' && (
                              <span className="badge bg-danger text-light me-1">
                                <i className="fa fa-arrow-up me-1"></i> High Priority
                              </span>
                            )}
                            {task.priority === 'medium' && (
                              <span className="badge bg-warning text-dark me-1">
                                <i className="fa fa-equals me-1"></i> Medium Priority
                              </span>
                            )}
                            {task.priority === 'low' && (
                              <span className="badge bg-success text-light me-1">
                                <i className="fa fa-arrow-down me-1"></i> Low Priority
                              </span>
                            )}
                          </div>
                          {(dynamicStatus === 'in-progress' || dynamicStatus === 'failed') && (
                            <div className="d-flex justify-content-end gap-2 mt-3">
                              <Link
                                to={`/tasks/${task._id || task.id}/edit`}
                                className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold"
                                style={{ 
                                  backgroundColor: '#0d6efd',
                                  borderColor: '#0d6efd',
                                  color: 'white'
                                }}
                              >
                                <i className="fa fa-edit me-1"></i>Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteTask(task._id || task.id)}
                                className="btn btn-danger btn-sm rounded-pill px-3 fw-semibold"
                                style={{ 
                                  backgroundColor: '#dc3545',
                                  borderColor: '#dc3545',
                                  color: 'white'
                                }}
                              >
                                <i className="fa fa-trash me-1"></i>Delete
                              </button>
                              <button
                                onClick={() => handleCompleteTask(task._id || task.id)}
                                className="btn btn-success btn-sm rounded-pill px-3 fw-semibold"
                                style={{ 
                                  backgroundColor: '#198754',
                                  borderColor: '#198754',
                                  color: 'white'
                                }}
                              >
                                <i className="fa fa-check me-1"></i>Done
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <>
                    <p className="text-center text-muted">
                      No tasks available. Create a new task to get started!
                    </p>
                    <div className="text-center mt-3">
                      <Link
                        to="/tasks/new"
                        className="btn btn-secondary"
                      >
                        <i className="fa fa-plus me-1"></i>Create New Task
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {renderPagination()}

          {/* Delete Account Section */}
          <div className="row justify-content-center mt-5">
            <div className="col-12 col-md-6 text-center">
              <div className="card border-danger">
                <div className="card-body">
                  <h5 className="card-title text-danger">
                    <i className="fa fa-exclamation-triangle me-2"></i>
                    Danger Zone
                  </h5>
                  <p className="card-text text-muted">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); handleDeleteAccount(); }}>
                    <button
                      type="submit"
                      className="btn btn-danger"
                      style={{
                        backgroundColor: '#dc3545 !important',
                        borderColor: '#dc3545 !important',
                        color: 'white !important',
                        fontWeight: '600'
                      }}
                    >
                      <i className="fa fa-trash me-2"></i>Delete Account
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile