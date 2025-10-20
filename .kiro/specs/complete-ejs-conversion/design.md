# Design Document

## Overview

This design outlines the comprehensive conversion of all EJS templates to React components while maintaining 100% visual and functional parity. The conversion will transform a server-side rendered application to a client-side React application with identical user experience.

## Architecture

### Component Hierarchy

```
App.jsx (Main Layout)
├── Header.jsx (from navbar.ejs)
├── NotificationProvider.jsx (from flash.ejs)
├── Routes
│   ├── Home.jsx (from home.ejs)
│   ├── About.jsx (from about.ejs)
│   ├── Login.jsx (from login.ejs) ✓ COMPLETED
│   ├── Signup.jsx (from signup.ejs) ✓ COMPLETED
│   ├── Users.jsx (from user/index.ejs)
│   ├── Profile.jsx (from user/show.ejs)
│   ├── EditProfile.jsx (from user/edit.ejs)
│   ├── TaskList.jsx (from task/list.ejs)
│   ├── AddTask.jsx (from task/add.ejs)
│   ├── EditTask.jsx (from task/update.ejs)
│   └── NotFound.jsx (from error/notFound.ejs)
└── Footer.jsx (from footer.ejs)
```

### Layout System

The EJS boilerplate layout will be converted to:
- **App.jsx**: Main application wrapper with routing
- **Layout components**: Reusable layout wrappers for different page types
- **Conditional rendering**: Replace EJS conditionals with React conditional rendering

## Components and Interfaces

### 1. Layout Components

#### Header Component (from navbar.ejs)
- **Props**: `currentUser`, `isAuthenticated`
- **Features**: 
  - Responsive navigation with Bootstrap navbar
  - Conditional menu items based on authentication
  - Mobile hamburger menu
  - Brand logo and navigation links

#### Footer Component (from footer.ejs)
- **Props**: None
- **Features**:
  - Simple copyright footer
  - Consistent styling across all pages

#### NotificationProvider (from flash.ejs)
- **Props**: Integrates with existing NotificationContext
- **Features**:
  - Toast-style notifications
  - Success and error message display
  - Auto-dismiss functionality
  - Positioned at top-right

### 2. Page Components

#### Home Component (from home.ejs)
- **Props**: `users` (from API)
- **Features**:
  - Hero image section with lazy loading
  - Inspirational quotes with proper typography
  - User showcase section with stats
  - Responsive grid layout
  - Image optimization with WebP support

#### Users Component (from user/index.ejs)
- **Props**: `users`, `pagination`
- **Features**:
  - User grid with avatar cards
  - Pagination controls
  - Search and filtering
  - Responsive card layout

#### Profile Component (from user/show.ejs)
- **Props**: `user`, `tasks`, `stats`, `pagination`, `currentUser`
- **Features**:
  - User avatar and info display
  - Productivity statistics dashboard
  - Task cards with status indicators
  - Action buttons (Edit, Delete, Add Task)
  - Conditional rendering based on ownership

#### EditProfile Component (from user/edit.ejs)
- **Props**: `user`, `currentUser`
- **Features**:
  - Avatar selection gallery
  - Form validation
  - Profile update functionality
  - Password change option

### 3. Task Components

#### TaskList Component (from task/list.ejs)
- **Props**: `tasks`, `user`, `pagination`
- **Features**:
  - Task cards with dynamic status
  - Priority indicators
  - Action buttons (Edit, Delete, Complete)
  - Pagination
  - Empty state handling

#### AddTask Component (from task/add.ejs)
- **Props**: `currentUser`
- **Features**:
  - Task creation form
  - Priority selection with radio buttons
  - Date picker with quick date options
  - Tag management system
  - Form validation

#### EditTask Component (from task/update.ejs)
- **Props**: `task`, `currentUser`
- **Features**:
  - Pre-populated task edit form
  - Same functionality as AddTask
  - Update and cancel options

## Data Models

### User Model Interface
```typescript
interface User {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  avatar: string;
  created_at: Date;
  stats?: {
    completed: number;
    failed: number;
    ongoing: number;
    completionRate: number;
    streak: number;
    avgTime: string;
  };
}
```

### Task Model Interface
```typescript
interface Task {
  _id: string;
  title: string;
  description?: string;
  due: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'in-progress' | 'completed' | 'failed';
  tags?: string[];
  user: string;
  created_at: Date;
  updated_at: Date;
}
```

### Pagination Interface
```typescript
interface Pagination {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}
```

## Error Handling

### Client-Side Error Boundaries
- Wrap major components in ErrorBoundary
- Display user-friendly error messages
- Log errors for debugging

### Form Validation
- Real-time validation matching EJS patterns
- Bootstrap validation classes
- Custom validation messages

### API Error Handling
- Network error handling
- Authentication error redirects
- User-friendly error notifications

## Testing Strategy

### Visual Regression Testing
- Screenshot comparison between EJS and React versions
- Cross-browser testing
- Responsive design testing

### Functional Testing
- Form submission testing
- Navigation testing
- Authentication flow testing
- CRUD operations testing

### Component Testing
- Unit tests for individual components
- Integration tests for component interactions
- Mock API responses for testing

## Performance Considerations

### Image Optimization
- Lazy loading implementation
- WebP format support with fallbacks
- Responsive image sizing

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Bundle size optimization

### Caching Strategy
- API response caching
- Static asset caching
- Service worker implementation

## Migration Strategy

### Phase 1: Core Layout (Tasks 15.1-15.3)
- Convert boilerplate layout to App.jsx
- Convert navbar.ejs to Header.jsx
- Convert footer.ejs to Footer.jsx
- Implement flash message system

### Phase 2: Main Pages (Tasks 15.4-15.7)
- Convert home.ejs to Home.jsx
- Convert about.ejs to About.jsx
- Convert user/index.ejs to Users.jsx
- Convert error/notFound.ejs to NotFound.jsx

### Phase 3: User Management (Tasks 15.8-15.9)
- Convert user/show.ejs to Profile.jsx
- Convert user/edit.ejs to EditProfile.jsx

### Phase 4: Task Management (Tasks 15.10-15.12)
- Convert task/list.ejs to TaskList.jsx
- Convert task/add.ejs to AddTask.jsx
- Convert task/update.ejs to EditTask.jsx

### Phase 5: Integration & Testing (Tasks 15.13-15.15)
- Integrate all components with existing services
- Comprehensive testing and bug fixes
- Performance optimization and final polish