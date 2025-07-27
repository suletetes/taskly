# Taskly

Taskly is a productivity web app for managing users and their tasks. It features user authentication, profile management, and CRUD operations for tasks.

## Features

- User registration, login, and logout
- User profile editing and deletion
- Avatar support
- Flash messages for feedback
- Task creation, editing, completion, and deletion
- Productivity stats on the home page
- Responsive EJS views with Bootstrap styling

## Technologies

- Node.js
- Express
- MongoDB (Mongoose)
- EJS templating
- Bootstrap
- Passport.js authentication

## Folder Structure

- `controllers/` — Route handlers for users and tasks
- `model/` — Mongoose models for User and Task
- `routes/` — Express route definitions
- `views/` — EJS templates for pages
- `public/` — Static assets (CSS, JS, images, fonts)
- `middleware.js` — Custom middleware
- `schemas.js` — Joi validation schemas
- `utils/` — Utility functions
- `app.js` — Main Express app

## Setup

1. **Clone the repository:**
   ```
   git clone <your-repo-url>
   cd taskly
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment variables:**
    - Create a `.env` file for MongoDB URI and session secret.

4. **Run the app:**
   ```
   npm start
   ```
   The app runs on `http://localhost:3000` by default.

## API Documentation

See below for main endpoints. All form routes render EJS views.

### Authentication

- `GET /signup` — Render sign-up form
- `POST /` — Register user (`fullname`, `username`, `email`, `password`, `avatar`)
- `GET /login` — Render login form
- `POST /login` — Authenticate (`username`, `password`)
- `GET /logout` — Log out

### User Management

- `GET /users` — List users (paginated)
- `GET /users/:userId` — User profile
- `GET /users/:userId/edit` — Edit user (auth required)
- `PUT /users/:userId` — Update user (auth required)
- `DELETE /users/:userId` — Delete user (auth required)

### User Tasks

- `GET /users/:userId/tasks/new` — Add task form (auth required)
- `POST /users/:userId/tasks` — Create task
- `GET /users/:userId/tasks/:taskId/edit` — Edit task form
- `PUT /users/:userId/tasks/:taskId` — Update task
- `POST /users/:userId/tasks/:taskId` — Mark task complete
- `DELETE /users/:userId/tasks/:taskId` — Delete task

### Home & Info

- `GET /` — Home page with stats
- `GET /about` — About page
