# Taskly Backend API

Modern task management API built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: Session-based authentication with secure cookies
- **Task Management**: Full CRUD operations with advanced filtering
- **Team Collaboration**: Multi-user teams with role-based permissions
- **Project Management**: Organize tasks into projects
- **Real-time Notifications**: In-app notification system
- **File Uploads**: Avatar uploads with Cloudinary integration
- **Email Service**: Transactional emails via Resend
- **Analytics**: Productivity tracking and statistics

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: express-session with connect-mongo
- **File Storage**: Cloudinary
- **Email**: Resend
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## Prerequisites

- Node.js 18 or higher
- MongoDB 5.0 or higher
- Cloudinary account (for file uploads)
- Resend account (for emails)

## Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/taskly

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
SESSION_NAME=taskly.sid
SESSION_MAX_AGE=604800000

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

Start MongoDB:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

This creates sample users, teams, projects, and tasks for testing.

## Running the Server

### Development Mode

```bash
npm run dev
```

Server runs on `http://localhost:5000` with auto-reload.

### Production Mode

```bash
npm start
```

## API Documentation

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via session cookies.

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "fullname": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Logout

```http
POST /api/auth/logout
```

### Tasks

#### Get All Tasks

```http
GET /api/tasks?page=1&limit=10&status=in-progress&priority=high
```

Returns tasks created by or assigned to the authenticated user.

#### Create Task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Write and submit the Q4 project proposal",
  "due": "2025-12-31T23:59:59.000Z",
  "priority": "high",
  "tags": ["work", "urgent"],
  "assignee": "user-id",
  "project": "project-id"
}
```

#### Update Task

```http
PUT /api/tasks/:taskId
Content-Type: application/json

{
  "title": "Updated title",
  "status": "completed"
}
```

#### Delete Task

```http
DELETE /api/tasks/:taskId
```

### Projects

#### Get Project Tasks

```http
GET /api/projects/:projectId/tasks?status=in-progress&priority=high
```

#### Get Project Statistics

```http
GET /api/projects/:projectId/stats
```

### Teams

#### Create Team

```http
POST /api/teams
Content-Type: application/json

{
  "name": "Development Team",
  "description": "Core development team"
}
```

#### Invite User to Team

```http
POST /api/teams/:teamId/invite
Content-Type: application/json

{
  "userId": "user-id",
  "role": "member"
}
```

### File Uploads

#### Upload Avatar

```http
POST /api/upload/avatar
Content-Type: multipart/form-data

avatar: [file]
```

## Project Structure

```
backend/
├── config/           # Configuration files
│   ├── cloudinary.js
│   ├── database.js
│   └── resend.js
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── taskController.js
│   ├── projectController.js
│   └── userController.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── models/          # Mongoose models
│   ├── User.js
│   ├── Task.js
│   ├── Project.js
│   └── Team.js
├── routes/          # API routes
│   ├── auth.js
│   ├── tasks.js
│   ├── projects.js
│   └── teams.js
├── utils/           # Utility functions
│   ├── response.js
│   └── permissions.js
├── seeds/           # Database seeders
├── tests/           # Test files
├── .env.example     # Environment template
├── server.js        # Entry point
└── package.json
```

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tasks.test.js

# Run with coverage
npm run test:coverage
```

## Production Deployment

### 1. Environment Variables

Set all required environment variables on your hosting platform:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskly
SESSION_SECRET=strong-random-secret-key
FRONTEND_URL=https://yourdomain.com
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@yourdomain.com
```

### 2. Database

Use MongoDB Atlas or a managed MongoDB service:

```bash
# Connection string format
mongodb+srv://username:password@cluster.mongodb.net/taskly?retryWrites=true&w=majority
```

### 3. Build and Deploy

```bash
# Install production dependencies
npm ci --production

# Start server
npm start
```

### 4. Process Management

Use PM2 for production:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart taskly-api
```

### 5. Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Session Secret**: Use a strong, random secret in production
3. **CORS**: Configure allowed origins properly
4. **Rate Limiting**: Adjust limits based on your needs
5. **HTTPS**: Always use HTTPS in production
6. **Database**: Use strong passwords and enable authentication
7. **Updates**: Keep dependencies updated

## Monitoring

### Health Check

```http
GET /api/health
```

Returns server status and database connection.

### Logs

Logs are written to:
- Console (development)
- PM2 logs (production)

## Troubleshooting

### Database Connection Issues

```bash
# Check MongoDB is running
mongosh

# Check connection string
echo $MONGODB_URI
```

### Session Issues

- Verify `SESSION_SECRET` is set
- Check MongoDB connection for session store
- Clear browser cookies

### File Upload Issues

- Verify Cloudinary credentials
- Check file size limits (default: 5MB)
- Ensure proper MIME types

### Email Issues

- Verify Resend API key
- Check email domain verification
- Review Resend dashboard for errors

## API Rate Limits

- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Upload endpoints**: 10 requests per 15 minutes per user

## Support

For issues and questions:
- Check existing documentation
- Review error logs
- Contact development team




