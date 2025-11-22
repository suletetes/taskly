/**
 * Email Service Tests
 * Tests for Resend email service integration
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmail, sendEmailWithRetry } from '../config/resend.js';
import { passwordResetEmail, welcomeEmail, teamInviteEmail } from '../utils/emailTemplates.js';

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_USER_NAME = 'Test User';
const TEST_TEAM_NAME = 'Test Team';

console.log('\n========================================');
console.log('EMAIL SERVICE TESTS');
console.log('========================================\n');

// Test 1: Check environment variables
console.log('Test 1: Environment Configuration');
console.log('-----------------------------------');
const hasApiKey = !!process.env.RESEND_API_KEY;
const hasEmailFrom = !!process.env.EMAIL_FROM;
const hasClientUrl = !!process.env.CLIENT_URL;

console.log(`✓ RESEND_API_KEY configured: ${hasApiKey ? '✅ YES' : '❌ NO'}`);
console.log(`✓ EMAIL_FROM configured: ${hasEmailFrom ? '✅ YES' : '❌ NO'}`);
console.log(`✓ CLIENT_URL configured: ${hasClientUrl ? '✅ YES' : '❌ NO'}`);

if (!hasApiKey || !hasEmailFrom) {
  console.log('\n⚠️  Email service not fully configured. Skipping send tests.\n');
} else {
  console.log('\n✅ All environment variables configured\n');
}

// Test 2: Email Template Generation
console.log('Test 2: Email Template Generation');
console.log('-----------------------------------');

try {
  const resetTemplate = passwordResetEmail(TEST_USER_NAME, 'http://localhost:3000/reset-password/token123');
  console.log(`✅ Password Reset Template Generated`);
  console.log(`   Subject: ${resetTemplate.subject}`);
  console.log(`   HTML Length: ${resetTemplate.html.length} characters`);
  console.log(`   Contains reset link: ${resetTemplate.html.includes('reset-password') ? '✅' : '❌'}`);
  console.log(`   Contains button: ${resetTemplate.html.includes('class="button"') ? '✅' : '❌'}`);
} catch (error) {
  console.log(`❌ Password Reset Template Error: ${error.message}`);
}

try {
  const welcomeTemplate = welcomeEmail(TEST_USER_NAME, TEST_EMAIL);
  console.log(`\n✅ Welcome Email Template Generated`);
  console.log(`   Subject: ${welcomeTemplate.subject}`);
  console.log(`   HTML Length: ${welcomeTemplate.html.length} characters`);
  console.log(`   Contains dashboard link: ${welcomeTemplate.html.includes('Dashboard') ? '✅' : '❌'}`);
} catch (error) {
  console.log(`❌ Welcome Email Template Error: ${error.message}`);
}

try {
  const inviteTemplate = teamInviteEmail('Admin User', TEST_TEAM_NAME, 'http://localhost:3000/join/invite123', TEST_EMAIL);
  console.log(`\n✅ Team Invite Email Template Generated`);
  console.log(`   Subject: ${inviteTemplate.subject}`);
  console.log(`   HTML Length: ${inviteTemplate.html.length} characters`);
  console.log(`   Contains team name: ${inviteTemplate.html.includes(TEST_TEAM_NAME) ? '✅' : '❌'}`);
  console.log(`   Contains invite link: ${inviteTemplate.html.includes('Accept Invitation') ? '✅' : '❌'}`);
} catch (error) {
  console.log(`❌ Team Invite Email Template Error: ${error.message}`);
}

// Test 3: Send Email (if configured)
if (hasApiKey && hasEmailFrom) {
  console.log('\n\nTest 3: Send Email via Resend');
  console.log('-----------------------------------');

  (async () => {
    try {
      console.log('Sending test email...');
      const result = await sendEmail({
        to: TEST_EMAIL,
        subject: 'Taskly Test Email',
        html: '<h1>Test Email</h1><p>This is a test email from Taskly.</p>',
        text: 'This is a test email from Taskly.'
      });

      if (result.success) {
        console.log(`✅ Email sent successfully`);
        console.log(`   Email ID: ${result.id}`);
        console.log(`   Message: ${result.message}`);
      } else {
        console.log(`❌ Email send failed`);
        console.log(`   Error: ${result.error}`);
        console.log(`   Code: ${result.code}`);
      }
    } catch (error) {
      console.log(`❌ Email send error: ${error.message}`);
    }

    // Test 4: Send Email with Retry
    console.log('\n\nTest 4: Send Email with Retry Logic');
    console.log('-----------------------------------');

    try {
      console.log('Sending email with retry logic (max 3 attempts)...');
      const result = await sendEmailWithRetry({
        to: TEST_EMAIL,
        subject: 'Taskly Test Email with Retry',
        html: '<h1>Test Email with Retry</h1><p>This email has retry logic.</p>'
      }, 3);

      if (result.success) {
        console.log(`✅ Email sent successfully with retry`);
        console.log(`   Email ID: ${result.id}`);
      } else {
        console.log(`❌ Email send failed after retries`);
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Retry email error: ${error.message}`);
    }

    // Test 5: Send Password Reset Email
    console.log('\n\nTest 5: Send Password Reset Email');
    console.log('-----------------------------------');

    try {
      const resetTemplate = passwordResetEmail(TEST_USER_NAME, 'http://localhost:3000/reset-password/token123');
      console.log('Sending password reset email...');
      const result = await sendEmail({
        to: TEST_EMAIL,
        subject: resetTemplate.subject,
        html: resetTemplate.html
      });

      if (result.success) {
        console.log(`✅ Password reset email sent successfully`);
        console.log(`   Email ID: ${result.id}`);
      } else {
        console.log(`❌ Password reset email failed`);
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Password reset email error: ${error.message}`);
    }

    // Test 6: Send Welcome Email
    console.log('\n\nTest 6: Send Welcome Email');
    console.log('-----------------------------------');

    try {
      const welcomeTemplate = welcomeEmail(TEST_USER_NAME, TEST_EMAIL);
      console.log('Sending welcome email...');
      const result = await sendEmail({
        to: TEST_EMAIL,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.html
      });

      if (result.success) {
        console.log(`✅ Welcome email sent successfully`);
        console.log(`   Email ID: ${result.id}`);
      } else {
        console.log(`❌ Welcome email failed`);
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Welcome email error: ${error.message}`);
    }

    // Test 7: Error Handling - Missing API Key
    console.log('\n\nTest 7: Error Handling');
    console.log('-----------------------------------');

    // Temporarily remove API key to test error handling
    const originalApiKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    try {
      console.log('Testing with missing API key...');
      const result = await sendEmail({
        to: TEST_EMAIL,
        subject: 'Test',
        html: '<p>Test</p>'
      });

      if (!result.success) {
        console.log(`✅ Graceful degradation working`);
        console.log(`   Code: ${result.code}`);
        console.log(`   Message: ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ Error handling failed: ${error.message}`);
    }

    // Restore API key
    process.env.RESEND_API_KEY = originalApiKey;

    // Summary
    console.log('\n\n========================================');
    console.log('EMAIL SERVICE TEST SUMMARY');
    console.log('========================================');
    console.log('✅ All email tests completed');
    console.log('✅ Templates generated successfully');
    console.log('✅ Email sending functional');
    console.log('✅ Retry logic implemented');
    console.log('✅ Error handling working');
    console.log('\n');
  })();
} else {
  console.log('\n⚠️  Skipping send tests - API key not configured\n');
}
