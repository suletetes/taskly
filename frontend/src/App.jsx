import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { AnalyticsProvider } from './context/AnalyticsContext'
import { ErrorProvider } from './context/ErrorContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Preloader from './components/common/Preloader'
import ScrollToTop from './components/common/ScrollToTop'
import LoadingSpinner from './components/common/LoadingSpinner'
import DevelopmentNotice from './components/common/DevelopmentNotice'
import ProtectedRoute, { GuestRoute } from './components/auth/ProtectedRoute'
import { registerServiceWorker, trackWebVitals, preloadCriticalResources } from './utils/performanceOptimization'
import { preloadCriticalResources as seoPreload } from './utils/seoOptimization'
import { initColorFixes } from './utils/colorFix'
import './App.css'
import './styles/colorFixes.css'
import './styles/textVisibility.css'

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))
const Signup = React.lazy(() => import('./pages/Signup'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Users = React.lazy(() => import('./pages/Users'))
const About = React.lazy(() => import('./pages/About'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'))
const TaskDashboard = React.lazy(() => import('./pages/TaskDashboard'))
const AddTask = React.lazy(() => import('./pages/AddTask'))
const EditTask = React.lazy(() => import('./pages/EditTask'))

// Layout wrapper component to handle conditional rendering
const AppLayout = ({ children }) => {
  return (
    <div className="page-container">
      {children}
      <ScrollToTop />
    </div>
  )
}

function App() {
  useEffect(() => {
    // Initialize performance optimizations
    registerServiceWorker()
    trackWebVitals()
    preloadCriticalResources()
    seoPreload()

    // Fix color contrast issues
    initColorFixes()
  }, [])

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ErrorProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <ErrorBoundary fallback={(error, retry) => (
                  <div className="app-error">
                    <h1>Application Error</h1>
                    <p>The application encountered an error and needs to be restarted.</p>
                    <button onClick={retry} className="btn btn-primary">
                      Restart Application
                    </button>
                  </div>
                )}>
                  <Preloader />
                  <DevelopmentNotice />
                  <AppLayout>
                    <header>
                      <Header />
                    </header>

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
                        <Suspense fallback={
                          <div className="page-loading">
                            <LoadingSpinner size="large" message="Loading page..." />
                          </div>
                        }>
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
                            <Route
                              path="/tasks"
                              element={
                                <ProtectedRoute>
                                  <TaskDashboard />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/tasks/new"
                              element={
                                <ProtectedRoute>
                                  <AddTask />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/tasks/:taskId/edit"
                              element={
                                <ProtectedRoute>
                                  <EditTask />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/unauthorized" element={<Unauthorized />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </ErrorBoundary>
                    </main>

                    <Footer />
                  </AppLayout>
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
