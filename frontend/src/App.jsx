import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navigation from './components/layout/Navigation';
import { LoadingSpinner, LoadingOverlay } from './components/ui/LoadingStates';
import ErrorBoundary from './components/error/ErrorBoundary';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { preloadCriticalComponents } from './utils/lazyImports';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorProvider } from './context/ErrorContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AppStateProvider } from './context/AppStateContext';

// Lazy-loaded pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const Projects = React.lazy(() => import('./pages/Projects'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme } = useTheme();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    enabled: true,
    onShortcut: (action, event) => {
      // Handle custom shortcut actions here
      switch (action) {
        case 'openGlobalSearch':
          setShowGlobalSearch(true);
          return true; // Handled
        default:
          return false; // Not handled, use default
      }
    }
  });
  
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K for global search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Apply theme class to document and preload components
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    // Preload critical components on idle
    preloadCriticalComponents();
  }, [theme]);
  
  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-task':
        // Open task creation modal
        console.log('Opening task creation modal');
        break;
      case 'notifications':
        // Open notifications panel
        console.log('Opening notifications');
        break;
      case 'search':
        setShowGlobalSearch(true);
        break;
      default:
        console.log('Unknown quick action:', action);
    }
  };
  
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <Navigation 
          onSearchOpen={() => setShowGlobalSearch(true)}
          onQuickAction={handleQuickAction}
        />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAction={handleQuickAction}
      />
      
      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top padding for mobile header */}
        <div className="lg:hidden h-16" />
        
        {/* Page Content */}
        <div className="p-4 lg:p-8 pb-20 lg:pb-8">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <PageTransition>
                {children}
              </PageTransition>
            </Suspense>
          </ErrorBoundary>
        </div>
        
        {/* Bottom padding for mobile navigation */}
        <div className="lg:hidden h-20" />
      </main>
      
      {/* Global Search */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
      
      {/* Offline Status */}
      <div className="fixed bottom-4 right-4 z-40">
        <OfflineStatus />
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-secondary-800)',
            color: 'var(--color-secondary-100)',
            border: '1px solid var(--color-secondary-700)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success-500)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error-500)',
              secondary: 'white',
            },
          },
        }}
      />
      
      {/* Onboarding Flow */}
      <OnboardingFlow />
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ErrorProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <NotificationProvider>
                <AppStateProvider>
                  <Router>
                  <div className="App">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={
                        <Suspense fallback={<LoadingSpinner size="lg" />}>
                          <Login />
                        </Suspense>
                      } />
                      <Route path="/signup" element={
                        <Suspense fallback={<LoadingSpinner size="lg" />}>
                          <Signup />
                        </Suspense>
                      } />
                      
                      {/* Protected Routes */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Dashboard />
                          </AppLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Dashboard />
                          </AppLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/tasks" element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Tasks />
                          </AppLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/projects" element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Projects />
                          </AppLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/analytics" element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Analytics />
                          </AppLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Profile />
                          </AppLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Settings />
                          </AppLayout>
                        </ProtectedRoute>
                      } />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </Router>
                </AppStateProvider>
              </NotificationProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </ErrorProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;