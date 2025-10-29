# 🚀 Taskly - Professional Task Management Application

A modern, full-stack task management application built with React and Node.js, featuring real-time updates, beautiful UI, and comprehensive user management.

![Taskly Banner](./showCaseImages/home%201.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Taskly is a comprehensive task management solution designed for individuals and teams who need a reliable, intuitive platform to organize their work. Built with modern web technologies, it offers a seamless experience across all devices with real-time synchronization and advanced productivity features.

### 🌟 Key Highlights

- **Modern Architecture**: React frontend with Node.js/Express backend
- **Real-time Updates**: Instant synchronization across devices
- **Secure Authentication**: Session-based auth with comprehensive security
- **Cloud Storage**: Cloudinary integration for image management
- **Production Ready**: Comprehensive deployment configurations
- **Mobile Responsive**: Perfect experience on all screen sizes

## ✨ Features

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface with gradient themes and animations
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme adaptation with system preference detection
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Professional UI**: Modern card-based layouts with shadows and gradients

### 📝 Task Management
- **Smart Task Creation**: Quick add with intelligent defaults
- **Priority Levels**: Visual priority indicators (Low, Medium, High)
- **Due Date Management**: Calendar integration with reminders
- **Tag System**: Organize tasks with custom tags
- **Status Tracking**: In Progress, Completed, Failed states
- **Bulk Operations**: Select and manage multiple tasks

### 👤 User Management
- **Complete Profile System**: Avatar selection, personal information, and bio
- **Password Management**: Secure password change with validation
- **Productivity Analytics**: Real-time completion rates, streaks, and insights
- **Interactive Dashboard**: Beautiful charts and statistics
- **Public Profiles**: Share achievements and progress
- **User Directory**: Discover and connect with other users

### 🔒 Security & Performance
- **Session-based Authentication**: Secure login with automatic refresh
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Rate Limiting**: Protection against abuse and attacks
- **Performance Monitoring**: Real-time performance tracking
- **Error Handling**: Comprehensive error boundaries and logging

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API communication
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **Cloudinary** - Image upload and management

### Security & DevOps
- **Helmet.js** - Security headers
- **bcrypt** - Password hashing
- **express-rate-limit** - Rate limiting
- **PM2** - Process management
- **Docker** - Containerization support

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/suletetes/taskly.git
cd taskly
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
# Start MongoDB service
sudo systemctl start mongod

# Seed the database (optional)
npm run seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Copy environment file
cp .env.example .env

# Start the frontend development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

### 5. Default Login Credentials
```
Username: mikejohnson
Password: password123

Username: janesmith
Password: password123
```

## 📁 Project Structure

```
taskly/
├── backend/                 # Node.js/Express API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── seeds/              # Database seeders
│   ├── utils/              # Utility functions
│   ├── .env.example        # Environment template
│   ├── ecosystem.config.js # PM2 configuration
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS files
│   │   └── utils/          # Utility functions
│   ├── .env.example        # Environment template
│   └── vite.config.js      # Vite configuration
├── docs/                   # Documentation
├── tests/                  # Test files
└── README.md               # This file
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/signup` | User registration | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/users/public` | Get public users | No |
| GET | `/api/users/:id` | Get user by ID | No |
| GET | `/api/users/:id/tasks` | Get user tasks | Yes |
| GET | `/api/users/:id/stats` | Get user statistics | Yes |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get user tasks | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| GET | `/api/tasks/:id` | Get task by ID | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| PATCH | `/api/tasks/:id/status` | Update task status | Yes |

### Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/avatar` | Upload avatar | Yes |
| DELETE | `/api/upload/avatar` | Delete avatar | Yes |

For detailed API documentation, see [Backend README](./backend/README.md).

## 🚀 Deployment

### Production Environment Setup

#### Backend Deployment

1. **Environment Configuration**
   ```bash
   cp backend/.env.production backend/.env
   # Update with production values
   ```

2. **Using PM2 (Recommended)**
   ```bash
   cd backend
   npm install -g pm2
   npm run pm2:start
   ```

3. **Using Docker**
   ```bash
   cd backend
   docker build -t taskly-backend .
   docker run -p 5000:5000 taskly-backend
   ```

#### Frontend Deployment

1. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   # Build command: npm run build
   # Publish directory: dist
   ```

3. **Deploy to Vercel**
   ```bash
   # Build command: npm run build
   # Output directory: dist
   ```

4. **Deploy to AWS S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskly_production
JWT_SECRET=your-super-secure-secret
CLIENT_URL=https://your-domain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Taskly
VITE_ENABLE_ANALYTICS=true
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run unit tests
npm run test:coverage       # Run with coverage
npm run lint               # Run ESLint
```

### Frontend Testing
```bash
cd frontend
npm test                    # Run unit tests
npm run test:e2e           # Run E2E tests
npm run lint               # Run ESLint
```

### Integration Testing
```bash
# Run full integration tests
npm run test:integration
```

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB (gzipped)
- **API Response Time**: < 200ms average

## 🔒 Security Features

- **Authentication**: Session-based with secure cookies
- **Authorization**: Role-based access control
- **Data Validation**: Comprehensive input validation
- **Rate Limiting**: Protection against abuse
- **CORS**: Configured for production domains
- **Helmet.js**: Security headers
- **Data Sanitization**: MongoDB injection prevention
- **HTTPS**: Enforced in production

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Use ESLint and Prettier for formatting
- Follow React and Node.js best practices
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Maintain test coverage above 80%

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community for the robust backend framework
- MongoDB team for the flexible database
- Bootstrap team for the responsive UI components
- All contributors and beta testers

## 📞 Support

For support, questions, or feature requests:

- 📧 Email: support@taskly.com
- 🐛 Issues: [GitHub Issues](https://github.com/suletetes/taskly/issues)
- 📖 Documentation: [Wiki](https://github.com/suletetes/taskly/wiki)
- 💬 Discussions: [GitHub Discussions](https://github.com/suletetes/taskly/discussions)

## 🗺️ Roadmap

### v1.1.0 (Coming Soon)
- [ ] Team collaboration features
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### v1.2.0 (Future)
- [ ] Integration with calendar apps
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] API webhooks

---

## 📸 Demo Gallery

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

<div align="center">
  <p>Made with ❤️ by the Taskly Team</p>
  <p>
    <a href="#taskly---professional-task-management-application">Back to Top</a>
  </p>
</div>