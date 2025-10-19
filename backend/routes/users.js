const express = require('express');
const router = express.Router();

const { 
    getUserById, 
    getAllUsers, 
    updateUser, 
    deleteUser,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteCurrentUser
} = require('../controllers/userController');

const { authenticateToken } = require('../middleware/auth');
const { 
    validateUpdateUser, 
    validateUserId, 
    validateUserQuery,
    validateUpdateProfile,
    validateChangePassword,
    validateUploadAvatar,
    validateCreateTask,
    validateTaskQuery
} = require('../middleware/validation');

const {
    createTask,
    getTasksByUser,
    getUserProductivityStats,
    getTaskStatusSummary
} = require('../controllers/taskController');

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and search
 * @access  Private
 */
router.get('/', 
    authenticateToken, 
    validateUserQuery, 
    getAllUsers
);

// Profile management routes (for current user) - must come before parameterized routes

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', 
    authenticateToken, 
    validateUpdateProfile, 
    updateProfile
);

/**
 * @route   PUT /api/users/profile/password
 * @desc    Change current user's password
 * @access  Private
 */
router.put('/profile/password', 
    authenticateToken, 
    validateChangePassword, 
    changePassword
);

/**
 * @route   PUT /api/users/profile/avatar
 * @desc    Update current user's avatar
 * @access  Private
 */
router.put('/profile/avatar', 
    authenticateToken, 
    validateUploadAvatar, 
    uploadAvatar
);

/**
 * @route   DELETE /api/users/profile
 * @desc    Delete current user's account
 * @access  Private
 */
router.delete('/profile', 
    authenticateToken, 
    deleteCurrentUser
);

// Parameterized routes (must come after specific routes)

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID with tasks and statistics
 * @access  Private
 */
router.get('/:userId', 
    authenticateToken, 
    validateUserId, 
    getUserById
);

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user profile
 * @access  Private (own profile or admin)
 */
router.put('/:userId', 
    authenticateToken, 
    validateUserId, 
    validateUpdateUser, 
    updateUser
);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user account
 * @access  Private (own account or admin)
 */
router.delete('/:userId', 
    authenticateToken, 
    validateUserId, 
    deleteUser
);

// Task management routes for specific users

/**
 * @route   GET /api/users/:userId/tasks
 * @desc    Get all tasks for a specific user with filtering and sorting
 * @access  Private
 */
router.get('/:userId/tasks',
    authenticateToken,
    validateUserId,
    validateTaskQuery,
    getTasksByUser
);

/**
 * @route   POST /api/users/:userId/tasks
 * @desc    Create a new task for a specific user
 * @access  Private
 */
router.post('/:userId/tasks',
    authenticateToken,
    validateUserId,
    validateCreateTask,
    createTask
);

/**
 * @route   GET /api/users/:userId/stats
 * @desc    Get productivity statistics for a specific user
 * @access  Private
 */
router.get('/:userId/stats',
    authenticateToken,
    validateUserId,
    getUserProductivityStats
);

/**
 * @route   GET /api/users/:userId/tasks/summary
 * @desc    Get task status summary for a specific user
 * @access  Private
 */
router.get('/:userId/tasks/summary',
    authenticateToken,
    validateUserId,
    getTaskStatusSummary
);

module.exports = router;