# 🚀 Taskly Deployment Guide

This guide covers various deployment strategies for the Taskly application, from development to production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: v16 or higher
- **MongoDB**: v4.4 or higher
- **npm/yarn**: Latest version
- **PM2**: For production process management
- **Docker**: For containerized deployment (optional)

### External Services
- **Cloudinary Account**: For image upload functionality
- **MongoDB Atlas**: For cloud database (optional)
- **Domain & SSL Certificate**: For production deployment

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `.env` file in the `backend` directory:

```env
# Application Environment
NODE_ENV=production
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/taskly_production
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/taskly_production

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
SESSION_SECRET=your-super-secure-session-secret-key-change-this-in-production

# Client URLs
CLIENT_URL=https://your-production-domain.com
PRODUCTION_CLIENT_URL=https://your-production-domain.com
CORS_ORIGIN=https://your-production-domain.com

# Cloudinary Configuration (Required)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Performance & Security
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
SESSION_MAX_AGE=604800000
```

### Frontend Environment Variables

Create `.env` file in the `frontend` directory:

```env
# Production Environment
VITE_NODE_ENV=production

# API Configuration
VITE_API_URL=https://your-api-domain.com/api

# App Configuration
VITE_APP_NAME=Taskly
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Professional Task Management Application

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Security
VITE_ENABLE_HTTPS=true

# Performance
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_PWA=true
```

## 🔨 Development Deployment

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/suletetes/taskly.git
   cd taskly
   npm run install-deps
   ```

2. **Configure Environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Update .env with your values
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Update .env with your values
   ```

3. **Start Services**
   ```bash
   # Start MongoDB
   sudo systemctl start mongod
   
   # Seed database (optional)
   cd backend && npm run seed
   
   # Start development servers
   cd .. && npm run dev
   ```

## 🏭 Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/suletetes/taskly.git
cd taskly

# Install dependencies
npm run install-deps

# Configure environment
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env
# Update with production values

# Build frontend
cd frontend && npm run build

# Start backend with PM2
cd ../backend
pm2 start ecosystem.config.js --env production

# Configure PM2 startup
pm2 startup
pm2 save
```

#### 3. Nginx Configuration

Create `/etc/nginx/sites-available/taskly`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (React App)
    location / {
        root /path/to/taskly/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/taskly /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start application
cd backend
npm run pm2:start

# Monitor application
pm2 monit

# View logs
pm2 logs taskly-backend

# Restart application
pm2 restart taskly-backend

# Stop application
pm2 stop taskly-backend
```

## 🐳 Docker Deployment

### Single Container Deployment

#### Backend Container
```bash
cd backend
docker build -t taskly-backend .
docker run -d -p 5000:5000 --name taskly-backend taskly-backend
```

#### Frontend Container
```bash
cd frontend
docker build -t taskly-frontend .
docker run -d -p 3000:80 --name taskly-frontend taskly-frontend
```

### Docker Compose Deployment

1. **Configure Environment**
   ```bash
   cp .env.docker .env
   # Update .env with your values
   ```

2. **Start Services**
   ```bash
   # Build and start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

3. **Production with Nginx**
   ```bash
   # Start with production profile
   docker-compose --profile production up -d
   ```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Select appropriate instance type (t3.medium recommended)
   - Configure security groups (ports 22, 80, 443)

2. **Deploy Application**
   ```bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Follow traditional server deployment steps
   ```

#### Using AWS ECS (Docker)

1. **Create ECR Repositories**
   ```bash
   aws ecr create-repository --repository-name taskly-backend
   aws ecr create-repository --repository-name taskly-frontend
   ```

2. **Build and Push Images**
   ```bash
   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and push backend
   cd backend
   docker build -t taskly-backend .
   docker tag taskly-backend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/taskly-backend:latest
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/taskly-backend:latest
   
   # Build and push frontend
   cd ../frontend
   docker build -t taskly-frontend .
   docker tag taskly-frontend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/taskly-frontend:latest
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/taskly-frontend:latest
   ```

### Heroku Deployment

#### Backend Deployment
```bash
# Install Heroku CLI
# Create Heroku app
heroku create taskly-backend-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
# ... other environment variables

# Deploy
git subtree push --prefix backend heroku main
```

#### Frontend Deployment (Netlify)

1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-app.herokuapp.com/api
   VITE_APP_NAME=Taskly
   ```

### Vercel Deployment

#### Frontend Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

## 📊 Monitoring & Maintenance

### Health Monitoring

#### Backend Health Check
```bash
curl -f http://your-domain.com/api/health
```

#### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Process status
pm2 status

# Application logs
pm2 logs taskly-backend

# Error logs only
pm2 logs taskly-backend --err

# Restart application
pm2 restart taskly-backend
```

### Log Management

#### Application Logs
```bash
# Backend logs
tail -f backend/logs/combined.log

# PM2 logs
pm2 logs --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### Log Rotation
```bash
# Configure logrotate for application logs
sudo nano /etc/logrotate.d/taskly

# Add configuration:
/path/to/taskly/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 taskly taskly
}
```

### Database Maintenance

#### MongoDB Backup
```bash
# Create backup
mongodump --db taskly_production --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db taskly_production /backup/20231201/taskly_production
```

#### Automated Backup Script
```bash
#!/bin/bash
# backup-mongodb.sh

BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="taskly_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"
```

### Security Updates

#### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd taskly
npm audit
npm audit fix

# Update PM2
pm2 update
```

#### SSL Certificate Renewal (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

### Performance Optimization

#### Database Indexing
```javascript
// Connect to MongoDB and create indexes
db.users.createIndex({ "username": 1 })
db.users.createIndex({ "email": 1 })
db.tasks.createIndex({ "user": 1 })
db.tasks.createIndex({ "status": 1 })
db.tasks.createIndex({ "due": 1 })
```

#### Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching
location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs taskly-backend

# Restart application
pm2 restart taskly-backend
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection
mongo --eval "db.adminCommand('ismaster')"
```

#### High Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart application if needed
pm2 restart taskly-backend
```

### Emergency Procedures

#### Application Rollback
```bash
# Stop current version
pm2 stop taskly-backend

# Deploy previous version
git checkout previous-stable-tag
npm install
pm2 start ecosystem.config.js
```

#### Database Recovery
```bash
# Stop application
pm2 stop taskly-backend

# Restore from backup
mongorestore --db taskly_production --drop /backup/latest/taskly_production

# Start application
pm2 start taskly-backend
```

## 📞 Support

For deployment issues:
- Check application logs: `pm2 logs`
- Review system logs: `journalctl -u nginx`
- Monitor resources: `htop`, `df -h`
- Contact support with error details

---

This deployment guide covers most common scenarios. For specific cloud providers or custom setups, refer to their respective documentation.