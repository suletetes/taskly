# Taskly MERN Stack Application

This is the MERN stack version of the Taskly application, featuring a React frontend and Express API backend.

## Project Structure

```
taskly/
├── backend/                 # Express API server
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── server.js           # Server entry point
│   ├── package.json        # Backend dependencies
│   └── .env                # Backend environment variables
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── test/           # Test setup
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── .env                # Frontend environment variables
└── package.json            # Root package.json with scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install-deps
```

2. Set up environment variables:
   - Copy `backend/.env` and update with your MongoDB URI and JWT secret
   - Copy `frontend/.env` and update API URL if needed

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:5000
- Frontend React app on http://localhost:3000

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm run test` - Run tests for both frontend and backend
- `npm start` - Start the backend in production mode

## API Endpoints

The backend provides RESTful API endpoints:

- `GET /api/health` - Health check endpoint
- Authentication endpoints (to be implemented)
- User management endpoints (to be implemented)
- Task management endpoints (to be implemented)

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskly
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Taskly
```

## Development

The application uses:
- **Backend**: Express.js, MongoDB, Mongoose, JWT authentication
- **Frontend**: React 18, Vite, React Router, Axios
- **Development**: Concurrently for running both servers, Nodemon for backend hot reload

## Testing

- Backend: Jest and Supertest for API testing
- Frontend: Vitest and React Testing Library for component testing