import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAnalytics } from '../context/AnalyticsContext'
import { useTasks } from '../hooks/useTasks'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import TaskCard from '../components/task/TaskCard'
import ProductivityAnalytics from '../components/dashboard/ProductivityAnalytics'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const { analytics, isLoading: analyticsLoading } = useAnalytics()
  const { tasks, isLoading: tasksLoading, error: tasksError, fetchTasks } = useTasks()
  const [recentTasks, setRecentTasks] = useState([])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks()
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

  const renderGuestHome = () => (
    <div className="guest-home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Taskly</h1>
          <p className="hero-subtitle">
            Manage your tasks efficiently with our modern task management system
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="features-container">
          <h2>Why Choose Taskly?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Task Management</h3>
              <p>Create, organize, and track your tasks with ease. Set priorities, due dates, and tags.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Track your productivity with detailed analytics and completion statistics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>User Management</h3>
              <p>Manage user profiles and view team productivity across your organization.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Access your tasks anywhere with our mobile-friendly responsive interface.</p>
            </div>
          </div>
        </div>
      </div>
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