# Taskly - Modern Task Management Application

A full-stack task management application designed for individuals and teams, featuring real-time synchronization, team collaboration, and comprehensive productivity analytics.

![Taskly](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### Core Functionality
- ✅ **Task Management**: Create, edit, delete, and organize tasks with priorities, due dates, and tags
- 👥 **Team Collaboration**: Multi-user teams with role-based permissions
- 📊 **Project Management**: Organize tasks into projects with progress tracking
- 📅 **Calendar View**: Visualize tasks in calendar format
- 🔔 **Notifications**: Real-time in-app notifications
- 📈 **Analytics**: Productivity tracking, completion rates, and statistics
- 🌓 **Dark Mode**: Full dark mode support
- 📱 **Responsive Design**: Mobile-first approach, works on all devices

### Technical Features
- 🔐 **Secure Authentication**: Session-based authentication with secure cookies
- ☁️ **Cloud Storage**: Cloudinary integration for file uploads
- 📧 **Email Service**: Transactional emails via Resend
- 🚀 **Real-time Updates**: Instant synchronization across devices
- 🎨 **Modern UI**: Clean interface with smooth animations
- 🔍 **Advanced Search**: Search and filter tasks, users, and teams

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Icons**: Heroicons

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: express-session
- **File Storage**: Cloudinary
- **Email**: Resend
- **Security**: helmet, cors, rate limiting

## Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB 5.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/taskly.git
cd taskly
```

2. **Install dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskly
SESSION_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@yourdomain.com
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start MongoDB**

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

5. **Seed the database** (optional)

```bash
cd backend
npm run seed
```

6. **Start the application**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

7. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Default Test Accounts

After seeding, you can login with:

```
Email: john@example.com
Password: password123

Email: sarah@example.com
Password: password123
```

## Project Structure

```
taskly/
├── backend/                 # Backend API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── seeds/             # Database seeders
│   ├── tests/             # Test files
│   └── server.js          # Entry point
│
├── frontend/               # Frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── vite.config.js     # Vite configuration
│
├── docker-compose.yml      # Docker configuration
└── README.md              # This file
```

## API Documentation

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Tasks

```http
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/complete
```

### Projects

```http
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/tasks
GET    /api/projects/:id/stats
```

### Teams

```http
GET    /api/teams
POST   /api/teams
GET    /api/teams/:id
PUT    /api/teams/:id
DELETE /api/teams/:id
POST   /api/teams/:id/invite
GET    /api/teams/:id/members
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Database Management

```bash
# Seed database
cd backend
npm run seed

# Clear database
npm run db:clear

# Create indexes
npm run db:indexes
```

## Production Deployment

### Backend Deployment

See [backend/README.md](./backend/README.md) for detailed backend deployment instructions.

**Quick steps:**

1. Set production environment variables
2. Use MongoDB Atlas or managed MongoDB
3. Deploy to your hosting platform (Heroku, AWS, DigitalOcean, etc.)
4. Use PM2 for process management
5. Configure Nginx as reverse proxy

### Frontend Deployment

See [frontend/README.md](./frontend/README.md) for detailed frontend deployment instructions.

**Quick steps:**

1. Build the application: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Or serve with Nginx/Apache
4. Configure environment variables
5. Set up SSL certificate

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/taskly` |
| `SESSION_SECRET` | Session secret key | `random-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourdomain.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret` |
| `RESEND_API_KEY` | Resend API key | `re_xxx` |
| `EMAIL_FROM` | From email address | `noreply@yourdomain.com` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.yourdomain.com/api` |

## Security

- Session-based authentication with secure cookies
- Password hashing with bcrypt
- CORS protection
- Rate limiting on API endpoints
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure headers with helmet
- Environment variable protection

## Performance

- Code splitting and lazy loading
- Image optimization with Cloudinary
- Database indexing
- API response caching
- Gzip compression
- CDN for static assets
- Optimized bundle size

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Database connection failed**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

**CORS errors**
- Check `FRONTEND_URL` in backend `.env`
- Verify frontend is running on correct port
- Check CORS configuration in `server.js`

**Session not persisting**
- Verify `SESSION_SECRET` is set
- Check MongoDB connection for session store
- Clear browser cookies

**File upload fails**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper MIME types

For more troubleshooting, see:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- Cloudinary for file storage
- Resend for email service
- All open-source contributors

## Support

For support, email support@yourdomain.com or open an issue on GitHub.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Advanced analytics dashboard
- [ ] Integration with third-party tools (Slack, Google Calendar)
- [ ] AI-powered task suggestions
- [ ] Voice commands
- [ ] Offline mode with sync

## Authors

- Your Name - Initial work

## Links

- [Documentation](./docs)
- [API Documentation](./API_DOCUMENTATION.md)
- [Changelog](./CHANGELOG.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
