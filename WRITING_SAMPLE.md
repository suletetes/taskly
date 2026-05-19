# Taskly

So I built a task management app. Yeah, I know, another one. But hear me out.

I kept finding tutorials that show you how to make a todo list with like 50 lines of code and then say "congratulations, you built a full stack app." No you didn't. You built a form that talks to a database. Where's the auth? Where's the part where two people need different permissions? Where's the email that goes out when someone invites you to a team? That's the stuff I wanted to figure out, so I built Taskly to actually deal with all of it.

It's a team task manager. You sign up, make a team, invite people, create projects inside that team, then assign tasks to each other. There's a calendar, some analytics charts, notifications, the whole thing. Not groundbreaking as a product idea but the engineering goes deeper than most tutorial projects.

## The stack

I used React 18 on the frontend with Vite for bundling and Tailwind for styling. React Router v6 handles pages, Framer Motion does animations (probably overkill for a task app but I wanted to learn it), Chart.js for the analytics graphs, and Axios talks to the backend.

Backend is Express 5 running on Node with MongoDB through Mongoose. Auth is session-based, I used Passport.js for that. Validation goes through Joi. Security stuff: Helmet for headers, express-rate-limit so people can't brute force the login, and express-mongo-sanitize to stop NoSQL injection attempts.

Images go to Cloudinary (avatar uploads), emails go through Resend (team invitations), and in production the database lives on MongoDB Atlas. I run the Node process with PM2.

## Folder layout

```
taskly/
  backend/
    config/         # passport, cloudinary, email setup
    controllers/    # the actual logic for each route
    middleware/     # auth checks, validation, rate limiting
    models/         # User, Task, Team, Project, Notification, etc.
    routes/         # URL definitions
    seeds/          # scripts to populate test data
    tests/          # jest + supertest
    server.js
  frontend/
    src/
      components/   # buttons, modals, cards, that kind of thing
      context/      # React context for auth state, teams, projects
      hooks/        # useAuth, useTasks, etc.
      pages/        # one file per route basically
      services/     # axios wrapper functions
      utils/        # date formatting, helpers
```

## How to run it

You need Node 18 or newer. You also need MongoDB, either running on your machine or a connection string from Atlas.

```bash
git clone https://github.com/suletetes/taskly.git
cd taskly

cd backend
npm install
cd ../frontend
npm install
```

Now make a `.env` file in the backend folder. There's a `.env.example` you can copy:

```bash
cd backend
cp .env.example .env
```

You only really need four things in there to get started:

- `MONGODB_URI` — point this at your database
- `SESSION_SECRET` — mash your keyboard, any random string works
- `JWT_SECRET` — different random string
- `CLIENT_URL` — put `http://localhost:3000`

I also have Cloudinary and Resend config in there but those are optional. Without Cloudinary you can't upload profile pictures. Without Resend the invitation emails won't send. Everything else still works though.

Want some fake data to play with?

```bash
npm run seed
```

That gives you a few test users and some tasks so the app doesn't look empty.

Then open two terminals:

```bash
# first one
cd backend
npm run dev

# second one
cd frontend
npm run dev
```

Backend runs on port 5000, frontend on 3000.

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

I'm using Jest on the backend with mongodb-memory-server so tests don't need a real database. Frontend tests use Vitest.

---

# How the API works

I'm going to explain the API assuming you've used curl or Postman before. If you haven't, the short version is: you send HTTP requests to URLs and get JSON back.

## Logging in

The auth system uses cookies. Not tokens, not API keys. You hit the login endpoint, the server creates a session and sends back a cookie. After that, every request you make includes that cookie automatically (if you're in a browser) or manually (if you're using curl).

I chose sessions over JWT because the app is browser-first and I didn't want to write token refresh logic. The downside is scaling horizontally gets annoying since sessions live in the database. For a team of 20 people it genuinely does not matter though.

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "suleiman",
  "password": "yourpassword"
}
```

If it works you get:

```json
{
  "success": true,
  "data": {
    "_id": "6651a...",
    "fullname": "Suleiman Abdulkadir",
    "username": "suleiman",
    "email": "suleiman@example.com"
  },
  "message": "Login successful"
}
```

Wrong password? 401, with `"code": "INVALID_CREDENTIALS"`.

You can check if you're still logged in with `GET /api/auth/me`. It returns your user object or a 401 if the session is dead.

## Making tasks

```
POST /api/tasks
Content-Type: application/json

