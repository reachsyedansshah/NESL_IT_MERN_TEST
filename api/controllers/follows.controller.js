const follows = require('../models/follows.models');
const users = require('../models/user.model');

/**
 * Follow a user
 * POST /follows/:userId
 */
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { user: currentUser } = req;
    console.log('currentUser', currentUser);
    console.log('userId', userId);
    // Check if user is trying to follow themselves
    if (currentUser.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
        code: 'SELF_FOLLOW_ERROR',
        statusCode: 400
      });
    }

    // Check if target user exists
    const targetUser = users.find(u => u.id === userId && !u.isDeleted);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    // Check if already following
    const existingFollow = follows.find(
      f => f.follower === currentUser.id && 
           f.following === userId && 
           !f.isDeleted
    );

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user',
        code: 'ALREADY_FOLLOWING',
        statusCode: 400
      });
    }

    // Create new follow relationship
    const newFollow = {
      id: `f${follows.length + 1}`,
      follower: currentUser.id,
      following: userId,
      created: new Date(),
      isDeleted: false
    };

    follows.push(newFollow);

    return res.status(201).json({
      success: true,
      message: `Successfully followed ${targetUser.name}`,
      data: {
        follow: {
          id: newFollow.id,
          follower: currentUser.id,
          following: userId,
          created: newFollow.created
        }
      }
    });

  } catch (error) {
    console.error('Follow user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during follow operation',
      code: 'FOLLOW_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

/**
 * Unfollow a user
 * DELETE /follows/:userId
 */
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { user: currentUser } = req;

    // Check if user is trying to unfollow themselves
    if (currentUser.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot unfollow yourself',
        code: 'SELF_UNFOLLOW_ERROR',
        statusCode: 400
      });
    }

    // Check if target user exists
    const targetUser = users.find(u => u.id === userId && !u.isDeleted);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    // Find existing follow relationship
    const existingFollowIndex = follows.findIndex(
      f => f.follower === currentUser.id && 
           f.following === userId && 
           !f.isDeleted
    );

    if (existingFollowIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user',
        code: 'NOT_FOLLOWING',
        statusCode: 400
      });
    }

    // Soft delete the follow relationship
    follows[existingFollowIndex].isDeleted = true;
    follows[existingFollowIndex].updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: `Successfully unfollowed ${targetUser.name}`,
      data: {
        unfollowed: {
          id: follows[existingFollowIndex].id,
          follower: currentUser.id,
          following: userId
        }
      }
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during unfollow operation',
      code: 'UNFOLLOW_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

/**
 * Get user's followers
 * GET /follows/followers/:userId
 */
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user exists
    const targetUser = users.find(u => u.id === userId && !u.isDeleted);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    // Get followers
    const userFollowers = follows.filter(
      f => f.following === userId && !f.isDeleted
    );

    // Get follower details
    const followersWithDetails = userFollowers.map(follow => {
      const follower = users.find(u => u.id === follow.follower && !u.isDeleted);
      return {
        id: follow.id,
        follower: {
          id: follower.id,
          name: follower.name,
          email: follower.email,
          role: follower.role
        }
      };
    }).filter(f => f.follower); // Remove any followers that don't exist

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;
    const paginatedFollowers = followersWithDetails.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      data: {
        followers: paginatedFollowers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: followersWithDetails.length,
          pages: Math.ceil(followersWithDetails.length / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching followers',
      code: 'GET_FOLLOWERS_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

/**
 * Get users that a user is following
 * GET /follows/following/:userId
 */
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user exists
    const targetUser = users.find(u => u.id === userId && !u.isDeleted);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    // Get following
    const userFollowing = follows.filter(
      f => f.follower === userId && !f.isDeleted
    );

    // Get following details
    const followingWithDetails = userFollowing.map(follow => {
      const following = users.find(u => u.id === follow.following && !u.isDeleted);
      return {
        id: follow.id,
        following: {
          id: following.id,
          name: following.name,
          email: following.email,
          role: following.role
        }
      };
    }).filter(f => f.following); // Remove any following that don't exist

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;
    const paginatedFollowing = followingWithDetails.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      data: {
        following: paginatedFollowing,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: followingWithDetails.length,
          pages: Math.ceil(followingWithDetails.length / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching following',
      code: 'GET_FOLLOWING_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

/**
 * Check if user is following another user
 * GET /follows/check/:userId
 */
const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { user: currentUser } = req;

    // Check if target user exists
    const targetUser = users.find(u => u.id === userId && !u.isDeleted);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    // Check if current user is following target user
    const isFollowing = follows.some(
      f => f.follower === currentUser.id && 
           f.following === userId && 
           !f.isDeleted
    );

    return res.status(200).json({
      success: true,
      data: {
        isFollowing,
        targetUser: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role
        }
      }
    });

  } catch (error) {
    console.error('Check follow status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while checking follow status',
      code: 'CHECK_FOLLOW_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

/**
 * Get follow statistics for a user
 * GET /follows/stats/:userId
 */
const getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const targetUser = users.find(u => u.id === userId && !u.isDeleted);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    // Count followers
    const followersCount = follows.filter(
      f => f.following === userId && !f.isDeleted
    ).length;

    // Count following
    const followingCount = follows.filter(
      f => f.follower === userId && !f.isDeleted
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        userId,
        followersCount,
        followingCount,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        }
      }
    });

  } catch (error) {
    console.error('Get follow stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching follow statistics',
      code: 'GET_FOLLOW_STATS_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowStats
}; 