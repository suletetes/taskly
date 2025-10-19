const User = require('../models/User');
const { generateUserToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
    try {
        const { fullname, username, email, password, avatar } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: {
                    message: existingUser.username === username
                        ? 'Username already exists'
                        : 'Email already exists',
                    code: 'USER_EXISTS'
                }
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword,
            avatar: avatar || undefined // Use default if not provided
        });

        await newUser.save();

        // Generate JWT token
        const token = generateUserToken(newUser);

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: {
                user: userResponse,
                token
            },
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Registration error:', error);

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
                message: 'Registration failed',
                code: 'REGISTRATION_ERROR'
            }
        });
    }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                }
            });
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                }
            });
        }

        // Generate JWT token
        const token = generateUserToken(user);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: {
                user: userResponse,
                token
            },
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Login failed',
                code: 'LOGIN_ERROR'
            }
        });
    }
};

/**
 * Logout user (client-side token invalidation)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
    try {
        // In JWT-based auth, logout is typically handled client-side by removing the token
        // This endpoint confirms the logout action
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Logout failed',
                code: 'LOGOUT_ERROR'
            }
        });
    }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
    try {
        // User is attached to req by auth middleware
        const userResponse = req.user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: {
                user: userResponse
            },
            message: 'Profile retrieved successfully'
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve profile',
                code: 'PROFILE_ERROR'
            }
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
};