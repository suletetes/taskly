import express from 'express';
import { upload, deleteImage } from '../config/cloudinary.js';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar to Cloudinary
 * @access  Private
 */
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          code: 'NO_FILE'
        }
      });
    }

    // Get the uploaded file info from Cloudinary
    const { secure_url, public_id } = req.file;

    // Update user's avatar in database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Delete old avatar from Cloudinary if it exists and is a Cloudinary URL
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        const oldPublicId = user.avatar.split('/').pop().split('.')[0];
        await deleteImage(`taskly/avatars/${oldPublicId}`);
      } catch (error) {
        console.warn('Could not delete old avatar:', error.message);
      }
    }

    // Update user avatar
    user.avatar = secure_url;
    user.avatarPublicId = public_id;
    await user.save();

    res.json({
      success: true,
      data: {
        avatar: secure_url,
        publicId: public_id
      },
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload avatar',
        code: 'UPLOAD_ERROR'
      }
    });
  }
});

/**
 * @route   DELETE /api/upload/avatar
 * @desc    Delete user avatar from Cloudinary
 * @access  Private
 */
router.delete('/avatar', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Delete avatar from Cloudinary if it exists
    if (user.avatarPublicId) {
      try {
        await deleteImage(user.avatarPublicId);
      } catch (error) {
        console.warn('Could not delete avatar from Cloudinary:', error.message);
      }
    }

    // Reset user avatar to default
    user.avatar = null;
    user.avatarPublicId = null;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('Avatar deletion error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete avatar',
        code: 'DELETE_ERROR'
      }
    });
  }
});

export default router;