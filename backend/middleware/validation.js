const Joi = require('joi');

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

// Export validation middleware functions
const validateRegister = validate(registerSchema);
const validateLogin = validate(loginSchema);

module.exports = {
  validate,
  validateRegister,
  validateLogin,
};