import React, { useState, useEffect } from 'react'
import userService from '../../services/userService'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

const UserStatsDashboard = ({ userId, user }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const targetUserId = userId || user?.id || user?._id
        if (targetUserId) {
          const statsData = await userService.getUserStats(targetUserId)
          setStats(statsData.data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, user])

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#28a745'
    if (percentage >= 60) return '#17a2b8'
    if (percentage >= 40) return '#ffc107'
    return '#dc3545'
  }

  const formatDuration = (hours) => {
    if (!hours) return 'N/A'
    if (hours < 1) return `${Math.round(hours * 60)}m`
    if (hours < 24) return `${Math.round(hours)}h`
    return `${Math.round(hours / 24)}d`
  }

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥'
    if (streak >= 14) return '⚡'
    if (streak >= 7) return '✨'
    if (streak >= 3) return '💪'
    return '🎯'
  }

  if (loading) {
    return <LoadingSpinner message="Loading statistics..." />
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!stats) {
    return (
      <div className="stats-dashboard">
        <h2>Statistics Dashboard</h2>
        <p>No statistics available for this user.</p>
      </div>
    )
  }

  const completionRate = stats.completionRate || 0
  const progressColor = getProgressColor(completionRate)

  return (
    <div className="stats-dashboard">
      <div className="dashboard-header">
        <h2>Statistics Dashboard</h2>
        <p>Comprehensive overview of task performance and productivity metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card primary">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalTasks || 0}</div>
            <div className="metric-label">Total Tasks</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{stats.completedTasks || 0}</div>
            <div className="metric-label">Completed</div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <div className="metric-value">{stats.inProgressTasks || 0}</div>
            <div className="metric-label">In Progress</div>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon">❌</div>
          <div className="metric-content">
            <div className="metric-value">{stats.failedTasks || 0}</div>
            <div className="metric-label">Failed</div>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="completion-section">
        <div className="completion-card">
          <h3>Completion Rate</h3>
          <div className="completion-circle">
            <div 
              className="progress-ring"
              style={{
                background: `conic-gradient(${progressColor} ${completionRate * 3.6}deg, #e9ecef 0deg)`
              }}
            >
              <div className="progress-inner">
                <span className="completion-percentage" style={{ color: progressColor }}>
                  {Math.round(completionRate)}%
                </span>
              </div>
            </div>
          </div>
          <p className="completion-description">
            {completionRate >= 80 && "Excellent performance! Keep up the great work."}
            {completionRate >= 60 && completionRate < 80 && "Good job! There's room for improvement."}
            {completionRate >= 40 && completionRate < 60 && "Making progress. Focus on completing more tasks."}
            {completionRate < 40 && "Let's work on improving your completion rate."}
          </p>
        </div>
      </div>

      {/* Streaks and Performance */}
      <div className="performance-section">
        <div className="performance-grid">
          <div className="performance-card">
            <div className="performance-header">
              <span className="performance-emoji">{getStreakEmoji(stats.currentStreak || 0)}</span>
              <h4>Current Streak</h4>
            </div>
            <div className="performance-value">{stats.currentStreak || 0} days</div>
            <div className="performance-description">
              {stats.currentStreak >= 7 ? 'Amazing consistency!' : 'Keep building your streak!'}
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-header">
              <span className="performance-emoji">🏆</span>
              <h4>Best Streak</h4>
            </div>
            <div className="performance-value">{stats.longestStreak || 0} days</div>
            <div className="performance-description">
              Your personal best record
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-header">
              <span className="performance-emoji">⏱️</span>
              <h4>Average Completion</h4>
            </div>
            <div className="performance-value">
              {formatDuration(stats.averageCompletionTime)}
            </div>
            <div className="performance-description">
              Time to complete tasks
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-header">
              <span className="performance-emoji">📈</span>
              <h4>Productivity Score</h4>
            </div>
            <div className="performance-value">
              {stats.productivityScore || Math.round(completionRate)}
            </div>
            <div className="performance-description">
              Overall performance rating
            </div>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="breakdown-section">
        <h3>Task Breakdown</h3>
        <div className="breakdown-chart">
          <div className="breakdown-item">
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill completed"
                style={{ 
                  width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <div className="breakdown-label">
              <span className="breakdown-color completed"></span>
              Completed ({stats.completedTasks || 0})
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill in-progress"
                style={{ 
                  width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <div className="breakdown-label">
              <span className="breakdown-color in-progress"></span>
              In Progress ({stats.inProgressTasks || 0})
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill failed"
                style={{ 
                  width: `${stats.totalTasks > 0 ? (stats.failedTasks / stats.totalTasks) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <div className="breakdown-label">
              <span className="breakdown-color failed"></span>
              Failed ({stats.failedTasks || 0})
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      {stats.recentActivity && (
        <div className="activity-section">
          <h3>Recent Activity</h3>
          <div className="activity-summary">
            <div className="activity-item">
              <span className="activity-label">Tasks this week:</span>
              <span className="activity-value">{stats.recentActivity.thisWeek || 0}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Tasks this month:</span>
              <span className="activity-value">{stats.recentActivity.thisMonth || 0}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Most productive day:</span>
              <span className="activity-value">{stats.recentActivity.bestDay || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserStatsDashboard