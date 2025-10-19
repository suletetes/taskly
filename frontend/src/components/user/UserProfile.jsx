import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import userService from '../../services/userService'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import SuccessMessage from '../common/SuccessMessage'

const UserProfile = ({ userId, isOwnProfile = false }) => {
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use current user data if viewing own profile
        const targetUserId = userId || currentUser?.id || currentUser?._id
        
        if (isOwnProfile && currentUser) {
          setUser(currentUser)
        } else if (targetUserId) {
          const userData = await userService.getUserById(targetUserId)
          setUser(userData.data)
        }

        // Fetch user statistics
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

    fetchUserData()
  }, [userId, currentUser, isOwnProfile])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAvatarUrl = (avatar) => {
    if (!avatar) return '/img/placeholder-user.png'
    if (avatar.startsWith('http')) return avatar
    return `/uploads/avatars/${avatar}`
  }

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!user) {
    return (
      <ErrorMessage 
        message="User not found"
        title="Profile Not Found"
      />
    )
  }

  return (
    <div className="user-profile">
      {success && (
        <SuccessMessage 
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={getAvatarUrl(user.avatar)} 
            alt={`${user.firstName} ${user.lastName}`}
            className="avatar-image"
          />
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">
            {user.firstName} {user.lastName}
          </h1>
          <p className="profile-email">{user.email}</p>
          {user.role && (
            <span className={`profile-role role-${user.role}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          )}
          <p className="profile-joined">
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {stats && (
        <div className="profile-statistics">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalTasks || 0}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{stats.completedTasks || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">
                {stats.completionRate ? `${Math.round(stats.completionRate)}%` : '0%'}
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{stats.currentStreak || 0}</div>
              <div className="stat-label">Current Streak</div>
            </div>
          </div>
        </div>
      )}

      {user.bio && (
        <div className="profile-bio">
          <h2>About</h2>
          <p>{user.bio}</p>
        </div>
      )}
    </div>
  )
}

export default UserProfile