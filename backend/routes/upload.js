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
    
    console.log('📤 [Upload Avatar] Request headers:',{
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    
    
    if (!req.file) {
    
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded. Please select an image file.',
          code: 'NO_FILE'
        }
      });
    }

    console.log('📤 [Upload Avatar] File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      sizeInMB: (req.file.size / (1024 * 1024)).toFixed(2)
    });



    // Get the uploaded file info from Cloudinary
    // When using multer-storage-cloudinary, the data is in different properties
    const secure_url = req.file.path; // Cloudinary URL is in 'path'
    const public_id = req.file.filename; // Public ID is in 'filename'
    const format = req.file.format;
    const width = req.file.width;
    const height = req.file.height;
    const bytes = req.file.size;
    
    console.log(' [Upload Avatar] Cloudinary upload successful:', {
      secure_url,
      public_id,
      format,
      dimensions: `${width}x${height}`,
      bytes,
      sizeInMB: (bytes / (1024 * 1024)).toFixed(2)
    });

    // Update user's avatar in database

    const user = await User.findById(req.user._id);
    if (!user) {
      //console.log('❌ [Upload Avatar] User not found in database');
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    console.log('📤 [Upload Avatar] User found:', {
      id: user._id,
      fullname: user.fullname,
      currentAvatar: user.avatar ? 'Has avatar' : 'No avatar'
    });

    // Delete old avatar from Cloudinary if it exists and is a Cloudinary URL
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {

        const oldPublicId = user.avatar.split('/').pop().split('.')[0];

        await deleteImage(`taskly/avatars/${oldPublicId}`);

      } catch (error) {
        //console.warn('  [Upload Avatar] Could not delete old avatar:', error.message);
      }
    }

    // Update user avatar
    // //console.log('📤 [Upload Avatar] Updating user avatar in database...');
    user.avatar = secure_url;
    user.avatarPublicId = public_id;
    await user.save();
    // //console.log('✅ [Upload Avatar] User avatar updated in database');

    const response = {
      success: true,
      data: {
        avatar: secure_url,
        publicId: public_id
      },
      message: 'Avatar uploaded successfully'
    };


    
    res.json(response);

  } catch (error) {

    
    // Enhanced error handling with specific messages
    let userMessage = 'Failed to upload avatar. Please try again.';
    let statusCode = 500;
    
    // File size error
    if (error.code === 'LIMIT_FILE_SIZE' || error.message?.includes('File too large')) {
      userMessage = 'File size exceeds the 5MB limit. Please choose a smaller image.';
      statusCode = 400;
    }
    // Invalid file type
    else if (error.message?.includes('Only image files') || error.message?.includes('Invalid image')) {
      userMessage = 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.';
      statusCode = 400;
    }
    // Cloudinary API errors
    else if (error.http_code) {
      if (error.http_code === 401 || error.http_code === 403) {
        userMessage = 'Image upload service authentication failed. Please contact support.';
        //console.error('❌ [Cloudinary] Authentication error - check credentials');
      } else if (error.http_code === 413) {
        userMessage = 'File size exceeds the 5MB limit. Please choose a smaller image.';
        statusCode = 400;
      } else if (error.http_code >= 500) {
        userMessage = 'Image upload service is temporarily unavailable. Please try again later.';
      }
    }
    // Network errors
    else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      userMessage = 'Network error occurred. Please check your connection and try again.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({
      success: false,
      error: {
        message: userMessage,
        code: error.code || 'UPLOAD_ERROR'
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
        //console.warn('Could not delete avatar from Cloudinary:', error.message);
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
    //console.error('Avatar deletion error:', error);
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