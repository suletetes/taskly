import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import userService from '../services/userService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { SkeletonCard } from '../components/common/SkeletonLoader'
import ErrorMessage from '../components/common/ErrorMessage'
import DocumentHead from '../components/common/DocumentHead'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })

  const usersPerPage = 12

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await userService.getUsers(page, usersPerPage)
      
      setUsers(response.data.users || response.data || [])
      setPagination(response.data.pagination || {
        totalPages: Math.ceil((response.data.length || 0) / usersPerPage),
        totalItems: response.data.length || 0,
        hasNextPage: false,
        hasPreviousPage: false
      })
    } catch (err) {
      setError(err.message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getAvatarUrl = (avatar) => {
    if (!avatar) return '/img/placeholder-user.png'
    if (avatar.startsWith('http')) return avatar
    return `/uploads/avatars/${avatar}`
  }

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    const pages = []

    // Previous Button
    pages.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="page-link text-center"
          aria-label="Previous"
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
      </li>
    )

    // Page Numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <button
            onClick={() => handlePageChange(i)}
            className="page-link text-center"
          >
            {i}
          </button>
        </li>
      )
    }

    // Next Button
    pages.push(
      <li key="next" className={`page-item ${currentPage === pagination.totalPages ? 'disabled' : ''}`}>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="page-link text-center"
          aria-label="Next"
          disabled={currentPage === pagination.totalPages}
        >
          &raquo;
        </button>
      </li>
    )

    return (
      <nav aria-label="User Pagination" className="d-flex justify-content-center mt-4">
        <ul className="pagination">
          {pages}
        </ul>
      </nav>
    )
  }

  return (
    <>
      <DocumentHead 
        title="All Users - Taskly"
        description="Browse our users and check out their completed tasks and profiles!"
        keywords="users, profiles, task management, community"
      />
      
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold text-secondary">Explore All Users</h2>
        <p className="text-center text-muted mb-5 fs-5">Browse our users and check out their completed tasks and profiles!</p>

        {/* Loading State */}
        {loading && (
          <div className="row g-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="col-lg-3 col-md-6 text-center">
                <SkeletonCard 
                  hasAvatar={true}
                  lines={3}
                  className="user-skeleton h-100"
                />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage 
            message={error}
            onRetry={() => fetchUsers(currentPage)}
          />
        )}

        {/* Users Grid */}
        {!loading && !error && (
          <>
            <div className="row g-4">
              {users && users.length > 0 ? (
                users.map(user => (
                  <div key={user._id || user.id} className="col-lg-3 col-md-6 text-center">
                    <div className="user-card card shadow-lg border-0 rounded-4 h-100">
                      <div className="card-body">
                        {/* Avatar */}
                        <img 
                          src={getAvatarUrl(user.avatar)}
                          alt={`${user.username || user.fullname || 'User'}'s Avatar`}
                          className="user-card-img rounded-circle shadow mb-3"
                          loading="lazy"
                          style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                        />

                        {/* Username */}
                        <h3 className="text-center fw-bold mb-2">
                          {user.username || user.fullname || 'User Name'}
                        </h3>

                        {/* Tasks Completed */}
                        <h5 className="text-center text-success fw-bold">
                          Tasks Completed: {user.stats?.completed || 0}
                        </h5>

                        {/* View Profile Button */}
                        <Link 
                          to={`/users/${user._id || user.id}`}
                          className="btn btn-view-profile btn-primary mt-3 rounded-pill px-4"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback when No Users */
                <div className="col-12">
                  <p className="text-center text-muted fs-5">No users found. Be the first to join our platform!</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </>
  )
}

export default Users