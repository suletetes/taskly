import express from 'express';
const router = express.Router();

import {
    createTask,
    getTaskById,
    getTasksByUser,
    updateTask,
    completeTask,
    deleteTask,
    updateTaskStatus
} from '../controllers/taskController.js';

import { authenticateToken } from '../middleware/auth.js';
import {
    validateTaskId,
    validateUserId,
    validateCreateTask,
    validateUpdateTask,
    validateTaskQuery,
    validateTaskStatus
} from '../middleware/validation.js';

/**
 * @route   POST /api/tasks
 * @desc    Create a new task for current user
 * @access  Private
 */
router.post('/',
    authenticateToken,
    validateCreateTask,
    createTask
);

/**
 * @route   GET /api/tasks/:taskId
 * @desc    Get task by ID
 * @access  Private
 */
router.get('/:taskId',
    authenticateToken,
    validateTaskId,
    getTaskById
);

/**
 * @route   PUT /api/tasks/:taskId
 * @desc    Update task by ID
 * @access  Private
 */
router.put('/:taskId',
    authenticateToken,
    validateTaskId,
    validateUpdateTask,
    updateTask
);

/**
 * @route   PATCH /api/tasks/:taskId/complete
 * @desc    Mark task as completed
 * @access  Private
 */
router.patch('/:taskId/complete',
    authenticateToken,
    validateTaskId,
    completeTask
);

/**
 * @route   DELETE /api/tasks/:taskId
 * @desc    Delete task by ID
 * @access  Private
 */
router.delete('/:taskId',
    authenticateToken,
    validateTaskId,
    deleteTask
);

/**
 * @route   PATCH /api/tasks/:taskId/status
 * @desc    Update task status for real-time updates
 * @access  Private
 */
router.patch('/:taskId/status',
    authenticateToken,
    validateTaskId,
    validateTaskStatus,
    updateTaskStatus
);

export default router;