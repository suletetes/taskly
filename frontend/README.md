# Taskly Frontend

This is the React frontend for the Taskly productivity application, built with Vite for fast development and optimized builds.

## Technologies Used

- **React 18** - Modern UI library with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **Bootstrap** - Responsive CSS framework
- **React Context** - State management for authentication and notifications

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication-related components
│   ├── common/         # Shared components (Header, Footer, etc.)
│   ├── dashboard/      # Dashboard and analytics components
│   ├── task/           # Task management components
│   └── user/           # User profile and management components
├── pages/              # Page-level components
├── services/           # API service functions
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and helpers
├── styles/             # CSS and styling files
└── test/               # Test setup and utilities
```

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Taskly
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests with Vitest
- `npm run lint` - Run ESLint for code quality

## Features

- **Responsive Design** - Mobile-first approach with Bootstrap
- **Authentication** - JWT-based login and registration
- **Task Management** - Create, edit, complete, and delete tasks
- **User Profiles** - Profile management and settings
- **Real-time Updates** - Dynamic UI updates without page refresh
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Loading States** - Skeleton loaders and spinners for better UX

## API Integration

The frontend communicates with the Express API backend through:
- Axios HTTP client with interceptors for authentication
- Centralized API service functions in `/src/services/`
- Error handling and response transformation
- Automatic token management for authenticated requests

## Testing

Tests are written using:
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **Jest DOM** - Additional DOM matchers

Run tests with:
```bash
npm run test
```
