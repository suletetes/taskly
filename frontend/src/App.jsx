import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { AnalyticsProvider } from './context/AnalyticsContext'
import { ErrorProvider } from './context/ErrorContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import ProtectedRoute, { GuestRoute } from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Users from './pages/Users'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ErrorProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <Router>
                <ErrorBoundary fallback={(error, retry) => (
                  <div className="app-error">
                    <h1>Application Error</h1>
                    <p>The application encountered an error and needs to be restarted.</p>
                    <button onClick={retry} className="btn btn-primary">
                      Restart Application
                    </button>
                  </div>
                )}>
                  <div className="app">
                    <Header />
                    <main className="main-content">
                      <ErrorBoundary fallback={(error, retry) => (
                        <div className="route-error">
                          <h2>Page Error</h2>
                          <p>This page encountered an error. Please try again.</p>
                          <button onClick={retry} className="btn btn-primary">
                            Retry
                          </button>
                        </div>
                      )}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route
                            path="/login"
                            element={
                              <GuestRoute>
                                <Login />
                              </GuestRoute>
                            }
                          />
                          <Route
                            path="/signup"
                            element={
                              <GuestRoute>
                                <Signup />
                              </GuestRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/users"
                            element={
                              <ProtectedRoute>
                                <Users />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/about" element={<About />} />
                          <Route path="/unauthorized" element={<Unauthorized />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </ErrorBoundary>
                    </main>
                    <Footer />
                  </div>
                </ErrorBoundary>
              </Router>
            </AnalyticsProvider>
          </AuthProvider>
        </ErrorProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
