import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../context/NotificationContext'
import LoadingSpinner from './LoadingSpinner'

const Header = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const { showSuccess } = useNotification()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      showSuccess('You have been successfully logged out.')
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="l-bloc none" id="bloc-0">
      <div className="container bloc-sm bloc-no-padding-lg">
        <div className="row">
          <div className="col">
            <nav className="navbar navbar-light row navbar-expand-md hover-open-submenu" role="navigation">
              <div className="container-fluid">
                <Link className="navbar-brand link-style ltc-2869" to="/" onClick={closeMobileMenu}>
                  Taskly
                </Link>

                <button
                  id="nav-toggle"
                  type="button"
                  className="ui-navbar-toggler navbar-toggler border-0 p-0 ms-auto me-md-0"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle navigation"
                  data-bs-toggle="collapse"
                  data-bs-target=".navbar-25309"
                  onClick={toggleMobileMenu}
                >
                  <span className="navbar-toggler-icon">
                    <svg height="32" viewBox="0 0 32 32" width="32">
                      <path className="svg-menu-icon" d="m2 9h28m-28 7h28m-28 7h28"></path>
                    </svg>
                  </span>
                </button>

                <div className={`collapse navbar-collapse navbar-35179 navbar-25309 ${isMobileMenuOpen ? 'show' : ''}`}>
                  {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center ms-auto">
                      <LoadingSpinner size="small" />
                    </div>
                  ) : (
                    <ul className="site-navigation nav navbar-nav none ms-auto">
                      {/* Home */}
                      <li className="nav-item">
                        <Link
                          to="/"
                          className={`nav-link ltc-2869 ${location.pathname === '/' ? 'active' : ''}`}
                          onClick={closeMobileMenu}
                        >
                          Home
                        </Link>
                      </li>

                      {/* About */}
                      <li className="nav-item">
                        <Link
                          to="/about"
                          className={`nav-link a-btn ltc-2869 ${location.pathname === '/about' ? 'active' : ''}`}
                          onClick={closeMobileMenu}
                        >
                          About
                        </Link>
                      </li>

                      {/* Users */}
                      <li className="nav-item">
                        <Link
                          to="/users"
                          className={`nav-link a-btn ltc-2869 ${location.pathname === '/users' ? 'active' : ''}`}
                          onClick={closeMobileMenu}
                        >
                          Users
                        </Link>
                      </li>

                      {/* Conditional rendering: If the user is authenticated */}
                      {isAuthenticated ? (
                        <>

                          {/* User dropdown for authenticated users */}
                          <li className="nav-item dropdown">
                            <button
                              className="nav-link dropdown-toggle a-btn ltc-2869 d-flex align-items-center btn btn-link border-0 bg-transparent"
                              id="navbarDropdown"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                            >
                              <img
                                src={user?.avatar || '/img/placeholder-user.png'}
                                alt="User Avatar"
                                className="rounded-circle me-2"
                                width="24"
                                height="24"
                                style={{ objectFit: 'cover' }}
                              />
                              {user?.fullname || user?.username || 'User'}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                              <li>
                                <Link
                                  to="/profile"
                                  className="dropdown-item"
                                  onClick={closeMobileMenu}
                                >
                                  <i className="fa fa-user me-2"></i>My Profile
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/tasks"
                                  className="dropdown-item"
                                  onClick={closeMobileMenu}
                                >
                                  <i className="fa fa-tasks me-2"></i>My Tasks
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/profile/edit"
                                  className="dropdown-item"
                                  onClick={closeMobileMenu}
                                >
                                  <i className="fa fa-edit me-2"></i>Edit Profile
                                </Link>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button
                                  onClick={handleLogout}
                                  className="dropdown-item"
                                  disabled={isLoggingOut}
                                  style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                                >
                                  {isLoggingOut ? (
                                    <>
                                      <LoadingSpinner size="small" />
                                      <span className="ms-2">Logging out...</span>
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa fa-sign-out-alt me-2"></i>Logout
                                    </>
                                  )}
                                </button>
                              </li>
                            </ul>
                          </li>
                        </>
                      ) : (
                        <>
                          {/* Login and Sign Up for unauthenticated users */}
                          <li className="nav-item">
                            <Link
                              to="/login"
                              className={`nav-link a-btn ltc-2869 ${location.pathname === '/login' ? 'active' : ''}`}
                              onClick={closeMobileMenu}
                            >
                              Login
                            </Link>
                          </li>
                          <li className="nav-item">
                            <Link
                              to="/signup"
                              className={`nav-link a-btn ltc-2869 ${location.pathname === '/signup' ? 'active' : ''}`}
                              onClick={closeMobileMenu}
                            >
                              Sign Up
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header