const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Team authentication middleware
const teamAuth = async (req, res, next) => {
  try {
    const teamId = req.params.id || req.body.teamId;
    
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is a member of the team
    const isMember = team.isMember(req.user.id);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this team.' });
    }

    req.team = team;
    next();
  } catch (error) {
    console.error('Team auth middleware error:', error);
    res.status(500).json({ error: 'Server error during team authentication' });
  }
};

// Project authentication middleware
const projectAuth = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const project = await Project.findById(projectId).populate('team');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is a member of the project or the associated team
    const isProjectMember = project.isMember(req.user.id);
    const isTeamMember = project.team && project.team.isMember(req.user.id);
    
    if (!isProjectMember && !isTeamMember) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this project or its team.' });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Project auth middleware error:', error);
    res.status(500).json({ error: 'Server error during project authentication' });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const teamId = req.params.id || req.body.teamId;
      const projectId = req.params.id || req.body.projectId;
      
      let userRole = null;
      
      if (teamId && req.team) {
        userRole = req.team.getUserRole(req.user.id);
      } else if (projectId && req.project) {
        userRole = req.project.getUserRole(req.user.id);
      }
      
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ 
          error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole || 'none'}` 
        });
      }
      
      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ error: 'Server error during role authorization' });
    }
  };
};

// Permission-based authorization middleware
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const teamId = req.params.id || req.body.teamId;
      const projectId = req.params.id || req.body.projectId;
      
      let hasPermission = false;
      
      if (teamId && req.team) {
        hasPermission = req.team.hasPermission(req.user.id, permission);
      } else if (projectId && req.project) {
        hasPermission = req.project.hasPermission(req.user.id, permission);
      }
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: `Access denied. Required permission: ${permission}` 
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission authorization error:', error);
      res.status(500).json({ error: 'Server error during permission authorization' });
    }
  };
};

// Admin middleware (for system-wide admin operations)
const adminAuth = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Server error during admin authentication' });
  }
};

// Optional authentication middleware (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail for optional auth, just continue without user
    next();
  }
};

// Rate limiting middleware for sensitive operations
const rateLimitSensitive = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    }
    
    const userRequests = requests.get(key) || [];
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }
    
    userRequests.push(now);
    requests.set(key, userRequests);
    
    next();
  };
};

// Validation middleware for team/project ownership transfer
const validateOwnershipTransfer = async (req, res, next) => {
  try {
    const { newOwnerId } = req.body;
    const resourceId = req.params.id;
    const resourceType = req.route.path.includes('teams') ? 'team' : 'project';
    
    if (!newOwnerId) {
      return res.status(400).json({ error: 'New owner ID is required' });
    }
    
    // Check if new owner exists
    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
      return res.status(404).json({ error: 'New owner not found' });
    }
    
    // Check if new owner is a member
    let resource;
    if (resourceType === 'team') {
      resource = await Team.findById(resourceId);
    } else {
      resource = await Project.findById(resourceId);
    }
    
    if (!resource) {
      return res.status(404).json({ error: `${resourceType} not found` });
    }
    
    if (!resource.isMember(newOwnerId)) {
      return res.status(400).json({ error: 'New owner must be a member of the ' + resourceType });
    }
    
    // Check if current user is the owner
    if (resource.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the current owner can transfer ownership' });
    }
    
    req.newOwner = newOwner;
    req.resource = resource;
    next();
  } catch (error) {
    console.error('Ownership transfer validation error:', error);
    res.status(500).json({ error: 'Server error during ownership transfer validation' });
  }
};

module.exports = {
  auth,
  teamAuth,
  projectAuth,
  requireRole,
  requirePermission,
  adminAuth,
  optionalAuth,
  rateLimitSensitive,
  validateOwnershipTransfer
};