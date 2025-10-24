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
  const { user: currentUser, logout } = useAuth()
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
      if (!userId) return

      try {
        setLoading(true)
        setError(null)

        // Fetch user stats
        const statsResponse = await userService.getUserStats(userId)
        setStats(statsResponse.data || {})

        // Fetch user tasks
        const tasksResponse = await taskService.getUserTasks(userId, currentPage, tasksPerPage)
        setTasks(tasksResponse.data.items || tasksResponse.data || [])
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
  }, [userId, currentPage])

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
    if (task.status === 'in-progress' && dueDate < now) return 'failed'
    return 'in-progress'
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
      const tasksResponse = await taskService.getUserTasks(userId, currentPage, tasksPerPage)
      setTasks(tasksResponse.data.items || tasksResponse.data || [])

      // Refresh stats
      const statsResponse = await userService.getUserStats(userId)
      setStats(statsResponse.data || {})
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId)
        // Refresh tasks
        const tasksResponse = await taskService.getUserTasks(userId, currentPage, tasksPerPage)
        setTasks(tasksResponse.data.items || tasksResponse.data || [])

        // Refresh stats
        const statsResponse = await userService.getUserStats(userId)
        setStats(statsResponse.data || {})
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
      <div className="bloc l-bloc py-5 bg-light" id="bloc-tasks">
        <div className="container bloc-lg bloc-no-padding-lg">
          {/* User Info Section */}
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-5">
            <div className="order-1 order-md-1 me-4 mb-3 mb-md-0">
              <SafeImage
                src={currentUser.avatar}
                fallbackSrc="/img/placeholder-user.png"
                className="img-fluid rounded-circle shadow lazyload"
                alt="User avatar"
                width="180"
                height="180"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="order-2 order-md-2 ms-md-5 text-center flex-grow-1">
              <h2 className="fw-bold mb-2">{currentUser.fullname || 'User Name'}</h2>
              <p className="text-muted mb-1">
                <i className="fa fa-user me-1"></i>Username:
                <span className="fw-semibold"> {currentUser.username || 'Username'}</span>
              </p>
              <p className="text-muted mb-3">
                <i className="fa fa-calendar me-1"></i>Member Since:
                <span className="fw-semibold"> {formatDate(currentUser.created_at || currentUser.createdAt)}</span>
              </p>

              <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                <Link
                  to="/tasks/new"
                  className="btn btn-primary btn-lg px-4"
                  aria-label="Add Task"
                  title="Add Task"
                >
                  <i className="fa fa-plus me-2"></i>Add Task
                </Link>
                <Link
                  to="/profile/edit"
                  className="btn btn-secondary btn-lg px-4"
                  role="button"
                  aria-label="Edit Profile"
                  title="Edit Profile"
                >
                  <i className="fa fa-edit me-2"></i>Edit Profile
                </Link>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleDeleteAccount(); }} className="d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn btn-danger btn-lg px-4"
                  aria-label="Delete Account"
                  title="Delete Account"
                >
                  <i className="fa fa-trash me-2"></i>Delete Account
                </button>
              </form>
            </div>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Productivity Stats */}
            <div className="col-12 col-lg-4">
              <div className="card shadow-sm border-0 glass-card mb-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-4 text-primary">
                    <i className="fa fa-chart-line me-2"></i>Productivity Stats
                  </h5>
                  <div className="row text-center">
                    <div className="col-6 mb-3">
                      <span className="ion ion-checkmark-round icon-md text-success mb-1 d-block"></span>
                      <div className="fw-semibold">Completed</div>
                      <div className="fs-4 fw-bold">{stats.completed || 0}</div>
                    </div>
                    <div className="col-6 mb-3">
                      <span className="fa fa-bolt icon-md text-warning mb-1 d-block"></span>
                      <div className="fw-semibold">Streak</div>
                      <div className="fs-4 fw-bold">
                        {stats.streak || 0} <span className="fs-6 fw-normal">days</span>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <span className="fa fa-times-circle icon-md text-danger mb-1 d-block"></span>
                      <div className="fw-semibold">Failed</div>
                      <div className="fs-4 fw-bold">{stats.failed || 0}</div>
                    </div>
                    <div className="col-6 mb-3">
                      <span className="fa fa-percent icon-md text-primary mb-1 d-block"></span>
                      <div className="fw-semibold">Completion Rate</div>
                      <div className="fs-4 fw-bold">{stats.completionRate || 0}%</div>
                    </div>
                    <div className="col-6">
                      <span className="fa fa-tasks icon-md text-info mb-1 d-block"></span>
                      <div className="fw-semibold">Ongoing</div>
                      <div className="fs-4 fw-bold">{stats.ongoing || 0}</div>
                    </div>
                    <div className="col-6">
                      <span className="fa fa-clock icon-md text-secondary mb-1 d-block"></span>
                      <div className="fw-semibold">Avg. Time</div>
                      <div className="fs-4 fw-bold">{stats.avgTime || '0 hrs'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Cards */}
            <div className="col-12 col-lg-8">
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
                          {dynamicStatus === 'in-progress' && (
                            <div className="d-flex justify-content-end gap-2">
                              <Link
                                to={`/tasks/${task._id || task.id}/edit`}
                                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                              >
                                <i className="fa fa-edit me-1"></i>Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteTask(task._id || task.id)}
                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              >
                                <i className="fa fa-trash me-1"></i>Delete
                              </button>
                              <button
                                onClick={() => handleCompleteTask(task._id || task.id)}
                                className="btn btn-success btn-sm rounded-pill px-3"
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
        </div>
      </div>
    </>
  )
}

export default Profile