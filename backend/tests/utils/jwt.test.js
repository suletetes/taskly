const jwt = require('jsonwebtoken');
const { generateToken, verifyToken, generateUserToken } = require('../../utils/jwt');

// Mock environment variables
const originalEnv = process.env;

describe('JWT Utilities', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '1h'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { id: '123', username: 'testuser' };
      const token = generateToken(payload);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data in token', () => {
      const payload = { id: '123', username: 'testuser' };
      const token = generateToken(payload);
      const decoded = jwt.verify(token, 'test-secret-key');

      expect(decoded.id).toBe(payload.id);
      expect(decoded.username).toBe(payload.username);
    });

    it('should set expiration time', () => {
      const payload = { id: '123' };
      const token = generateToken(payload);
      const decoded = jwt.verify(token, 'test-secret-key');

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { id: '123', username: 'testuser' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.username).toBe(payload.username);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { id: '123' },
        'test-secret-key',
        { expiresIn: '-1h' } // Already expired
      );

      expect(() => {
        verifyToken(expiredToken);
      }).toThrow('jwt expired');
    });

    it('should throw error for token with wrong secret', () => {
      const token = jwt.sign({ id: '123' }, 'wrong-secret');

      expect(() => {
        verifyToken(token);
      }).toThrow();
    });
  });

  describe('generateUserToken', () => {
    it('should generate token with user data', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com'
      };

      const token = generateUserToken(user);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(user._id);
      expect(decoded.username).toBe(user.username);
      expect(decoded.email).toBe(user.email);
    });

    it('should handle user object with toString method', () => {
      const user = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        username: 'testuser',
        email: 'test@example.com'
      };

      const token = generateUserToken(user);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(user._id);
      expect(decoded.username).toBe(user.username);
      expect(decoded.email).toBe(user.email);
    });
  });
});