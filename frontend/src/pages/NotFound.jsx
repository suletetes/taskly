import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <div className="not-found-actions">
            <Link to="/" className="home-button">
              Go Home
            </Link>
            <button onClick={() => window.history.back()} className="back-button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound