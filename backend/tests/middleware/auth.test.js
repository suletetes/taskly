const { authenticateToken, authorizeUser, optionalAuth } = require('../../middleware/auth');
const { generateUserToken } = require('../../utils/jwt');
const User = require('../../models/User');

// Mock the User model
jest.mock('../../models/User');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      params: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      email: 'test@example.com'
    };

    it('should authenticate valid token', async () => {
      const token = generateUserToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Access token required',
          code: 'UNAUTHORIZED'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Access token required',
          code: 'UNAUTHORIZED'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      req.headers.authorization = 'Bearer invalid.token.here';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'UNAUTHORIZED'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token for non-existent user', async () => {
      const token = generateUserToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'User not found',
          code: 'UNAUTHORIZED'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const token = generateUserToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Authentication error',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorizeUser', () => {
    beforeEach(() => {
      req.user = {
        _id: { toString: () => '507f1f77bcf86cd799439011' }
      };
    });

    it('should allow access to own resources', () => {
      req.params.userId = '507f1f77bcf86cd799439011';

      authorizeUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access when no userId in params', () => {
      authorizeUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access to other user resources', () => {
      req.params.userId = 'different-user-id';

      authorizeUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Access denied',
          code: 'FORBIDDEN'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      email: 'test@example.com'
    };

    it('should set user if valid token provided', async () => {
      const token = generateUserToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await optionalAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if no token provided', async () => {
      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if invalid token provided', async () => {
      req.headers.authorization = 'Bearer invalid.token';

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if user not found', async () => {
      const token = generateUserToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });
});