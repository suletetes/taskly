import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { auth, teamAuth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

const router = express.Router();

// Validation middleware
const validateTeam = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Team name must be between 1 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean')
];

const validateMemberRole = [
  body('role').isIn(['owner', 'admin', 'member']).withMessage('Role must be owner, admin, or member')
];

// GET /api/teams - Get all teams for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { 'members.user': req.user.id },
        { owner: req.user.id }
      ]
    })
    .populate('owner', 'fullname username email avatar')
    .populate('members.user', 'fullname username email avatar')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: teams,
      message: 'Teams fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to fetch teams',
        code: 'FETCH_ERROR'
      }
    });
  }
});

// GET /api/teams/:id - Get specific team
router.get('/:id', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'fullname username email avatar')
      .populate('members.user', 'fullname username email avatar lastActive')
      .populate('projects');

    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: team,
      message: 'Team fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching team:', error.message);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to fetch team',
        code: 'FETCH_ERROR'
      }
    });
  }
});

// POST /api/teams - Create new team
router.post('/', auth, validateTeam, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const { name, description, isPrivate = false } = req.body;

    // Check if team name already exists for this user
    const existingTeam = await Team.findOne({
      name,
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    });

    if (existingTeam) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Team name already exists',
          code: 'DUPLICATE_TEAM'
        }
      });
    }

    // Generate invite code
    const inviteCode = crypto.randomBytes(8).toString('hex');

    const team = new Team({
      name,
      description,
      owner: req.user.id,
      isPrivate,
      inviteCode,
      members: [{
        user: req.user.id,
        role: 'owner',
        joinedAt: new Date()
      }]
    });

    await team.save();
    await team.populate('owner', 'fullname username email avatar');
    await team.populate('members.user', 'fullname username email avatar');

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to create team',
        code: 'CREATE_ERROR'
      }
    });
  }
});

// PUT /api/teams/:id - Update team
router.put('/:id', auth, teamAuth, validateTeam, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Check if user has permission to update team
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: 'Insufficient permissions to update team',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
    }

    const { name, description, isPrivate } = req.body;
    
    team.name = name;
    team.description = description;
    team.isPrivate = isPrivate;
    team.updatedAt = new Date();

    await team.save();
    await team.populate('owner', 'fullname username email avatar');
    await team.populate('members.user', 'fullname username email avatar');

    res.json({
      success: true,
      data: team,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to update team',
        code: 'UPDATE_ERROR'
      }
    });
  }
});

// DELETE /api/teams/:id - Delete team
router.delete('/:id', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Only owner can delete team
    if (team.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: 'Only team owner can delete team',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
    }

    // Delete all projects in this team
    const Project = (await import('../models/Project.js')).default;
    await Project.deleteMany({ team: req.params.id });

    await Team.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true,
      message: 'Team deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to delete team',
        code: 'DELETE_ERROR'
      }
    });
  }
});

// POST /api/teams/:id/members - Add member to team
router.post('/:id/members', auth, teamAuth, [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Check if user has permission to add members
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: 'Insufficient permissions to add members',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
    }

    const { userId, role = 'member' } = req.body;

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

    // Check if user is already a member
    const existingMember = team.members.find(m => m.user.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'User is already a team member',
          code: 'DUPLICATE_MEMBER'
        }
      });
    }

    team.members.push({
      user: userId,
      role,
      joinedAt: new Date()
    });

    await team.save();
    await team.populate('owner', 'fullname username email avatar');
    await team.populate('members.user', 'fullname username email avatar');

    res.json({
      success: true,
      data: team,
      message: 'Member added successfully'
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to add team member',
        code: 'ADD_MEMBER_ERROR'
      }
    });
  }
});

// PUT /api/teams/:id/members/:userId - Update member role
router.put('/:id/members/:userId', auth, teamAuth, validateMemberRole, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Check if user has permission to update member roles
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: 'Insufficient permissions to update member roles',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
    }

    const { role } = req.body;
    const { userId } = req.params;

    // Find member to update
    const memberToUpdate = team.members.find(m => m.user.toString() === userId);
    if (!memberToUpdate) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Member not found in team',
          code: 'MEMBER_NOT_FOUND'
        }
      });
    }

    // Prevent changing owner role
    if (memberToUpdate.role === 'owner' || role === 'owner') {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Cannot change owner role',
          code: 'INVALID_OPERATION'
        }
      });
    }

    memberToUpdate.role = role;
    team.updatedAt = new Date();

    await team.save();
    await team.populate('owner', 'fullname username email avatar');
    await team.populate('members.user', 'fullname username email avatar');

    res.json({
      success: true,
      data: team,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to update member role',
        code: 'UPDATE_ROLE_ERROR'
      }
    });
  }
});

