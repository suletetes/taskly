# Taskly Frontend

A modern, responsive React application for task management with a beautiful UI, real-time updates, and comprehensive user experience features.

##  Features

- **Modern React** with Hooks and Context API
- **Responsive Design** with Bootstrap 5
- **Real-time Updates** with optimistic UI
- **Image Upload** with Cloudinary integration
- **Progressive Web App** (PWA) ready
- **Performance Optimized** with lazy loading
- **Accessibility** compliant (WCAG 2.1)
- **SEO Optimized** with meta tags

##  Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Modern web browser

##  Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskly/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Taskly
   VITE_APP_VERSION=1.0.0
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
The application will start on `http://localhost:3000` with hot reloading.

### Production Build
```bash
npm run build
```
Builds the app for production to the `dist` folder.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing.

##  Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── img/               # Images and icons
│   ├── fonts/             # Custom fonts
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Common UI components
│   │   ├── task/          # Task-related components
│   │   └── user/          # User-related components
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── styles/            # CSS and styling
│   ├── utils/             # Utility functions
│   └── App.jsx            # Main App component
├── .env                   # Environment variables
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies and scripts
```

##  UI Components

### Core Components

#### Header Navigation
- Responsive navigation bar
- User authentication status
- Mobile-friendly hamburger menu

#### Task Management
- Task creation and editing forms
- Priority selection with visual feedback
- Tag management system
- Status tracking and updates

#### User Profile
- Profile information display
- Avatar upload functionality
- Productivity statistics
- Task history and analytics

#### Common Components
- Loading spinners
- Error boundaries
- Safe image loading
- Document head management

##  Key Features

### Authentication
- Session-based authentication
- Automatic token refresh
- Protected route handling
- Graceful error handling

### Task Management
- Create, read, update, delete tasks
- Priority levels (Low, Medium, High)
- Due date management
- Tag system for organization
- Status tracking (In Progress, Completed, Failed)

### User Experience
- Responsive design for all devices
- Optimistic UI updates
- Real-time feedback
- Accessibility features
- Performance optimization

### Image Handling
- Avatar upload with Cloudinary
- Image optimization and resizing
- Fallback image system
- Lazy loading for performance

##  Pages and Routes

### Public Routes
- `/` - Home page with app overview
- `/users` - Public user directory
- `/users/:userId` - Public user profiles
- `/login` - User authentication
- `/signup` - User registration

### Protected Routes
- `/profile` - User dashboard and profile
- `/tasks/new` - Create new task
- `/tasks/:taskId/edit` - Edit existing task
- `/profile/edit` - Edit user profile

##  Security Features

- **HTTPS Enforcement** in production
- **Content Security Policy** headers
- **XSS Protection** with sanitized inputs
- **CSRF Protection** with session tokens
- **Secure Cookie Handling**
- **Input Validation** on all forms

##  Progressive Web App (PWA)

- **Service Worker** for offline functionality
- **App Manifest** for installation
- **Caching Strategy** for performance
- **Push Notifications** ready
- **Offline Support** for core features

##  Styling and Theming

### CSS Architecture
- **Bootstrap 5** for responsive grid and components
- **Custom CSS** for brand-specific styling
- **CSS Variables** for theming
- **Responsive Design** with mobile-first approach

### Color Scheme
- Primary: Modern blue gradient
- Secondary: Professional grays
- Success: Green for completed tasks
- Warning: Yellow for medium priority
- Danger: Red for high priority and errors

## Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

##  Build and Deployment

### Production Build
```bash
# Build for production
npm run build

# The build artifacts will be stored in the `dist/` directory
```

### Static Hosting (Recommended)

#### Netlify
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_API_URL=https://your-api-domain.com/api
```

#### Vercel
```bash
# Build command
npm run build

# Output directory
dist

# Environment variables
VITE_API_URL=https://your-api-domain.com/api
```

#### AWS S3 + CloudFront
```bash
# Build and sync to S3
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
```

### Docker Deployment
```dockerfile
# Multi-stage build
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ⚡ Performance Optimization

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy components

### Asset Optimization
- Image compression and optimization
- Font loading optimization
- CSS and JS minification
- Tree shaking for unused code

### Caching Strategy
- Browser caching for static assets
- Service worker caching
- API response caching
- Image caching with Cloudinary

##  Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | http://localhost:5000/api | Yes |
| `VITE_APP_NAME` | Application name | Taskly | No |
| `VITE_APP_VERSION` | Application version | 1.0.0 | No |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | false | No |
| `VITE_ENABLE_PWA` | Enable PWA features | true | No |

### Vite Configuration

The application uses Vite for fast development and optimized builds:

```javascript
// vite.config.js
export default {
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['bootstrap']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests (`npm run lint && npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React best practices
- Write meaningful commit messages
- Add JSDoc comments for complex functions

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review browser console for errors

##  Changelog

### v1.0.0
- Initial release
- Complete task management interface
- User authentication and profiles
- Responsive design
- PWA features
- Production-ready build

##  Acknowledgments

- React team for the amazing framework
- Bootstrap team for the UI components
- Vite team for the build tool
- All contributors and testers