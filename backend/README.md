# Taskly Backend API

A robust Node.js/Express backend API for the Taskly task management application with MongoDB, session-based authentication, and comprehensive security features.

## 🚀 Features

- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **Session-based Authentication** with Passport.js
- **Image Upload** with Cloudinary integration
- **Security Middleware** (Helmet, Rate Limiting, CORS)
- **Data Validation** and sanitization
- **Comprehensive Error Handling**
- **Production-ready** with PM2 support

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskly/backend
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
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskly
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:5000` with hot reloading.

### Production Mode
```bash
npm run prod
```

### Using PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
npm run pm2:start

# View logs
npm run pm2:logs

# Restart the application
npm run pm2:restart

# Stop the application
npm run pm2:stop
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-api-domain.com/api`

### Authentication Endpoints

#### POST `/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "fullname": "string",
      "email": "string",
      "avatar": "string",
      "stats": {
        "completed": 0,
        "ongoing": 0,
        "failed": 0,
        "completionRate": 0,
        "streak": 0,
        "avgTime": "0 hrs"
      }
    }
  },
  "message": "Login successful"
}
```

#### POST `/auth/signup`
Register a new user account.

#### GET `/auth/me`
Get current authenticated user profile.

#### POST `/auth/logout`
Logout user and destroy session.

### User Endpoints

#### GET `/users`
Get paginated list of users (authenticated).

#### GET `/users/public`
Get paginated list of users (public access).

#### GET `/users/:userId`
Get user profile by ID.

#### GET `/users/:userId/tasks`
Get user's tasks with filtering and pagination.

#### GET `/users/:userId/stats`
Get user's productivity statistics.

### Task Endpoints

#### GET `/tasks`
Get authenticated user's tasks.

#### POST `/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "due": "2024-12-31",
  "priority": "low|medium|high",
  "tags": ["string"]
}
```

#### GET `/tasks/:taskId`
Get task by ID.

#### PUT `/tasks/:taskId`
Update task by ID.

#### DELETE `/tasks/:taskId`
Delete task by ID.

#### PATCH `/tasks/:taskId/status`
Update task status.

### Upload Endpoints

#### POST `/upload/avatar`
Upload user avatar image to Cloudinary.

**Request:** Multipart form data with `avatar` file field.

#### DELETE `/upload/avatar`
Delete user avatar image.

### Health Check

#### GET `/health`
Get API health status.

## 🗄️ Database Schema

### User Model
```javascript
{
  fullname: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String,
  avatarPublicId: String,
  stats: {
    completed: Number,
    failed: Number,
    ongoing: Number,
    completionRate: Number,
    streak: Number,
    avgTime: String
  },
  created_at: Date,
  updated_at: Date
}
```

### Task Model
```javascript
{
  title: String,
  description: String,
  due: Date,
  priority: String (low|medium|high),
  status: String (in-progress|completed|failed),
  tags: [String],
  labels: [String],
  user: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevent abuse
- **CORS** - Cross-origin resource sharing
- **Data Sanitization** - MongoDB injection prevention
- **Session Security** - HttpOnly, Secure cookies
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Comprehensive request validation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📦 Production Deployment

### Environment Setup
1. Copy `.env.production` and update with production values
2. Set `NODE_ENV=production`
3. Configure MongoDB connection string
4. Set up Cloudinary credentials
5. Configure CORS origins

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### PM2 Deployment
```bash
# Production deployment with PM2
NODE_ENV=production pm2 start ecosystem.config.js
```

## 📊 Monitoring

- **Health Check**: `/api/health`
- **PM2 Monitoring**: `pm2 monit`
- **Logs**: `pm2 logs taskly-backend`
- **Performance**: Built-in Express performance monitoring

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | No |
| `PORT` | Server port | 5000 | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `CLIENT_URL` | Frontend URL | - | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the logs for error details

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete task management API
- Session-based authentication
- Cloudinary image upload
- Production-ready configuration