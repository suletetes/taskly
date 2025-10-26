/**
 * Middleware to authenticate using Passport sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateToken = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: {
      message: 'Authentication required',
      code: 'UNAUTHORIZED'
    }
  });
};

/**
 * Middleware to check if user is authorized to access a resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authorizeUser = (req, res, next) => {
  const { userId } = req.params;
  
  // Allow access if user is accessing their own resources or if no userId in params
  if (!userId || req.user._id.toString() === userId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      message: 'Access denied',
      code: 'FORBIDDEN'
    }
  });
};

/**
 * Optional authentication middleware - doesn't fail if not authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const optionalAuth = (req, res, next) => {
  // User will be available in req.user if authenticated via Passport
  // No need to check anything, just continue
  next();
};