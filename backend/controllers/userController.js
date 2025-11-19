import User from '../models/User.js';
import Task from '../models/Task.js';
import { calculateProductivityStats } from '../utils/productivityStats.js';
import { comparePassword, hashPassword } from '../utils/password.js';

/**
 * Get user by ID with tasks and statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const perPage = parseInt(req.query.limit, 10) || 8;

        // Find the user
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

        // Get total task count for pagination
        const totalTasks = await Task.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalTasks / perPage);

        // Fetch paginated tasks
        const rawTasks = await Task.find({ user: userId })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ due: 1 });

        // Evaluate dynamic task status
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

        // Calculate productivity stats
        const stats = await calculateProductivityStats(userId);

        // Remove password from user response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: {
                user: userResponse,
                tasks,
                stats,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalTasks,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    perPage
                }
            },
            message: 'User retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve user',
                code: 'USER_FETCH_ERROR'
            }
        });
    }
};

/**
 * Get all users with pagination and statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const perPage = parseInt(req.query.limit, 10) || 12;
        const search = req.query.search || '';

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { fullname: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Get total user count
        const totalUsers = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / perPage);

        // Fetch users for the current page
        const users = await User.find(searchQuery)
            .populate('tasks', 'title due status')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ created_at: -1 });

        // Calculate stats for each user and remove passwords
        const usersWithStats = await Promise.all(users.map(async user => {
            const stats = await calculateProductivityStats(user._id);
            const userObj = user.toObject();
            delete userObj.password;
            
            return {
                ...userObj,
                stats,
                totalTasks: user.tasks.length
            };
        }));

        res.json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalUsers,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    perPage
                }
            },
            message: 'Users retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve users',
                code: 'USERS_FETCH_ERROR'
            }
        });
    }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullname, username, email, avatar, currentPassword, newPassword } = req.body;

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

        // Check authorization - users can only update their own profile or admin can update any
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to update this user',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Current password is required to set new password',
                        code: 'CURRENT_PASSWORD_REQUIRED'
                    }
                });
            }

            const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Current password is incorrect',
                        code: 'INVALID_CURRENT_PASSWORD'
                    }
                });
            }

            user.password = await hashPassword(newPassword);
        }

        // Update other fields
        if (fullname !== undefined) user.fullname = fullname;
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: {
                user: userResponse
            },
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Error updating user:', error);

        if (error.code === 11000) {
            // MongoDB duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                    code: 'DUPLICATE_KEY'
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update user',
                code: 'USER_UPDATE_ERROR'
            }
        });
    }
};

/**
 * Delete user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
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

        // Check authorization - users can only delete their own account or admin can delete any
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to delete this user',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Delete all tasks associated with this user
        await Task.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to delete user',
                code: 'USER_DELETE_ERROR'
            }
        });
    }
};

/**
 * Update user profile (separate endpoint for profile-specific updates)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id; // Get from authenticated user
        const { fullname, username, email, avatar, bio, timezone, jobTitle, company, onboarding } = req.body;

        // Find the user
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

        // Update fields
        if (fullname !== undefined) user.fullname = fullname;
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (avatar !== undefined) user.avatar = avatar;
        if (bio !== undefined) user.bio = bio;
        if (timezone !== undefined) user.timezone = timezone;
        if (jobTitle !== undefined) user.jobTitle = jobTitle;
        if (company !== undefined) user.company = company;
        
        // Update onboarding status
        if (onboarding !== undefined) {
            if (onboarding.completed !== undefined) user.onboarding.completed = onboarding.completed;
            if (onboarding.currentStep !== undefined) user.onboarding.currentStep = onboarding.currentStep;
            if (onboarding.completedSteps !== undefined) user.onboarding.completedSteps = onboarding.completedSteps;
            if (onboarding.completed && !user.onboarding.completedAt) {
                user.onboarding.completedAt = new Date();
            }
        }

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: {
                user: userResponse
            },
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Error updating profile:', error);

        if (error.code === 11000) {
            // MongoDB duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                    code: 'DUPLICATE_KEY'
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update profile',
                code: 'PROFILE_UPDATE_ERROR'
            }
        });
    }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
    try {
        const userId = req.user._id; // Get from authenticated user
        const { currentPassword, newPassword } = req.body;

        // Find the user
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

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Current password is incorrect',
                    code: 'INVALID_CURRENT_PASSWORD'
                }
            });
        }

        // Hash and set new password
        user.password = await hashPassword(newPassword);
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to change password',
                code: 'PASSWORD_CHANGE_ERROR'
            }
        });
    }
};

/**
 * Upload user avatar
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user._id; // Get from authenticated user
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Avatar URL is required',
                    code: 'AVATAR_REQUIRED'
                }
            });
        }

        // Find and update user
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

        user.avatar = avatar;
        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: {
                user: userResponse
            },
            message: 'Avatar updated successfully'
        });

    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to upload avatar',
                code: 'AVATAR_UPLOAD_ERROR'
            }
        });
    }
};

/**
 * Delete current user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id; // Get from authenticated user

        // Delete all tasks associated with this user
        await Task.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to delete account',
                code: 'ACCOUNT_DELETE_ERROR'
            }
        });
    }
};

export {
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteCurrentUser,
};