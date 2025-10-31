const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Task = require('../../models/Task');
const Team = require('../../models/Team');
const Project = require('../../models/Project');

describe('Task Routes', () => {
  let user, token, team, project;

  beforeEach(async () => {
    // Create test user
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    token = user.generateAuthToken();

    // Create test team
    team = await Team.create({
      name: 'Test Team',
      description: 'A test team',
      owner: user._id,
      members: [{ user: user._id, role: 'admin' }]
    });

    // Create test project
    project = await Project.create({
      name: 'Test Project',
      description: 'A test project',
      team: team._id,
      owner: user._id,
      members: [{ user: user._id, role: 'admin' }]
    });
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task',
        project: project._id,
        assignee: user._id,
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(taskData.title);
      expect(response.body.data.task.description).toBe(taskData.description);
      expect(response.body.data.task.status).toBe('pending');
      expect(response.body.data.task.priority).toBe(taskData.priority);

      // Verify task was created in database
      const task = await Task.findById(response.body.data.task._id);
      expect(task).toBeDefined();
    });

    test('should require authentication', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task',
        project: project._id
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create([
        {
          title: 'Task 1',
          description: 'First task',
          project: project._id,
          assignee: user._id,
          creator: user._id,
          status: 'pending'
        },
        {
          title: 'Task 2',
          description: 'Second task',
          project: project._id,
          assignee: user._id,
          creator: user._id,
          status: 'in-progress'
        },
        {
          title: 'Task 3',
          description: 'Third task',
          project: project._id,
          assignee: user._id,
          creator: user._id,
          status: 'completed'
        }
      ]);
    });

    test('should get all tasks for user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('completed');
    });

    test('should filter tasks by project', async () => {
      const response = await request(app)
        .get(`/api/tasks?project=${project._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        description: 'A test task',
        project: project._id,
        assignee: user._id,
        creator: user._id
      });
    });

    test('should get task by id', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task._id).toBe(task._id.toString());
      expect(response.body.data.task.title).toBe(task.title);
    });

    test('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        description: 'A test task',
        project: project._id,
        assignee: user._id,
        creator: user._id
      });
    });

    test('should update task', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated description',
        status: 'in-progress',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(updateData.title);
      expect(response.body.data.task.description).toBe(updateData.description);
      expect(response.body.data.task.status).toBe(updateData.status);
      expect(response.body.data.task.priority).toBe(updateData.priority);

      // Verify in database
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.title).toBe(updateData.title);
    });

    test('should not update non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        description: 'A test task',
        project: project._id,
        assignee: user._id,
        creator: user._id
      });
    });

    test('should delete task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify task was deleted
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    test('should not delete non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});