import { lazy } from 'react';

// Lazy load pages with better error handling
const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = lazy(importFn);
  
  // Add display name for better debugging
  LazyComponent.displayName = importFn.toString().match(/import\(['"`](.+)['"`]\)/)?.[1] || 'LazyComponent';
  
  return LazyComponent;
};

// Core pages
export const Dashboard = createLazyComponent(() => import('../pages/Dashboard'));
export const Tasks = createLazyComponent(() => import('../pages/Tasks'));
export const Projects = createLazyComponent(() => import('../pages/Projects'));
export const Analytics = createLazyComponent(() => import('../pages/Analytics'));
export const Profile = createLazyComponent(() => import('../pages/Profile'));
export const Settings = createLazyComponent(() => import('../pages/Settings'));

// Auth pages
export const Login = createLazyComponent(() => import('../pages/Login'));
export const Signup = createLazyComponent(() => import('../pages/Signup'));

// Feature-specific components (loaded on demand)
export const TaskBoard = createLazyComponent(() => import('../components/tasks/TaskBoard'));
export const TaskCalendar = createLazyComponent(() => import('../components/tasks/TaskCalendar'));
export const TaskTimeline = createLazyComponent(() => import('../components/tasks/TaskTimeline'));

export const ProjectBoard = createLazyComponent(() => import('../components/projects/ProjectBoard'));
export const ProjectGantt = createLazyComponent(() => import('../components/projects/ProjectGantt'));

export const AnalyticsDashboard = createLazyComponent(() => import('../components/analytics/AnalyticsDashboard'));
export const ReportsBuilder = createLazyComponent(() => import('../components/analytics/ReportsBuilder'));

export const TeamManagement = createLazyComponent(() => import('../components/teams/TeamManagement'));
export const TeamChat = createLazyComponent(() => import('../components/teams/TeamChat'));

// Modal components (loaded when needed)
export const TaskCreateModal = createLazyComponent(() => import('../components/modals/TaskCreateModal'));
export const TaskEditModal = createLazyComponent(() => import('../components/modals/TaskEditModal'));
export const ProjectCreateModal = createLazyComponent(() => import('../components/modals/ProjectCreateModal'));
export const SettingsModal = createLazyComponent(() => import('../components/modals/SettingsModal'));

// Advanced features (loaded on demand)
export const IntegrationSettings = createLazyComponent(() => import('../components/settings/IntegrationSettings'));
export const NotificationSettings = createLazyComponent(() => import('../components/settings/NotificationSettings'));
export const SecuritySettings = createLazyComponent(() => import('../components/settings/SecuritySettings'));

export const EmailIntegration = createLazyComponent(() => import('../components/email/EmailIntegration'));
export const CalendarIntegration = createLazyComponent(() => import('../components/calendar/CalendarIntegration'));
export const WebhookSettings = createLazyComponent(() => import('../components/webhooks/WebhookSettings'));

// Gamification components
export const AchievementCenter = createLazyComponent(() => import('../components/gamification/AchievementCenter'));
export const LeaderBoard = createLazyComponent(() => import('../components/gamification/LeaderBoard'));
export const ChallengeCenter = createLazyComponent(() => import('../components/gamification/ChallengeCenter'));

// Admin components (loaded only for admin users)
export const AdminDashboard = createLazyComponent(() => import('../components/admin/AdminDashboard'));
export const UserManagement = createLazyComponent(() => import('../components/admin/UserManagement'));
export const SystemSettings = createLazyComponent(() => import('../components/admin/SystemSettings'));

// Utility function to preload components
export const preloadComponent = (componentImport) => {
  if (typeof componentImport === 'function') {
    componentImport();
  }
};

// Preload critical components on idle
export const preloadCriticalComponents = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadComponent(() => import('../components/tasks/TaskBoard'));
      preloadComponent(() => import('../components/modals/TaskCreateModal'));
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      preloadComponent(() => import('../components/tasks/TaskBoard'));
      preloadComponent(() => import('../components/modals/TaskCreateModal'));
    }, 2000);
  }
};

// Route-based preloading
export const preloadRouteComponents = (route) => {
  const preloadMap = {
    '/tasks': [
      () => import('../components/tasks/TaskBoard'),
      () => import('../components/tasks/TaskList'),
      () => import('../components/modals/TaskCreateModal')
    ],
    '/projects': [
      () => import('../components/projects/ProjectBoard'),
      () => import('../components/modals/ProjectCreateModal')
    ],
    '/analytics': [
      () => import('../components/analytics/AnalyticsDashboard'),
      () => import('../components/analytics/ReportsBuilder')
    ],
    '/settings': [
      () => import('../components/settings/IntegrationSettings'),
      () => import('../components/settings/NotificationSettings')
    ]
  };

  const componentsToPreload = preloadMap[route];
  if (componentsToPreload) {
    componentsToPreload.forEach(preloadComponent);
  }
};

export default {
  Dashboard,
  Tasks,
  Projects,
  Analytics,
  Profile,
  Settings,
  Login,
  Signup,
  TaskBoard,
  TaskCalendar,
  TaskTimeline,
  ProjectBoard,
  ProjectGantt,
  AnalyticsDashboard,
  ReportsBuilder,
  TeamManagement,
  TeamChat,
  TaskCreateModal,
  TaskEditModal,
  ProjectCreateModal,
  SettingsModal,
  IntegrationSettings,
  NotificationSettings,
  SecuritySettings,
  EmailIntegration,
  CalendarIntegration,
  WebhookSettings,
  AchievementCenter,
  LeaderBoard,
  ChallengeCenter,
  AdminDashboard,
  UserManagement,
  SystemSettings,
  preloadComponent,
  preloadCriticalComponents,
  preloadRouteComponents
};