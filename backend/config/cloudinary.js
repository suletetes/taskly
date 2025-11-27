import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

/**
 * Validate Cloudinary configuration
 * @returns {Object} Validation result with success flag and error message
 */
export const validateCloudinaryConfig = () => {
  const missingVars = [];
  
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    missingVars.push('CLOUDINARY_CLOUD_NAME');
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    missingVars.push('CLOUDINARY_API_KEY');
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    missingVars.push('CLOUDINARY_API_SECRET');
  }

  if (missingVars.length > 0) {
    return {
      success: false,
      error: `Missing required Cloudinary environment variables: ${missingVars.join(', ')}. Please set them in your .env file.`
    };
  }

  return { success: true };
};

/**
 * Test Cloudinary connection
 * @returns {Promise<Object>} Connection test result
 */
export const testCloudinaryConnection = async () => {
  try {
    // Test connection by fetching account details
    const result = await cloudinary.api.ping();
    return {
      success: true,
      message: 'Cloudinary connection successful',
      status: result.status
    };
  } catch (error) {
    return {
      success: false,
      error: `Cloudinary connection failed: ${error.message}`,
      details: error.error?.message || 'Invalid credentials or network error'
    };
  }
};

// Validate configuration before proceeding
const configValidation = validateCloudinaryConfig();

if (!configValidation.success) {
  console.error('❌ [Cloudinary] Configuration Error:', configValidation.error);
  throw new Error(configValidation.error);
}

console.log('☁️ [Cloudinary] Configuring with:', {
  cloud_name: '✓ Set',
  api_key: '✓ Set',
  api_secret: '✓ Set'
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection on startup (async, don't block)
testCloudinaryConnection().then(result => {
  if (result.success) {
    console.log('✅ [Cloudinary] Connection test successful');
  } else {
    console.error('❌ [Cloudinary] Connection test failed:', result.error);
    console.error('   Details:', result.details);
    console.error('   Please verify your Cloudinary credentials are correct');
  }
}).catch(error => {
  console.error('❌ [Cloudinary] Connection test error:', error.message);
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'taskly/avatars', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
});

// Create multer upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to upload image to Cloudinary
const uploadImage = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'taskly/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      ...options
    });
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

export { cloudinary, upload, deleteImage, uploadImage };
export default cloudinary;