// DELETE /api/teams/:id/members/:userId - Remove member from team
router.delete('/:id/members/:userId', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    const { userId } = req.params;

    // Check if user has permission to remove members or is removing themselves
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    const isRemovingSelf = userId === req.user.id;
    
    if (!isRemovingSelf && (!userMember || !['owner', 'admin'].includes(userMember.role))) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: 'Insufficient permissions to remove members',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
    }

    // Find member to remove
    const memberToRemove = team.members.find(m => m.user.toString() === userId);
    if (!memberToRemove) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Member not found in team',
          code: 'MEMBER_NOT_FOUND'
        }
      });
    }

    // Prevent removing owner
    if (memberToRemove.role === 'owner') {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Cannot remove team owner',
          code: 'INVALID_OPERATION'
        }
      });
    }

    // Remove member from all projects in this team
    const Project = (await import('../models/Project.js')).default;
    const teamProjects = await Project.find({ team: req.params.id });
    for (const project of teamProjects) {
      project.members = project.members.filter(m => m.user.toString() !== userId);
      await project.save();
    }

    team.members = team.members.filter(m => m.user.toString() !== userId);
    team.updatedAt = new Date();

    await team.save();
    await team.populate('owner', 'fullname username email avatar');
    await team.populate('members.user', 'fullname username email avatar');

    res.json({
      success: true,
      data: team,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to remove team member',
        code: 'REMOVE_MEMBER_ERROR'
      }
    });
  }
});

// POST /api/teams/join/:inviteCode - Join team with invite code
router.post('/join/:inviteCode', auth, async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const team = await Team.findOne({ inviteCode });
    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Invalid invite code',
          code: 'INVALID_INVITE_CODE'
        }
      });
    }

    // Check if user is already a member
    const existingMember = team.members.find(m => m.user.toString() === req.user.id);
    if (existingMember) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'You are already a member of this team',
          code: 'ALREADY_MEMBER'
        }
      });
    }

    team.members.push({
      user: req.user.id,
      role: 'member',
      joinedAt: new Date()
    });

    await team.save();
    await team.populate('owner', 'fullname username email avatar');
    await team.populate('members.user', 'fullname username email avatar');

    res.json({
      success: true,
      data: team,
      message: 'Successfully joined team'
    });
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to join team',
        code: 'JOIN_TEAM_ERROR'
      }
    });
  }
});

// POST /api/teams/:id/regenerate-invite - Regenerate invite code
router.post('/:id/regenerate-invite', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Check if user has permission to regenerate invite code
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: 'Insufficient permissions to regenerate invite code',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
    }

    team.inviteCode = crypto.randomBytes(8).toString('hex');
    team.updatedAt = new Date();

    await team.save();

    res.json({ 
      success: true,
      data: { inviteCode: team.inviteCode },
      message: 'Invite code regenerated successfully'
    });
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to regenerate invite code',
        code: 'REGENERATE_ERROR'
      }
    });
  }
});

// GET /api/teams/:id/stats - Get team statistics
router.get('/:id/stats', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('projects')
      .populate('members.user', 'fullname username email avatar lastActive');

    if (!team) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Calculate team statistics
    const stats = {
      memberCount: team.members.length,
      projectCount: team.projects ? team.projects.length : 0,
      activeMembers: team.members.filter(m => {
        const lastActive = m.user.lastActive;
        if (!lastActive) return false;
        const daysSinceActive = (Date.now() - new Date(lastActive)) / (1000 * 60 * 60 * 24);
        return daysSinceActive <= 7; // Active in last 7 days
      }).length,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    };

    res.json({
      success: true,
      data: stats,
      message: 'Team statistics fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Failed to fetch team statistics',
        code: 'FETCH_ERROR'
      }
    });
  }
});

export default router;