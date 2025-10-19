const Task = require('../models/Task');
const User = require('../models/User');
const { calculateProductivityStats } = require('../utils/productivityStats');

/**
 * Create a new task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTask = async (req, res) => {
    try {
        const { userId } = req.params;
        const { title, due, priority, description, tags } = req.body;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only create tasks for themselves or admin can create for any
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to create tasks for this user',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Validate due date (server-side check)
        const dueDate = new Date(due);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Midnight of today

        if (dueDate < today) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Due date cannot be in the past',
                    code: 'INVALID_DUE_DATE'
                }
            });
        }

        // Create a new task and associate it with the user
        const newTask = new Task({
            title,
            due: dueDate,
            priority,
            description,
            tags,
            user: userId
        });

        await newTask.save();

        // Save the task to the user's list of tasks
        user.tasks.push(newTask._id);
        await user.save();

        res.status(201).json({
            success: true,
            data: {
                task: newTask
            },
            message: 'Task created successfully'
        });

    } catch (error) {
        console.error('Error creating task:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: error.errors
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to create task',
                code: 'TASK_CREATE_ERROR'
            }
        });
    }
};

/**
 * Get task by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId).populate('user', 'fullname username email');
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only view their own tasks or admin can view any
        if (req.user._id.toString() !== task.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to view this task',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Evaluate dynamic task status
        const now = new Date();
        const dueDate = task.due;
        let dynamicStatus = task.status;

        if (dynamicStatus === "in-progress") {
            dynamicStatus = dueDate < now ? "failed" : "in-progress";
        }

        const taskResponse = {
            ...task._doc,
            dynamicStatus
        };

        res.json({
            success: true,
            data: {
                task: taskResponse
            },
            message: 'Task retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve task',
                code: 'TASK_FETCH_ERROR'
            }
        });
    }
};

/**
 * Get all tasks for a specific user with filtering and sorting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTasksByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const perPage = parseInt(req.query.limit, 10) || 8;
        const status = req.query.status;
        const priority = req.query.priority;
        const sortBy = req.query.sortBy || 'due';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const search = req.query.search || '';

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only view their own tasks or admin can view any
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to view tasks for this user',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Build filter query
        let filterQuery = { user: userId };

        if (status) {
            filterQuery.status = status;
        }

        if (priority) {
            filterQuery.priority = priority;
        }

        if (search) {
            filterQuery.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Get total task count for pagination
        const totalTasks = await Task.countDocuments(filterQuery);
        const totalPages = Math.ceil(totalTasks / perPage);

        // Build sort object
        const sortObject = {};
        sortObject[sortBy] = sortOrder;

        // Fetch paginated tasks
        const rawTasks = await Task.find(filterQuery)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort(sortObject);

        // Evaluate dynamic task status for each task
        const tasks = rawTasks.map(task => {
            const now = new Date();
            const dueDate = task.due;
            let dynamicStatus = task.status;

            if (dynamicStatus === "in-progress") {
                dynamicStatus = dueDate < now ? "failed" : "in-progress";
            }

            return {
                ...task._doc,
                dynamicStatus
            };
        });

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalTasks,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    perPage
                },
                filters: {
                    status,
                    priority,
                    search,
                    sortBy,
                    sortOrder: sortOrder === 1 ? 'asc' : 'desc'
                }
            },
            message: 'Tasks retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve tasks',
                code: 'TASKS_FETCH_ERROR'
            }
        });
    }
};

/**
 * Update a task by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;

        // Find the task first to check authorization
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only update their own tasks or admin can update any
        if (req.user._id.toString() !== task.user.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to update this task',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Validate due date if being updated
        if (updates.due) {
            const dueDate = new Date(updates.due);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Due date cannot be in the past',
                        code: 'INVALID_DUE_DATE'
                    }
                });
            }
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId, 
            updates, 
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: {
                task: updatedTask
            },
            message: 'Task updated successfully'
        });

    } catch (error) {
        console.error('Error updating task:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: error.errors
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update task',
                code: 'TASK_UPDATE_ERROR'
            }
        });
    }
};

/**
 * Mark a task as completed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const completeTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Find the task first to check authorization
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only complete their own tasks or admin can complete any
        if (req.user._id.toString() !== task.user.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to complete this task',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Use the model method to complete the task
        await task.completeTask();

        res.json({
            success: true,
            data: {
                task
            },
            message: 'Task marked as completed'
        });

    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to complete task',
                code: 'TASK_COMPLETE_ERROR'
            }
        });
    }
};

/**
 * Delete a task by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Find the task first to check authorization and get user info
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only delete their own tasks or admin can delete any
        if (req.user._id.toString() !== task.user.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to delete this task',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Remove task from user's task list
        await User.findByIdAndUpdate(task.user, { $pull: { tasks: task._id } });

        // Delete the task
        await Task.findByIdAndDelete(taskId);

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to delete task',
                code: 'TASK_DELETE_ERROR'
            }
        });
    }
};

/**
 * Get productivity statistics for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserProductivityStats = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only view their own stats or admin can view any
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to view statistics for this user',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Calculate productivity stats
        const stats = await calculateProductivityStats(userId);

        res.json({
            success: true,
            data: {
                userId,
                stats
            },
            message: 'Productivity statistics retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching productivity stats:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve productivity statistics',
                code: 'STATS_FETCH_ERROR'
            }
        });
    }
};

/**
 * Update task status in real-time (for dynamic status updates)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        // Find the task first to check authorization
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only update their own tasks or admin can update any
        if (req.user._id.toString() !== task.user.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to update this task status',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Update task status
        task.status = status;
        await task.save();

        // Get updated productivity stats for real-time updates
        const stats = await calculateProductivityStats(task.user);

        res.json({
            success: true,
            data: {
                task,
                stats
            },
            message: 'Task status updated successfully'
        });

    } catch (error) {
        console.error('Error updating task status:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: error.errors
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update task status',
                code: 'TASK_STATUS_UPDATE_ERROR'
            }
        });
    }
};

/**
 * Get task status summary for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTaskStatusSummary = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                }
            });
        }

        // Check authorization - users can only view their own summary or admin can view any
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to view task summary for this user',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Get task counts by status
        const [inProgress, failed, completed] = await Promise.all([
            Task.countDocuments({ user: userId, status: 'in-progress' }),
            Task.countDocuments({ user: userId, status: 'failed' }),
            Task.countDocuments({ user: userId, status: 'completed' })
        ]);

        // Get tasks that are dynamically failed (due date passed but status is in-progress)
        const now = new Date();
        const dynamicallyFailed = await Task.countDocuments({
            user: userId,
            status: 'in-progress',
            due: { $lt: now }
        });

        // Adjust counts for dynamic status
        const actualInProgress = inProgress - dynamicallyFailed;
        const actualFailed = failed + dynamicallyFailed;

        const total = actualInProgress + actualFailed + completed;

        const summary = {
            total,
            inProgress: actualInProgress,
            failed: actualFailed,
            completed,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
            failureRate: total > 0 ? ((actualFailed / total) * 100).toFixed(2) : 0
        };

        res.json({
            success: true,
            data: {
                userId,
                summary
            },
            message: 'Task status summary retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching task status summary:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve task status summary',
                code: 'SUMMARY_FETCH_ERROR'
            }
        });
    }
};

module.exports = {
    createTask,
    getTaskById,
    getTasksByUser,
    updateTask,
    completeTask,
    deleteTask,
    getUserProductivityStats,
    updateTaskStatus,
    getTaskStatusSummary
};