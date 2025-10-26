import Joi from 'joi';

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors
        }
      });
    }

    next();
  };
};

// Authentication validation schemas
const registerSchema = Joi.object({
  fullname: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 50 characters'
    }),

  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters'
    }),

  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    })
});

const loginSchema = Joi.object({
  username: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Username or email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

// User update validation schema
const updateUserSchema = Joi.object({
  fullname: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 50 characters'
    }),

  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .optional()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),

  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    }),

  currentPassword: Joi.string()
    .when('newPassword', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Current password is required when setting new password'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .optional()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters'
    })
});

// User ID parameter validation schema
const userIdSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Query parameter validation schema for user listing
const userQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(12),

  search: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
});

// Profile update validation schema (without password fields)
const updateProfileSchema = Joi.object({
  fullname: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 50 characters'
    }),

  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .optional()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),

  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    })
});

// Password change validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters'
    })
});

// Avatar upload validation schema
const uploadAvatarSchema = Joi.object({
  avatar: Joi.string()
    .uri()
    .required()
    .messages({
      'string.empty': 'Avatar URL is required',
      'string.uri': 'Avatar must be a valid URL'
    })
});

// Task validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters'
    }),

  due: Joi.date()
    .required()
    .messages({
      'date.base': 'Due date must be a valid date',
      'any.required': 'Due date is required'
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .required()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high',
      'any.required': 'Priority is required'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .optional()
    .default([])
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 50 characters'
    })
});

const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters'
    }),

  due: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.base': 'Due date must be a valid date',
      'date.min': 'Due date cannot be in the past'
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 50 characters'
    }),

  status: Joi.string()
    .valid('in-progress', 'failed', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be one of: in-progress, failed, completed'
    })
});

// Task ID parameter validation schema
const taskIdSchema = Joi.object({
  taskId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid task ID format'
    })
});

// Query parameter validation schema for task listing
const taskQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(8),

  status: Joi.string()
    .valid('in-progress', 'failed', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be one of: in-progress, failed, completed'
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),

  sortBy: Joi.string()
    .valid('due', 'createdAt', 'updatedAt', 'title', 'priority')
    .optional()
    .default('due')
    .messages({
      'any.only': 'Sort by must be one of: due, createdAt, updatedAt, title, priority'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('asc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    }),

  search: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    })
});

// Task status update validation schema
const taskStatusSchema = Joi.object({
  status: Joi.string()
    .valid('in-progress', 'failed', 'completed')
    .required()
    .messages({
      'any.only': 'Status must be one of: in-progress, failed, completed',
      'any.required': 'Status is required'
    })
});

// Export validation middleware functions
const validateRegister = validate(registerSchema);
const validateLogin = validate(loginSchema);
const validateUpdateUser = validate(updateUserSchema);
const validateUserId = validate(userIdSchema, 'params');
const validateUserQuery = validate(userQuerySchema, 'query');
const validateUpdateProfile = validate(updateProfileSchema);
const validateChangePassword = validate(changePasswordSchema);
const validateUploadAvatar = validate(uploadAvatarSchema);

// Task validation middleware functions
const validateCreateTask = validate(createTaskSchema);
const validateUpdateTask = validate(updateTaskSchema);
const validateTaskId = validate(taskIdSchema, 'params');
const validateTaskQuery = validate(taskQuerySchema, 'query');
const validateTaskStatus = validate(taskStatusSchema);

export {
  validate,
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validateUserId,
  validateUserQuery,
  validateUpdateProfile,
  validateChangePassword,
  validateUploadAvatar,
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateTaskQuery,
  validateTaskStatus,
};