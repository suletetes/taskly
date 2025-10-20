import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAnalytics } from '../context/AnalyticsContext'
import { useTasks } from '../hooks/useTasks'
import userService from '../services/userService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import TaskCard from '../components/task/TaskCard'
import ProductivityAnalytics from '../components/dashboard/ProductivityAnalytics'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const { analytics, isLoading: analyticsLoading } = useAnalytics()
  const { tasks, isLoading: tasksLoading, error: tasksError, fetchTasks } = useTasks()
  const [recentTasks, setRecentTasks] = useState([])
  const [featuredUsers, setFeaturedUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks()
    } else {
      // Fetch featured users for guest home page
      fetchFeaturedUsers()
    }
  }, [isAuthenticated, user, fetchTasks])

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      // Get the 5 most recent tasks
      const sortedTasks = [...tasks].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      setRecentTasks(sortedTasks.slice(0, 5))
    }
  }, [tasks])

  const fetchFeaturedUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await userService.getUsers(1, 6) // Get first 6 users
      setFeaturedUsers(response.data.items || response.data || [])
    } catch (error) {
      console.error('Failed to fetch featured users:', error)
      setFeaturedUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  const renderGuestHome = () => (
    <div className="guest-home">
      {/* Hero Section with Main Image */}
      <section>
        <div className="bloc l-bloc none full-width-bloc" id="bloc-1">
          <div className="container bloc-no-padding bloc-no-padding-lg">
            <div className="row g-0">
              <div className="col-md-12 col-lg-12 offset-lg-0 text-lg-start">
                <picture>
                  <source type="image/webp" srcSet="/img/task--main.webp" />
                  <img
                    src="/img/task--main.jpg"
                    className="img-fluid mx-auto d-block"
                    alt="task main"
                    width="2240"
                    height="1484"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* First Quote Section - Seneca */}
      <section>
        <div className="bloc l-bloc none" id="bloc-2">
          <div className="container bloc-lg bloc-md-lg">
            <div className="row justify-content-center">
              <div className="text-center w-100">
                <h3 className="display-6 fw-bold mb-3 text-wrap">
                  <span className="fa fa-quote-left text-dark me-2"></span>
                  It is not that we have a short time to live, but that we waste a lot of it. Life is long
                  enough, and a generous enough amount has been given to us for the highest achievements
                  if it were all well invested. But when it is wasted in heedless luxury and spent on no good
                  activity, we are forced at last by death's final constraint to realize that it has passed
                  away before we knew it was passing.
                  <span className="fa fa-quote-right text-dark ms-2"></span>
                </h3>
                <h4 className="fw-semibold text-dark">
                  — Seneca
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1 - Seamless Task Management */}
      <section>
        <div className="bloc l-bloc full-width-bloc" id="bloc-3">
          <div className="container bloc-no-padding">
            <div className="row g-0">
              <div className="col-md-12 offset-lg--1 col-lg-6">
                <picture>
                  <source type="image/webp" srcSet="/img/sidebar-task-1.webp" />
                  <img
                    src="/img/sidebar-task-1.jpg"
                    className="img-fluid mx-auto d-block"
                    alt="task-management"
                    width="1120"
                    height="742"
                  />
                </picture>
              </div>
              <div className="align-self-center offset-md-1 col-md-10 col-sm-10 offset-sm-1 offset-1 col-10 offset-lg-1 col-lg-4">
                <h2 className="mg-md fw-bold display-5 text-secondary mb-3">
                  Seamless Task Management
                </h2>
                <h3 className="mg-md fw-semibold text-muted mb-2">
                  Organize, prioritize, and accomplish more every day.
                </h3>
                <p className="lead text-dark lh-base">
                  <strong className="text-brand">Taskly</strong> empowers you to track your tasks, set clear
                  priorities, and stay focused on what matters most.
                  <span className="text-highlight"> Experience a streamlined workflow</span> designed to boost your
                  productivity and help you achieve your goals efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Organize Your Workflow */}
      <section>
        <div className="bloc l-bloc none full-width-bloc" id="bloc-4">
          <div className="container bloc-no-padding">
            <div className="row g-0">
              <div className="order-md-0 col-md-12 col-lg-6 order-lg-1 offset-lg-1">
                <picture>
                  <source type="image/webp" srcSet="/img/sidebar-task-2.webp" />
                  <img
                    src="/img/sidebar-task-2.jpg"
                    className="img-fluid mx-auto d-block"
                    alt="organize-task"
                    width="1120"
                    height="742"
                  />
                </picture>
              </div>
              <div className="align-self-center offset-md-1 col-md-10 col-lg-4 col-sm-10 offset-sm-1 col-10 offset-1">
                <h2 className="mg-md fw-bold display-5 text-secondary mb-3">
                  Organize Your Workflow
                </h2>
                <h3 className="mg-md fw-semibold text-muted mb-2">
                  Stay productive and focused with <span className="text-brand">Taskly</span>.
                </h3>
                <p className="lead text-dark lh-base">
                  <strong>Taskly</strong> helps you manage your daily tasks efficiently, prioritize what
                  matters most, and achieve your goals with ease.
                  <span className="text-highlight"> Simplify your workflow</span> and
                  make every day more productive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Users Showcase Section */}
      <section>
        <div className="bloc l-bloc" id="bloc-5">
          <div className="container bloc-lg bloc-md-lg">
            <div className="row">
              <div className="col-md-12 col-lg-6 offset-lg-3">
                <h2 className="display-6 fw-bold text-center mb-2">
                  View Users
                </h2>
                <p className="lead text-center mb-4">
                  Explore our active users and their productivity stats below.
                </p>
              </div>
            </div>
            <div className="row">
              {usersLoading ? (
                <div className="col-12 text-center">
                  <LoadingSpinner size="medium" />
                </div>
              ) : featuredUsers && featuredUsers.length > 0 ? (
                featuredUsers.map(user => (
                  <div key={user._id || user.id} className="col-md-6">
                    <div className="row voffset align-items-center">
                      <div className="col-lg-3">
                        <img
                          src={user.avatar || '/img/placeholder-user.png'}
                          className="img-fluid rounded-circle"
                          alt={`${user.firstName || user.fullname || 'User'}'s Avatar`}
                          width="122"
                          height="122"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="col">
                        <h4 className="fw-semibold text-secondary mb-1 text-lg-start text-center">
                          <Link to={`/users/${user._id || user.id}`}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.fullname || 'User Name'
                            }
                          </Link>
                        </h4>
                        <p className="mb-2 lh-sm text-lg-start text-center">
                          <span className="fw-medium">Task Completion Rate:</span>{' '}
                          {user.stats?.completionRate !== undefined ? `${user.stats.completionRate}%` : 'N/A'}<br />
                          <span className="fw-medium">Failed Tasks:</span>{' '}
                          {user.stats?.failed || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <p className="text-center text-muted fs-5">
                    No users found. Be the first to join Taskly!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Second Quote Section - James Clear */}
      <section>
        <div className="bloc l-bloc" id="bloc-6">
          <div className="container bloc-lg bloc-md-lg">
            <div className="row justify-content-center">
              <div className="text-center w-100">
                <h2 className="display-6 fw-bold mb-3 text-wrap">
                  <span className="fa fa-quote-left text-dark me-2"></span>
                  You do not rise to the level of your goals. You fall to the level of your systems. Goals
                  are good for setting direction, but systems are best for making progress. You should be far
                  more concerned with your current trajectory than with your current results.
                  <span className="fa fa-quote-right text-dark ms-2"></span>
                </h2>
                <h4 className="fw-semibold text-dark">
                  — James Clear
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section>
        <div className="bloc l-bloc" id="bloc-cta">
          <div className="container bloc-lg">
            <div className="row justify-content-center">
              <div className="col-md-8 text-center">
                <h2 className="display-5 fw-bold mb-4">Ready to Get Started?</h2>
                <p className="lead mb-4">
                  Join thousands of users who are already managing their tasks more efficiently with Taskly.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link to="/signup" className="btn btn-primary btn-lg px-4">
                    <i className="fa fa-user-plus me-2"></i>
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg px-4">
                    <i className="fa fa-sign-in-alt me-2"></i>
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  const renderUserDashboard = () => (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.firstName || user?.email || 'User'}!</h1>
        <p>Here's your productivity overview</p>
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="dashboard-section quick-stats">
          <h2>Quick Stats</h2>
          {analyticsLoading ? (
            <LoadingSpinner size="medium" />
          ) : analytics ? (
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-number">{analytics.totalTasks || 0}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{analytics.completedTasks || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{analytics.inProgressTasks || 0}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {analytics.completionRate ? `${Math.round(analytics.completionRate)}%` : '0%'}
                </div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
          ) : (
            <p>No analytics data available</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/profile" className="action-btn">
              <span className="action-icon">📝</span>
              <span>Manage Tasks</span>
            </Link>
            <Link to="/profile" className="action-btn">
              <span className="action-icon">👤</span>
              <span>View Profile</span>
            </Link>
            <Link to="/users" className="action-btn">
              <span className="action-icon">👥</span>
              <span>View Users</span>
            </Link>
            <Link to="/about" className="action-btn">
              <span className="action-icon">ℹ️</span>
              <span>About</span>
            </Link>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="dashboard-section recent-tasks">
          <div className="section-header">
            <h2>Recent Tasks</h2>
            <Link to="/profile" className="view-all-link">View All</Link>
          </div>
          {tasksLoading ? (
            <LoadingSpinner size="medium" />
          ) : tasksError ? (
            <ErrorMessage
              title="Failed to load tasks"
              message={tasksError}
              onRetry={() => fetchTasks()}
            />
          ) : recentTasks.length > 0 ? (
            <div className="recent-tasks-list">
              {recentTasks.map(task => (
                <div key={task._id} className="recent-task-item">
                  <TaskCard task={task} compact={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tasks">
              <p>No tasks yet. <Link to="/profile">Create your first task!</Link></p>
            </div>
          )}
        </div>

        {/* Productivity Analytics */}
        <div className="dashboard-section productivity-section">
          <h2>Productivity Overview</h2>
          <ProductivityAnalytics compact={true} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="home">
      {isAuthenticated ? renderUserDashboard() : renderGuestHome()}
    </div>
  )
}

export default Home