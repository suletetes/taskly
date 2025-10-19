import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import UserProfile from '../components/user/UserProfile'
import EditProfile from '../components/user/EditProfile'
import ChangePassword from '../components/user/ChangePassword'
import UserStatsDashboard from '../components/user/UserStatsDashboard'
import DeleteUserConfirmation from '../components/user/DeleteUserConfirmation'

const Profile = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('view')
  const [updatedUser, setUpdatedUser] = useState(user)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleProfileUpdate = (newUserData) => {
    setUpdatedUser(newUserData)
    setActiveTab('view')
  }

  const handlePasswordChangeSuccess = () => {
    setActiveTab('view')
  }

  const handleDeleteSuccess = () => {
    // User deleted their own account, log them out
    logout()
    window.location.href = '/'
  }

  if (!user) {
    return (
      <div className="profile">
        <h1>Profile</h1>
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="profile">
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          Edit Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button 
          className={`tab-button danger ${activeTab === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveTab('delete')}
        >
          Delete Account
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'view' && (
          <UserProfile 
            user={updatedUser}
            isOwnProfile={true}
          />
        )}
        
        {activeTab === 'edit' && (
          <EditProfile 
            user={updatedUser}
            onUpdate={handleProfileUpdate}
            onCancel={() => setActiveTab('view')}
          />
        )}
        
        {activeTab === 'stats' && (
          <UserStatsDashboard 
            user={updatedUser}
          />
        )}
        
        {activeTab === 'password' && (
          <ChangePassword 
            onSuccess={handlePasswordChangeSuccess}
            onCancel={() => setActiveTab('view')}
          />
        )}
        
        {activeTab === 'delete' && (
          <div className="delete-account-section">
            <div className="delete-account-warning">
              <h2>⚠️ Delete Account</h2>
              <p>
                This action will permanently delete your account and all associated data. 
                This cannot be undone.
              </p>
              <div className="delete-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('view')}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <DeleteUserConfirmation
          user={updatedUser}
          onSuccess={handleDeleteSuccess}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

export default Profile