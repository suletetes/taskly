# Taskly

Taskly is a modern, full-featured productivity web app designed to help users manage tasks, track progress, and boost efficiency. Built with the MERN stack (MongoDB, Express.js, React, Node.js), Taskly offers a seamless experience for user and task management, complete with authentication, profile customization, and productivity analytics.

---

## Demo

![Home 1](showCaseImages/home%201.png)

---

## Demo Gallery

| Home |                  Home                  |                 Home                   |
|:----:|:--------------------------------------:|:--------------------------------------:|
| ![Home 1](showCaseImages/home%201.png) | ![Home 2](showCaseImages/home%202.png) | ![Home 3](showCaseImages/home%203.png) |

| Signup | Login | Profile |
|:------:|:-----:|:-------:|
| ![Signup](showCaseImages/signup.png) | ![Login](showCaseImages/login.png) | ![Profile](showCaseImages/profile.png) |

| All Users | Add Task | Edit User |
|:---------:|:--------:|:---------:|
| ![All Users](showCaseImages/all%20users.png) | ![Add Task](showCaseImages/add%20task.png) | ![Edit User](showCaseImages/edit%20user.png) |

---

## Features

- **User Authentication:** Secure JWT-based authentication with registration and login
- **Profile Management:** Edit user details, change passwords, and delete accounts
- **Task Management:** Create, edit, complete, and delete tasks with real-time updates
- **Productivity Analytics:** Visualize productivity statistics and task completion trends
- **Responsive UI:** Modern React components styled with Bootstrap
- **Real-time Feedback:** Toast notifications and loading states for better UX
- **Input Validation:** Client-side and server-side validation with Joi
- **RESTful API:** Clean and maintainable API architecture
- **Pagination:** Efficient data loading with pagination support
- **Error Handling:** Comprehensive error boundaries and user-friendly error messages
- **Security:** Protected routes, input sanitization, and secure password hashing

---

## Technologies Used

### Backend
- **Node.js** — JavaScript runtime
- **Express.js** — Web framework and API server
- **MongoDB & Mongoose** — Database and ODM
- **JWT** — Token-based authentication
- **Joi** — Input validation
- **Bcrypt** — Password hashing

### Frontend
- **React 18** — Modern UI library
- **Vite** — Fast build tool and development server
- **React Router** — Client-side routing
- **Axios** — HTTP client for API calls
- **Bootstrap** — Responsive design framework

---

## Project Structure

```
taskly/
├── backend/                 # Express API server
│   ├── controllers/         # Route controllers for API endpoints
│   ├── middleware/          # Authentication and validation middleware
│   ├── models/             # Mongoose models (User, Task)
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions and helpers
│   ├── tests/              # Backend test suites
│   ├── server.js           # Server entry point
│   ├── package.json        # Backend dependencies
│   └── .env                # Backend environment variables
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API service functions
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Frontend utility functions
│   │   └── styles/         # CSS and styling files
│   ├── public/             # Static assets (images, fonts, favicon)
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite build configuration
│   └── .env                # Frontend environment variables
└── package.json            # Root package.json with development scripts
```

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/taskly.git
   cd taskly
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables:**
   
   **Backend (.env in /backend directory):**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/taskly
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```
   
   **Frontend (.env in /frontend directory):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Taskly
   ```

4. **Seed the database (optional):**
   ```bash
   cd backend && npm run seed
   ```

5. **Start the development servers:**
   ```bash
   npm run dev
   ```
   This starts both the React frontend (http://localhost:3000) and Express API (http://localhost:5000)

### Available Scripts

- `npm run dev` — Start both frontend and backend in development mode
- `npm run server` — Start only the backend API server
- `npm run client` — Start only the frontend development server
- `npm run build` — Build the frontend for production
- `npm run test` — Run tests for both frontend and backend
- `npm start` — Start the backend in production mode

---

## API Documentation

The backend provides RESTful API endpoints for the React frontend:

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — User login
- `POST /api/auth/logout` — User logout
- `GET /api/auth/me` — Get current user profile

### User Management
- `GET /api/users` — Get all users (paginated)
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id` — Update user profile (auth required)
- `DELETE /api/users/:id` — Delete user account (auth required)
- `PUT /api/users/:id/password` — Change password (auth required)

### Task Management
- `GET /api/tasks` — Get user's tasks (auth required)
- `POST /api/tasks` — Create new task (auth required)
- `GET /api/tasks/:id` — Get task by ID (auth required)
- `PUT /api/tasks/:id` — Update task (auth required)
- `DELETE /api/tasks/:id` — Delete task (auth required)
- `PATCH /api/tasks/:id/status` — Update task status (auth required)

### Analytics
- `GET /api/analytics/productivity` — Get productivity statistics (auth required)

---

## Development

### Architecture Overview
Taskly follows a modern MERN stack architecture with clear separation of concerns:

- **Frontend (React):** Handles user interface, routing, and state management
- **Backend (Express API):** Provides RESTful endpoints and business logic
- **Database (MongoDB):** Stores user data, tasks, and application state
- **Authentication:** JWT-based stateless authentication

### Development Workflow
1. Backend API development with Express and MongoDB
2. Frontend component development with React and Vite
3. Integration testing between frontend and backend
4. Responsive design implementation with Bootstrap

### Testing
- **Backend:** Jest and Supertest for API endpoint testing
- **Frontend:** Vitest and React Testing Library for component testing
- **Integration:** End-to-end testing for complete user workflows

## Deployment

### Production Build
```bash
# Build frontend for production
npm run build

# Start backend in production mode
npm start
```

### Environment Configuration
Ensure production environment variables are properly configured:
- Set `NODE_ENV=production`
- Use secure JWT secrets
- Configure production MongoDB URI
- Set appropriate CORS origins

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Taskly** — Your productivity, organized.
