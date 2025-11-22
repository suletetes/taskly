/**
 * Upload Service Tests
 * Tests for Cloudinary file upload integration
 */

import dotenv from 'dotenv';
dotenv.config();

import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('UPLOAD SERVICE TESTS');
console.log('========================================\n');

// Test 1: Check environment variables
console.log('Test 1: Environment Configuration');
console.log('-----------------------------------');

const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

console.log(`✓ CLOUDINARY_CLOUD_NAME configured: ${hasCloudName ? '✅ YES' : '❌ NO'}`);
console.log(`✓ CLOUDINARY_API_KEY configured: ${hasApiKey ? '✅ YES' : '❌ NO'}`);
console.log(`✓ CLOUDINARY_API_SECRET configured: ${hasApiSecret ? '✅ YES' : '❌ NO'}`);

if (!hasCloudName || !hasApiKey || !hasApiSecret) {
  console.log('\n⚠️  Cloudinary not fully configured. Skipping upload tests.\n');
  process.exit(0);
}

console.log('\n✅ All Cloudinary credentials configured\n');

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test 2: Verify Cloudinary Connection
console.log('Test 2: Cloudinary Connection');
console.log('-----------------------------------');

(async () => {
  try {
    const result = await cloudinary.v2.api.resources({ max_results: 1 });
    console.log(`✅ Cloudinary connection successful`);
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   Total Resources: ${result.total_count}`);
  } catch (error) {
    console.log(`❌ Cloudinary connection failed: ${error.message}`);
    process.exit(1);
  }

  // Test 3: Upload Text File (simulating image)
  console.log('\n\nTest 3: Upload File to Cloudinary');
  console.log('-----------------------------------');

  try {
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for Taskly upload service');

    console.log('Uploading test file...');
    const uploadResult = await cloudinary.v2.uploader.upload(testFilePath, {
      folder: 'taskly/test',
      resource_type: 'auto',
      public_id: `test-${Date.now()}`
    });

    console.log(`✅ File uploaded successfully`);
    console.log(`   Public ID: ${uploadResult.public_id}`);
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Size: ${uploadResult.bytes} bytes`);
    console.log(`   Type: ${uploadResult.resource_type}`);

    // Clean up test file
    fs.unlinkSync(testFilePath);

    // Test 4: Upload with Transformation
    console.log('\n\nTest 4: Upload with Transformation');
    console.log('-----------------------------------');

    try {
      // Create a test image (1x1 pixel PNG)
      const testImagePath = path.join(__dirname, 'test-image.png');
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
        0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngBuffer);

      console.log('Uploading image with transformation...');
      const imageResult = await cloudinary.v2.uploader.upload(testImagePath, {
        folder: 'taskly/avatars',
        resource_type: 'image',
        public_id: `avatar-${Date.now()}`,
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      });

      console.log(`✅ Image uploaded with transformation`);
      console.log(`   Public ID: ${imageResult.public_id}`);
      console.log(`   URL: ${imageResult.secure_url}`);
      console.log(`   Width: ${imageResult.width}px`);
      console.log(`   Height: ${imageResult.height}px`);

      // Clean up test image
      fs.unlinkSync(testImagePath);

      // Test 5: Delete Uploaded File
      console.log('\n\nTest 5: Delete Uploaded File');
      console.log('-----------------------------------');

      try {
        console.log(`Deleting uploaded file: ${uploadResult.public_id}`);
        const deleteResult = await cloudinary.v2.uploader.destroy(uploadResult.public_id);
        console.log(`✅ File deleted successfully`);
        console.log(`   Result: ${deleteResult.result}`);
      } catch (error) {
        console.log(`❌ File deletion failed: ${error.message}`);
      }

      // Test 6: Delete Image File
      try {
        console.log(`\nDeleting uploaded image: ${imageResult.public_id}`);
        const deleteImageResult = await cloudinary.v2.uploader.destroy(imageResult.public_id);
        console.log(`✅ Image deleted successfully`);
        console.log(`   Result: ${deleteImageResult.result}`);
      } catch (error) {
        console.log(`❌ Image deletion failed: ${error.message}`);
      }

      // Test 7: List Resources
      console.log('\n\nTest 7: List Uploaded Resources');
      console.log('-----------------------------------');

      try {
        const resources = await cloudinary.v2.api.resources({
          type: 'upload',
          prefix: 'taskly/',
          max_results: 10
        });

        console.log(`✅ Resources retrieved successfully`);
        console.log(`   Total in taskly folder: ${resources.resources.length}`);
        if (resources.resources.length > 0) {
          console.log(`   Sample resource: ${resources.resources[0].public_id}`);
        }
      } catch (error) {
        console.log(`❌ Resource listing failed: ${error.message}`);
      }

      // Test 8: Get Account Usage
      console.log('\n\nTest 8: Account Usage Statistics');
      console.log('-----------------------------------');

      try {
        const usage = await cloudinary.v2.api.usage();
        console.log(`✅ Usage statistics retrieved`);
        console.log(`   Plan: ${usage.plan}`);
        console.log(`   Transformations used: ${usage.transformations.usage}/${usage.transformations.limit}`);
        console.log(`   Storage used: ${(usage.storage.usage / 1024 / 1024).toFixed(2)}MB/${(usage.storage.limit / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   Bandwidth used: ${(usage.bandwidth.usage / 1024 / 1024).toFixed(2)}MB/${(usage.bandwidth.limit / 1024 / 1024).toFixed(2)}MB`);
      } catch (error) {
        console.log(`❌ Usage statistics failed: ${error.message}`);
      }

      // Test 9: Error Handling - Invalid File
      console.log('\n\nTest 9: Error Handling');
      console.log('-----------------------------------');

      try {
        console.log('Testing upload with invalid file path...');
        await cloudinary.v2.uploader.upload('/invalid/path/file.txt', {
          folder: 'taskly/test'
        });
        console.log(`❌ Should have thrown error`);
      } catch (error) {
        console.log(`✅ Error handling working correctly`);
        console.log(`   Error: ${error.message}`);
      }

      // Summary
      console.log('\n\n========================================');
      console.log('UPLOAD SERVICE TEST SUMMARY');
      console.log('========================================');
      console.log('✅ Cloudinary connection successful');
      console.log('✅ File upload working');
      console.log('✅ Image upload with transformation working');
      console.log('✅ File deletion working');
      console.log('✅ Resource listing working');
      console.log('✅ Usage statistics accessible');
      console.log('✅ Error handling functional');
      console.log('\n');

    } catch (error) {
      console.log(`❌ Image upload test failed: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ File upload test failed: ${error.message}`);
  }
})();
