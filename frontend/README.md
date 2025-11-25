# Taskly Frontend

Modern React + Vite application for Taskly task management platform. Features real-time task management, team collaboration, and comprehensive analytics with a beautiful, responsive UI.

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env

# Start development server
npm run dev
```

Application will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Taskly
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_TEAMS=true
VITE_ENABLE_PROJECTS=true
VITE_ENABLE_CALENDAR=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DARK_MODE=true

# Limits
VITE_MAX_TEAM_MEMBERS=50
VITE_MAX_PROJECT_MEMBERS=20
VITE_MAX_PROJECTS_PER_TEAM=10

# UI Configuration
VITE_ITEMS_PER_PAGE=10
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Performance
VITE_API_TIMEOUT=10000
VITE_ENABLE_SERVICE_WORKER=false
VITE_ENABLE_PWA=true
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── common/          # Common components (Button, Card, etc.)
│   │   ├── tasks/           # Task-related components
│   │   ├── projects/        # Project-related components
│   │   ├── teams/           # Team-related components
│   │   ├── invitations/     # Invitation components
│   │   └── layout/          # Layout components
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── TaskContext.jsx
│   │   ├── TeamContext.jsx
│   │   ├── ProjectContext.jsx
│   │   ├── NotificationContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ErrorContext.jsx
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Teams.jsx
│   │   ├── Projects.jsx
│   │   ├── Settings.jsx
│   │   └── NotFound.jsx
│   ├── services/            # API services
│   │   ├── api.js           # Axios instance
│   │   ├── authService.js
│   │   ├── taskService.js
│   │   ├── teamService.js
│   │   └── projectService.js
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── package.json
```

## Technology Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Axios**: HTTP client
- **React Router**: Client-side routing
- **React Context API**: State management
- **Heroicons**: Icon library

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:host        # Start dev server accessible from network

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage

# Linting
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues

# Type Checking
npm run type-check      # Check TypeScript types
```

## Authentication

### Login Flow
1. User enters credentials on login page
2. Credentials sent to backend API
3. Backend validates and creates session
4. Session cookie stored in browser
5. User redirected to dashboard
6. Subsequent requests include session cookie

### Protected Routes
Routes requiring authentication:
- `/dashboard`
- `/teams`
- `/projects`
- `/settings`
- `/profile`

Public routes:
- `/`
- `/login`
- `/signup`
- `/about`

### Session Management
- Sessions stored in browser cookies
- Automatic logout on 401 Unauthorized
- Session persisted across page refreshes
- Logout clears session and redirects to login

## Key Features

### Task Management
- Create, edit, delete tasks
- Set priority levels (low, medium, high)
- Assign due dates
- Add tags and labels
- Filter and sort tasks
- Track task status

### Team Collaboration
- Create and manage teams
- Invite team members
- Manage member roles (owner, admin, member)
- View team statistics
- Team-based task organization

### User Profiles
- Customize profile information
- Upload avatar
- View productivity statistics
- Track completion rates
- View activity history

### Analytics & Insights
- Task completion statistics
- Team productivity metrics
- Project progress tracking
- Activity timeline
- Performance insights

### Responsive Design
- Mobile-first approach
- Tablet and desktop support
- Dark/light mode toggle
- Smooth animations
- Accessible UI components

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom color scheme
- Responsive design utilities
- Dark mode support

### Color Scheme
```javascript
// Primary colors
primary-50 to primary-900

// Secondary colors
secondary-50 to secondary-900

// Status colors
green (success)
red (error)
yellow (warning)
blue (info)
```

### Dark Mode
Toggle dark mode in settings or use system preference.

## State Management

### Context Providers
- **AuthContext**: User authentication state
- **TaskContext**: Task management state
- **TeamContext**: Team management state
- **ProjectContext**: Project management state
- **NotificationContext**: Notifications
- **ThemeContext**: Theme (dark/light mode)
- **ErrorContext**: Error handling

### Usage Example
```javascript
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { user, login, logout } = useAuth()
  
  return (
    <div>
      {user && <p>Welcome, {user.fullname}</p>}
    </div>
  )
}
```

## API Integration

### API Client Setup
```javascript
// frontend/src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Include cookies
})
```

### Making Requests
```javascript
import api from '../services/api'

// GET request
const response = await api.get('/tasks')

// POST request
const response = await api.post('/tasks', { title: 'New Task' })

// PUT request
const response = await api.put('/tasks/123', { title: 'Updated' })

// DELETE request
await api.delete('/tasks/123')
```

## Testing

### Run Tests
```bash
npm run test
```

### Test Files
- `src/**/*.test.jsx` - Component tests
- `src/**/*.spec.jsx` - Integration tests

### Testing Libraries
- Vitest: Test runner
- React Testing Library: Component testing
- Playwright: E2E testing

## Production Build

### Build for Production
```bash
npm run build
```

Creates optimized build in `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Deploy to Production
```bash
# Build
npm run build

# Deploy dist/ folder to hosting service
# Examples: Vercel, Netlify, AWS S3, etc.
```

## Security

- **HTTPS Only**: Use HTTPS in production
- **Secure Cookies**: Session cookies are httpOnly
- **CORS**: Configured for backend origin
- **Input Validation**: All user inputs validated
- **XSS Protection**: React escapes content by default
- **CSRF Protection**: Session-based authentication

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### 401 Unauthorized Errors
- Ensure you're logged in
- Check browser cookies (DevTools → Application → Cookies)
- Clear browser cache and try again
- Restart dev server

### 403 Forbidden Errors
- You don't have permission to access this resource
- Check your team/project role
- Contact team owner for permission changes

### API Connection Issues
- Verify backend is running on port 5000
- Check VITE_API_URL in .env
- Check browser console for CORS errors
- Verify network connectivity

### Styling Issues
- Clear browser cache
- Restart dev server
- Check Tailwind CSS configuration
- Verify CSS imports

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

## Performance Optimization

- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: React.lazy for route components
- **Image Optimization**: Responsive images
- **Caching**: Browser caching for static assets
- **Minification**: Automatic in production build

## Recent Fixes

- Fixed session cookie handling for cross-origin requests
- Separated 401 and 403 error handling
- Improved API client to use Vite proxy in development
- Enhanced error messages and user feedback

See [LATEST_FIXES.md](../LATEST_FIXES.md) for details.

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)

## License

MIT License - see LICENSE file for details

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
