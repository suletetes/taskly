# Taskly - Modern Task Management Platform

A full-stack task management application designed for individuals and teams. Taskly provides real-time synchronization, comprehensive analytics, and an intuitive interface for organizing work efficiently.

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd taskly
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Configure environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed
```

4. **Start the application**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Project Structure

```
taskly/
├── backend/              # Express.js API server
│   ├── config/          # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── seeds/           # Database seed data
│   └── server.js        # Entry point
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Context providers
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.jsx      # Root component
│   └── vite.config.js   # Vite configuration
└── Readme.md           # This file
```

## Key Features

- **Task Management**: Create, edit, delete, and organize tasks with priority levels and due dates
- **Team Collaboration**: Invite team members, manage permissions, and collaborate in real-time
- **User Profiles**: Comprehensive user profiles with avatars, bio, and productivity analytics
- **Real-time Updates**: Session-based authentication with instant synchronization
- **Analytics & Insights**: Track productivity, completion rates, and team statistics
- **Responsive Design**: Mobile-first approach with dark/light mode support
- **Secure Authentication**: Session-based authentication with Passport.js

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (session-based)
- **Validation**: Express-validator, Joi
- **File Upload**: Cloudinary
- **Email**: Resend

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Heroicons

## Documentation

- [Backend README](./backend/README.md) - Backend setup and API documentation
- [Frontend README](./frontend/README.md) - Frontend setup and component documentation

## Authentication

Taskly uses session-based authentication with Passport.js:

1. User logs in with username/email and password
2. Session is created and stored in MongoDB
3. Session cookie is sent with each request
4. Frontend uses Vite proxy to ensure cookies are sent correctly

### Default Test Credentials
```
Username: johndoe
Password: password123
```

## Database

### Seeding Data
To populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- 5 sample users
- 3 sample teams
- 4 sample projects
- 30+ sample tasks

## Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Environment Variables

**Backend (.env)**
```
MONGODB_URI=mongodb://...
SESSION_SECRET=your-secret-key
NODE_ENV=production
PORT=5000
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=your-resend-key
```

**Frontend (.env)**
```
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Taskly
```

## Troubleshooting

### 401 Unauthorized Errors
- Ensure you're logged in
- Check that session cookies are being sent (browser DevTools → Application → Cookies)
- Verify CORS settings in backend/server.js

### 403 Forbidden Errors
- You don't have permission to access this resource
- Check your team/project role
- Contact team owner for permission changes

### Database Connection Issues
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure database credentials are correct

### Frontend Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Restart frontend dev server
- Check that backend is running on port 5000

## API Documentation

The API uses RESTful conventions with JSON responses. All protected endpoints require authentication.

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile

### Team Endpoints
- `GET /teams` - Get all user's teams
- `POST /teams` - Create new team
- `GET /teams/:id` - Get team details
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `GET /teams/:id/stats` - Get team statistics
- `GET /teams/:id/members` - Get team members
- `GET /teams/:id/invitations` - Get team invitations

### Task Endpoints
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

See [Backend README](./backend/README.md) for complete API documentation.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Contact the development team

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced filtering and search
- [ ] Custom workflows
- [ ] Integration with third-party tools
- [ ] Advanced reporting and analytics
- [ ] Offline mode support
- [ ] Real-time collaboration features

## Project Stats

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB
- **Authentication**: Passport.js (Session-based)
- **Deployment**: Docker-ready

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
