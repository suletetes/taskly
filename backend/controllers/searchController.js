import User from '../models/User.js';
import Team from '../models/Team.js';
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from '../utils/response.js';

/**
 * Search users by query (username, email, or full name)
 * Excludes current team members and specified user IDs
 */
export const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10, exclude = [], teamId } = req.query;

    // Validate search query
    if (!q || q.trim().length < 2) {
      return badRequestResponse(res, 'Search query must be at least 2 characters');
    }

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));

    // Build exclusion list
    let excludeIds = [];
    
    // Add explicitly excluded user IDs
    if (Array.isArray(exclude)) {
      excludeIds = exclude.filter(id => id && id.length === 24);
    } else if (typeof exclude === 'string' && exclude.length === 24) {
      excludeIds = [exclude];
    }

    // Add current user to exclusion list
    excludeIds.push(req.user.id);

    // Add team members to exclusion list if teamId provided
    if (teamId && teamId.length === 24) {
      try {
        const team = await Team.findById(teamId);
        if (team) {
          const teamMemberIds = team.members.map(m => m.user.toString());
          excludeIds = [...new Set([...excludeIds, ...teamMemberIds])];
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        // Continue with search even if team fetch fails
      }
    }

    // Build search query
    const searchRegex = new RegExp(q.trim(), 'i');
    const searchQuery = {
      $and: [
        {
          $or: [
            { fullname: searchRegex },
            { username: searchRegex },
            { email: searchRegex }
          ]
        },
        { _id: { $nin: excludeIds } }
      ]
    };

    // Execute search
    const users = await User.find(searchQuery)
      .select('fullname username email avatar bio isOnline lastActive')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);

    return successResponse(res, {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }, 'Users found successfully');
  } catch (error) {
    console.error('Error searching users:', error);
    return errorResponse(res, 'Failed to search users', 'SEARCH_ERROR', 500);
  }
};

/**
 * Search users by team context
 * GET /api/teams/:teamId/search-users
 */
export const searchUsersForTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { q, page = 1, limit = 10 } = req.query;

    // Validate team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return notFoundResponse(res, 'Team not found');
    }

    // Check if user has permission to search in team
    const userMember = team.members.find(m => m.user.toString() === req.user.id);
    if (!userMember) {
      return errorResponse(res, 'You are not a member of this team', 'UNAUTHORIZED', 403);
    }

    // Validate search query
    if (!q || q.trim().length < 2) {
      return badRequestResponse(res, 'Search query must be at least 2 characters');
    }

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));

    // Get team member IDs
    const teamMemberIds = team.members.map(m => m.user.toString());

    // Build search query
    const searchRegex = new RegExp(q.trim(), 'i');
    const searchQuery = {
      $and: [
        {
          $or: [
            { fullname: searchRegex },
            { username: searchRegex },
            { email: searchRegex }
          ]
        },
        { _id: { $nin: [...teamMemberIds, req.user.id] } }
      ]
    };

    // Execute search
    const users = await User.find(searchQuery)
      .select('fullname username email avatar bio isOnline lastActive')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);

    return successResponse(res, {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }, 'Users found successfully');
  } catch (error) {
    console.error('Error searching users for team:', error);
    return errorResponse(res, 'Failed to search users', 'SEARCH_ERROR', 500);
  }
};

/**
 * Get user by ID with basic info
 * GET /api/users/:userId
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('fullname username email avatar bio isOnline lastActive createdAt')
      .lean();

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    return successResponse(res, user, 'User fetched successfully');
  } catch (error) {
    console.error('Error fetching user:', error);
    return errorResponse(res, 'Failed to fetch user', 'FETCH_ERROR', 500);
  }
};

/**
 * Search across all content (users, teams, projects, tasks)
 * GET /api/search/global
 */
export const globalSearch = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    // Validate search query
    if (!q || q.trim().length < 2) {
      return badRequestResponse(res, 'Search query must be at least 2 characters');
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const results = {};

    // Search users
    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [
          { fullname: searchRegex },
          { username: searchRegex },
          { email: searchRegex }
        ]
      })
        .select('fullname username email avatar')
        .limit(5)
        .lean();
    }

    // Search teams
    if (type === 'all' || type === 'teams') {
      results.teams = await Team.find({
        $and: [
          { name: searchRegex },
          {
            $or: [
              { owner: req.user.id },
              { 'members.user': req.user.id }
            ]
          }
        ]
      })
        .select('name description avatar owner')
        .limit(5)
        .lean();
    }

    return successResponse(res, results, 'Search results found');
  } catch (error) {
    console.error('Error in global search:', error);
    return errorResponse(res, 'Failed to perform search', 'SEARCH_ERROR', 500);
  }
};
