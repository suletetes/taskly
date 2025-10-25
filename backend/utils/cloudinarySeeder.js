import { uploadImage } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

// Cloudinary avatar URLs for seeding
const cloudinaryAvatars = [
  'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face/sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face/woman.jpg',
  'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face/man.jpg',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face'
];

// Get avatar URL for user index
export const getAvatarUrl = (index) => {
  return cloudinaryAvatars[index % cloudinaryAvatars.length];
};

// Upload local SVG files to Cloudinary (if needed)
export const uploadLocalAvatarsToCloudinary = async () => {
  const avatarDir = path.join(process.cwd(), 'public', 'img', 'avatars');
  const uploadedUrls = [];

  try {
    if (fs.existsSync(avatarDir)) {
      const files = fs.readdirSync(avatarDir);
      const svgFiles = files.filter(file => file.endsWith('.svg'));

      for (const file of svgFiles) {
        const filePath = path.join(avatarDir, file);
        try {
          const result = await uploadImage(filePath, {
            public_id: `avatar-${file.replace('.svg', '')}`,
            resource_type: 'image'
          });
          uploadedUrls.push(result.secure_url);
          console.log(`Uploaded ${file} to Cloudinary: ${result.secure_url}`);
        } catch (error) {
          console.error(`Failed to upload ${file}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error uploading avatars to Cloudinary:', error);
  }

  return uploadedUrls;
};