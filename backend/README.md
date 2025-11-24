# Taskly Backend API

Express.js REST API server for Taskly task management platform. Provides authentication, task management, team collaboration, and analytics endpoints.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Server will run on `http://localhost:5000`

## 📋 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/taskly

# Session
SESSION_SECRET=your-secret-key-change-in-production
SESSION_MAX_AGE=604800000

# Server
NODE_ENV=development
PORT=5000

# File Upload (Cloudinary)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Resend)
RESEND_API_KEY=your-resend-key

# CORS
CORS_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Team Settings
TEAM_MAX_MEMBERS=50
```

## 📁 Project Structure

```
backend/
├── config/              # Configuration files
│   ├── passport.js      # Passport authentication setup
│   └── resend.js        # Email service configuration
├── controllers/         # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── taskController.js
│   ├── teamController.js
│   ├── projectController.js
│   ├── invitationController.js
│   ├── notificationController.js
│   └── searchController.js
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication middleware
│   ├── validation.js    # Input validation
│   ├── security.js      # Security middleware
│   └── errorHandler.js  # Error handling
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Task.js
│   ├── Team.js
│   ├── Project.js
│   ├── Invitation.js
│   └── Notification.js
├── routes/              # API routes
│   ├── auth.js
│   ├── users.js
│   ├── tasks.js
│   ├── teams.js
│   ├── projects.js
│   ├── invitations.js
│   ├── notifications.js
│   ├── search.js
│   ├── calendar.js
│   └── upload.js
├── utils/               # Utility functions
│   ├── response.js      # Response formatting
│   ├── password.js      # Password hashing
│   ├── permissions.js   # Permission checks
│   ├── emailTemplates.js
│   └── dataPopulation.js
├── seeds/               # Database seed data
│   ├── seed.js
│   ├── userSeed.js
│   └── comprehensiveSeed.js
├── tests/               # Test files
│   ├── integration.test.js
│   ├── email.test.js
│   └── upload.test.js
├── server.js            # Express app setup
└── package.json
```

## 🔐 Authentication

Taskly uses session-based authentication with Passport.js:

### Login Flow
1. User sends credentials to `POST /api/auth/login`
2. Passport validates credentials against database
3. Session is created and stored in MongoDB
4. Session cookie is sent to client
5. Client includes cookie in subsequent requests

### Protected Routes
All routes except `/auth/register`, `/auth/login`, and `/auth/logout` require authentication.

Use the `auth` middleware to protect routes:
```javascript
router.get('/protected', auth, controller);
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account
- `POST /api/users/:id/avatar` - Upload avatar
- `GET /api/users/:id/stats` - Get user statistics

### Tasks
- `GET /api/tasks` - Get all tasks (paginated, filtered)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status

### Teams
- `GET /api/teams` - Get all user's teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `GET /api/teams/:id/stats` - Get team statistics
- `GET /api/teams/:id/members` - Get team members
- `GET /api/teams/:id/invitations` - Get team invitations
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:userId` - Remove member from team

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/stats` - Get project statistics

### Invitations
- `POST /api/teams/:teamId/invitations` - Send team invitation
- `GET /api/users/invitations` - Get user's invitations
- `POST /api/invitations/:id/accept` - Accept invitation
- `POST /api/invitations/:id/deny` - Deny invitation
- `DELETE /api/invitations/:id` - Cancel invitation

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Search
- `GET /api/search/users` - Search users
- `GET /api/teams/:teamId/search-users` - Search team users

## 🗄️ Database Models

### User
```javascript
{
  fullname: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String (URL),
  bio: String,
  jobTitle: String,
  company: String,
  timezone: String,
  isAdmin: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  title: String,
  description: String,
  due: Date,
  priority: String (low/medium/high),
  status: String (in-progress/completed/failed),
  user: ObjectId (User),
  project: ObjectId (Project),
  tags: [String],
  labels: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Team
```javascript
{
  name: String,
  description: String,
  owner: ObjectId (User),
  members: [{
    user: ObjectId (User),
    role: String (owner/admin/member),
    joinedAt: Date
  }],
  projects: [ObjectId (Project)],
  inviteCode: String,
  isPrivate: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/integration.test.js

# Run with coverage
npm test -- --coverage
```

### Test Files
- `tests/integration.test.js` - Integration tests
- `tests/email.test.js` - Email service tests
- `tests/upload.test.js` - File upload tests

## 🌱 Database Seeding

### Seed Sample Data
```bash
npm run seed
```

Creates:
- 5 sample users
- 3 sample teams
- 4 sample projects
- 30+ sample tasks

### Test Credentials
```
Username: johndoe
Password: password123
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **Session Management**: Secure session storage in MongoDB
- **CORS**: Configured for frontend origin
- **Rate Limiting**: Applied to auth endpoints
- **Input Validation**: Express-validator and Joi
- **Helmet**: Security headers
- **Sanitization**: Input sanitization middleware

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
NODE_ENV=production npm start
```

### Docker
```bash
docker build -t taskly-backend .
docker run -p 5000:5000 taskly-backend
```

## 📊 Performance

- **Database Indexing**: Indexes on frequently queried fields
- **Pagination**: All list endpoints support pagination
- **Caching**: Session caching in MongoDB
- **Lazy Loading**: Related data populated on demand

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify database credentials

### Authentication Issues
```
Error: Not authenticated
```
- Ensure session middleware is configured
- Check session storage in MongoDB
- Verify CORS credentials setting

### Email Service Error
```
Error: Failed to send email
```
- Check RESEND_API_KEY in .env
- Verify email template syntax
- Check email recipient address

## 📝 API Response Format

All responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## 🔄 Recent Fixes

- Fixed undefined variable in invitation acceptance
- Added team statistics endpoint
- Fixed session cookie handling for cross-origin requests
- Improved team member permission checks
- Enhanced error handling for 403 Forbidden responses

See [LATEST_FIXES.md](../LATEST_FIXES.md) for details.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
