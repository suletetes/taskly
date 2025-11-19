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
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/teams/:id - Get specific team
router.get('/:id', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar lastActive')
      .populate('projects');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /api/teams - Create new team
router.post('/', auth, validateTeam, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
      return res.status(400).json({ error: 'Team name already exists' });
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
    await team.populate('owner', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PUT /api/teams/:id - Update team
router.put('/:id', auth, teamAuth, validateTeam, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user has permission to update team
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to update team' });
    }

    const { name, description, isPrivate } = req.body;
    
    team.name = name;
    team.description = description;
    team.isPrivate = isPrivate;
    team.updatedAt = new Date();

    await team.save();
    await team.populate('owner', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/teams/:id - Delete team
router.delete('/:id', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Only owner can delete team
    if (team.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only team owner can delete team' });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
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
      return res.status(400).json({ errors: errors.array() });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user has permission to add members
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to add members' });
    }

    const { userId, role = 'member' } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMember = team.members.find(m => m.user.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    team.members.push({
      user: userId,
      role,
      joinedAt: new Date()
    });

    await team.save();
    await team.populate('members.user', 'name email avatar');

    res.json(team);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// PUT /api/teams/:id/members/:userId - Update member role
router.put('/:id/members/:userId', auth, teamAuth, validateMemberRole, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user has permission to update member roles
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to update member roles' });
    }

    const { role } = req.body;
    const { userId } = req.params;

    // Find member to update
    const memberToUpdate = team.members.find(m => m.user.toString() === userId);
    if (!memberToUpdate) {
      return res.status(404).json({ error: 'Member not found in team' });
    }

    // Prevent changing owner role
    if (memberToUpdate.role === 'owner' || role === 'owner') {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }

    memberToUpdate.role = role;
    team.updatedAt = new Date();

    await team.save();
    await team.populate('members.user', 'name email avatar');

    res.json(team);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// DELETE /api/teams/:id/members/:userId - Remove member from team
router.delete('/:id/members/:userId', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const { userId } = req.params;

    // Check if user has permission to remove members or is removing themselves
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    const isRemovingSelf = userId === req.user.id;
    
    if (!isRemovingSelf && (!userMember || !['owner', 'admin'].includes(userMember.role))) {
      return res.status(403).json({ error: 'Insufficient permissions to remove members' });
    }

    // Find member to remove
    const memberToRemove = team.members.find(m => m.user.toString() === userId);
    if (!memberToRemove) {
      return res.status(404).json({ error: 'Member not found in team' });
    }

    // Prevent removing owner
    if (memberToRemove.role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove team owner' });
    }

    team.members = team.members.filter(m => m.user.toString() !== userId);
    team.updatedAt = new Date();

    await team.save();
    await team.populate('members.user', 'name email avatar');

    res.json(team);
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// POST /api/teams/join/:inviteCode - Join team with invite code
router.post('/join/:inviteCode', auth, async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const team = await Team.findOne({ inviteCode });
    if (!team) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if user is already a member
    const existingMember = team.members.find(m => m.user.toString() === req.user.id);
    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    team.members.push({
      user: req.user.id,
      role: 'member',
      joinedAt: new Date()
    });

    await team.save();
    await team.populate('owner', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    res.json(team);
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ error: 'Failed to join team' });
  }
});

// POST /api/teams/:id/regenerate-invite - Regenerate invite code
router.post('/:id/regenerate-invite', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user has permission to regenerate invite code
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to regenerate invite code' });
    }

    team.inviteCode = crypto.randomBytes(8).toString('hex');
    team.updatedAt = new Date();

    await team.save();

    res.json({ inviteCode: team.inviteCode });
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    res.status(500).json({ error: 'Failed to regenerate invite code' });
  }
});

// GET /api/teams/:id/stats - Get team statistics
router.get('/:id/stats', auth, teamAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('projects')
      .populate('members.user', 'name email avatar');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
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

    res.json(stats);
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ error: 'Failed to fetch team statistics' });
  }
});

export default router;