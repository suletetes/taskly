import React, { useState } from 'react'
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

  const renderAuthenticatedNav = () => (
    <>
      <li><Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMobileMenu}>Home</Link></li>
      <li><Link to="/users" className={location.pathname === '/users' ? 'active' : ''} onClick={closeMobileMenu}>Users</Link></li>
      <li><Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''} onClick={closeMobileMenu}>Profile</Link></li>
      <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMobileMenu}>About</Link></li>
      <li className="user-menu">
        <span className="user-greeting">
          Hello, {user?.firstName || user?.email || 'User'}
        </span>
        <button 
          onClick={handleLogout} 
          className="logout-button"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <LoadingSpinner size="small" />
              Logging out...
            </>
          ) : (
            'Logout'
          )}
        </button>
      </li>
    </>
  )

  const renderGuestNav = () => (
    <>
      <li><Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMobileMenu}>Home</Link></li>
      <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMobileMenu}>About</Link></li>
      <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''} onClick={closeMobileMenu}>Login</Link></li>
      <li><Link to="/signup" className={location.pathname === '/signup' ? 'active' : ''} onClick={closeMobileMenu}>Sign Up</Link></li>
    </>
  )

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          <h2>Taskly</h2>
        </Link>
        
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        {isLoading ? (
          <div className="nav-loading">
            <LoadingSpinner size="small" />
          </div>
        ) : (
          <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {isAuthenticated ? renderAuthenticatedNav() : renderGuestNav()}
          </ul>
        )}
      </nav>
    </header>
  )
}

export default Header