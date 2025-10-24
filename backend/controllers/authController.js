import User from '../models/User.js';
import passport from 'passport';
import { hashPassword } from '../utils/password.js';

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

        // Auto-login after registration
        req.logIn(newUser, (err) => {
            if (err) {
                console.error('Auto-login error:', err);
                // Still return success for registration, but without login
                const userResponse = newUser.toObject();
                delete userResponse.password;
                
                return res.status(201).json({
                    success: true,
                    data: {
                        user: userResponse
                    },
                    message: 'User registered successfully, please login'
                });
            }

            // Remove password from response
            const userResponse = newUser.toObject();
            delete userResponse.password;

            res.status(201).json({
                success: true,
                data: {
                    user: userResponse
                },
                message: 'User registered and logged in successfully'
            });
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
 * Login user using Passport
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    message: 'Login failed',
                    code: 'LOGIN_ERROR'
                }
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: info.message || 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                }
            });
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('Session login error:', err);
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Login failed',
                        code: 'SESSION_ERROR'
                    }
                });
            }

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password;

            res.json({
                success: true,
                data: {
                    user: userResponse
                },
                message: 'Login successful'
            });
        });
    })(req, res, next);
};

/**
 * Logout user (destroy session)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    message: 'Logout failed',
                    code: 'LOGOUT_ERROR'
                }
            });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Logout failed',
                        code: 'SESSION_ERROR'
                    }
                });
            }

            res.clearCookie('connect.sid'); // Clear session cookie
            res.json({
                success: true,
                message: 'Logout successful'
            });
        });
    });
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Not authenticated',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // User is attached to req by Passport
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

export {
    register,
    login,
    logout,
    getProfile,
};