{
  "title": "Write API docs",
  "due": "2025-06-15",
  "priority": "high",
  "tags": ["documentation"]
}
```

Priority can be `low`, `medium`, or `high`. New tasks start as `in-progress` automatically. If the task belongs to a team project you can also pass `assignee`, `projectId`, and `teamId`.

Listing tasks:

```
GET /api/tasks?page=1&limit=10&status=in-progress&priority=high
```

Everything is paginated. The response always includes:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "perPage": 10
  }
}
```

There's also `sortBy`, `sortOrder`, and a `search` param that checks titles and descriptions and tags.

## Teams

Make one:

```
POST /api/teams
Content-Type: application/json

{
  "name": "Backend crew",
  "description": "People who touch the server code"
}
```

You're the owner now. Invite someone:

```
POST /api/teams/:teamId/invite
Content-Type: application/json

{
  "email": "colleague@company.com",
  "role": "member"
}
```

Roles: owner (full control), admin (can invite people and manage projects), member (can do tasks but can't change settings). The person you invite gets an email and a notification. They accept with `POST /api/invitations/:id/accept` or decline with `/deny`.

## Projects

They live inside teams and group tasks together.

```
POST /api/projects
Content-Type: application/json

{
  "name": "API v2 migration",
  "teamId": "team_id_here",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "priority": "high"
}
```

Hit `GET /api/projects/:id/stats` to see how many tasks are done vs in progress vs failed, plus a completion percentage.

## When things go wrong

Failed requests look like this:

```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND"
  }
}
```

The codes are self-explanatory: `USER_NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`, etc. Validation errors also have a `details` array telling you which fields are wrong.

Status codes are standard. 400 means you sent bad data, 401 means you're not logged in, 403 means you don't have permission, 404 means it doesn't exist, 429 means you're sending too many requests.

## Rate limiting

Login and register endpoints: 5 attempts per 15 minutes per IP address. I set this low on purpose because brute forcing passwords is the most obvious attack vector.

Everything else: 100 requests per 15 minutes. If you hit the wall you get a 429 and need to wait.

## All the endpoints in one place

| Action | Request |
|--------|---------|
| Sign up | POST /api/auth/register |
| Log in | POST /api/auth/login |
| Log out | POST /api/auth/logout |
| Check session | GET /api/auth/me |
| List tasks | GET /api/tasks |
| New task | POST /api/tasks |
| Edit task | PUT /api/tasks/:id |
| Complete task | PATCH /api/tasks/:id/status |
| Remove task | DELETE /api/tasks/:id |
| My teams | GET /api/teams |
| New team | POST /api/teams |
| Send invite | POST /api/teams/:id/invite |
| Projects | GET /api/projects |
| Notifications | GET /api/notifications |
| Find people | GET /api/search/users?q=name |

## Trying it with curl

```bash
# log in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"suleiman","password":"mypassword"}' \
  -c cookies.txt

# make a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Finish the docs","due":"2025-06-20","priority":"medium"}'

# get high priority stuff
curl http://localhost:5000/api/tasks?priority=high -b cookies.txt

# mark something done
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID_HERE/status \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"status":"completed"}'
```

The `-c` flag saves the cookie, `-b` sends it back. Forget the `-b` and you'll get 401s on everything after login. I made this mistake embarrassingly many times while testing.

## Trying it with JavaScript

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

await api.post('/auth/login', {
  username: 'suleiman',
  password: 'mypassword'
});

const { data } = await api.post('/tasks', {
  title: 'Ship the feature',
  due: '2025-07-01',
  priority: 'high',
  tags: ['release']
});

console.log(data.data._id);
```

`withCredentials: true` is the thing that trips people up. Without it Axios doesn't send cookies cross-origin and you get 401 on every request after login. I spent an entire evening on this the first time.

---

## What I'd do differently

Honestly, TypeScript. The project got to a size where I'm passing objects between files and I can't remember what shape they are without opening the model file. That's a sign.

I'd also reconsider sessions if I ever needed more than one server. JWT with short-lived access tokens and a refresh token would scale better, even though the implementation is more annoying on the client side.

Notifications should probably be WebSocket-based instead of polling. Right now the frontend checks for new notifications every 30 seconds which is wasteful.

And I wish I'd written more integration tests early on. I have decent unit test coverage but not enough tests that exercise the full request-response cycle for common workflows.

## About this

I built this project over a few months while teaching myself backend development. The repo has about 10 route files, 7 Mongoose models, and a full React frontend. I wrote everything in it.

There's a more complete API reference in the repo too (`API_DOCUMENTATION.md`) that documents every single field and response code. This doc is the condensed version, the one I'd send to someone who just wants to start making requests without reading through hundreds of lines of specs.

## License

MIT
