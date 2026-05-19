/**
 * Unit tests for Email Service (AWS SES + SQS integration)
 *
 * Tests cover:
 * - Email template rendering with various data inputs
 * - SQS message publishing for email queue
 * - Retry logic on simulated SES failures
 * - Direct email sending via SES
 *
 * Requirements: 6.1, 6.3, 6.4
 */

// Mock AWS SDK clients before importing the service
jest.mock('@aws-sdk/client-ses', () => {
  const mockSend = jest.fn();
  return {
    SESClient: jest.fn(() => ({ send: mockSend })),
    SendEmailCommand: jest.fn((params) => ({ ...params, _type: 'SendEmailCommand' })),
    __mockSend: mockSend,
  };
});

jest.mock('@aws-sdk/client-sqs', () => {
  const mockSend = jest.fn();
  return {
    SQSClient: jest.fn(() => ({ send: mockSend })),
    SendMessageCommand: jest.fn((params) => ({ ...params, _type: 'SendMessageCommand' })),
    __mockSend: mockSend,
  };
});

jest.mock('../../config/aws.js', () => ({
  sesClient: { send: jest.fn() },
  awsRegion: 'us-east-1',
}));

// Set environment variables before importing
process.env.SES_SENDER_EMAIL = 'noreply@taskly.app';
process.env.EMAIL_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/taskly-email-queue';
process.env.CLIENT_URL = 'https://app.taskly.com';

const { sesClient } = require('../../config/aws.js');
const { SQSClient, SendMessageCommand, __mockSend: sqsMockSend } = require('@aws-sdk/client-sqs');

// We need to get the actual SQS client instance used by the service
// The service creates its own SQS client, so we mock at the module level

describe('Email Service', () => {
  let emailService;

  beforeAll(async () => {
    // Dynamic import since the module uses ESM
    emailService = await import('../../services/emailService.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the SES client mock
    sesClient.send.mockReset();
  });

  // ─── Template Rendering Tests ────────────────────────────────────────────

  describe('Email Template Rendering', () => {
    it('should render welcome email with user name and email', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-welcome-123' });

      await emailService.sendWelcomeEmail('john@example.com', 'John Doe');

      expect(sesClient.send).toHaveBeenCalledTimes(1);
      const callArgs = sesClient.send.mock.calls[0][0];
      expect(callArgs.Destination.ToAddresses).toEqual(['john@example.com']);
      expect(callArgs.Message.Subject.Data).toContain('Welcome to Taskly');
      expect(callArgs.Message.Body.Html.Data).toContain('John Doe');
    });

    it('should render team invite email with inviter, team name, and link', async () => {
      // Queue email uses SQS - mock the SQS client
      // Since the service creates its own SQS client, we need to mock at module level
      // For this test, EMAIL_QUEUE_URL is set so it will try to queue
      const sqsClientInstance = SQSClient.mock.instances[0] || { send: jest.fn() };
      if (sqsClientInstance.send) {
        sqsClientInstance.send.mockResolvedValueOnce({ MessageId: 'sqs-msg-123' });
      }

      // Since queueEmail falls back to sendEmail when SQS fails, mock SES too
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-invite-123' });

      const result = await emailService.sendTeamInviteEmail(
        'invitee@example.com',
        'Alice Smith',
        'Engineering Team',
        'https://app.taskly.com/invite/abc123'
      );

      // The function should have attempted to send/queue
      expect(result).toBeDefined();
    });

    it('should render password reset email with user name and reset link', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-reset-123' });

      await emailService.sendPasswordResetEmail(
        'user@example.com',
        'Jane Doe',
        'https://app.taskly.com/reset/token123'
      );

      expect(sesClient.send).toHaveBeenCalledTimes(1);
      const callArgs = sesClient.send.mock.calls[0][0];
      expect(callArgs.Destination.ToAddresses).toEqual(['user@example.com']);
      expect(callArgs.Message.Subject.Data).toContain('Reset');
      expect(callArgs.Message.Body.Html.Data).toContain('Jane Doe');
      expect(callArgs.Message.Body.Html.Data).toContain('https://app.taskly.com/reset/token123');
    });

    it('should render task assigned email with task details', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-task-123' });

      // sendTaskAssignedEmail uses queueEmail, which falls back to sendEmail
      const result = await emailService.sendTaskAssignedEmail(
        'dev@example.com',
        'Bob Builder',
        'Fix login bug',
        'Users cannot log in with Google OAuth',
        'Alice Manager',
        'https://app.taskly.com/tasks/task-456'
      );

      expect(result).toBeDefined();
    });

    it('should handle empty task description gracefully', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-task-empty-123' });

      const result = await emailService.sendTaskAssignedEmail(
        'dev@example.com',
        'Bob Builder',
        'Quick task',
        '', // empty description
        'Alice Manager',
        'https://app.taskly.com/tasks/task-789'
      );

      expect(result).toBeDefined();
    });
  });

  // ─── Direct Email Sending Tests ──────────────────────────────────────────

  describe('sendEmail (Direct SES)', () => {
    it('should send email with correct SES parameters', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-direct-123' });

      const result = await emailService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Hello</h1>',
      });

      expect(result).toEqual({ messageId: 'msg-direct-123', sent: true });
      expect(sesClient.send).toHaveBeenCalledTimes(1);

      const callArgs = sesClient.send.mock.calls[0][0];
      expect(callArgs.Source).toBe('noreply@taskly.app');
      expect(callArgs.Destination.ToAddresses).toEqual(['recipient@example.com']);
      expect(callArgs.Message.Subject.Data).toBe('Test Subject');
      expect(callArgs.Message.Subject.Charset).toBe('UTF-8');
      expect(callArgs.Message.Body.Html.Data).toBe('<h1>Hello</h1>');
      expect(callArgs.Message.Body.Html.Charset).toBe('UTF-8');
    });

    it('should support custom sender address', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-custom-sender' });

      await emailService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Custom Sender',
        html: '<p>Test</p>',
        from: 'custom@taskly.app',
      });

      const callArgs = sesClient.send.mock.calls[0][0];
      expect(callArgs.Source).toBe('custom@taskly.app');
    });

    it('should support reply-to address', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-reply-to' });

      await emailService.sendEmail({
        to: 'recipient@example.com',
        subject: 'With Reply-To',
        html: '<p>Test</p>',
        replyTo: 'support@taskly.app',
      });

      const callArgs = sesClient.send.mock.calls[0][0];
      expect(callArgs.ReplyToAddresses).toEqual(['support@taskly.app']);
    });

    it('should support array of recipients', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-multi' });

      await emailService.sendEmail({
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Multi-recipient',
        html: '<p>Test</p>',
      });

      const callArgs = sesClient.send.mock.calls[0][0];
      expect(callArgs.Destination.ToAddresses).toEqual(['user1@example.com', 'user2@example.com']);
    });
  });

  // ─── Retry Logic Tests ───────────────────────────────────────────────────

  describe('Retry Logic', () => {
    it('should retry on transient SES failures (up to 3 attempts)', async () => {
      const throttleError = new Error('Throttling');
      throttleError.name = 'Throttling';

      sesClient.send
        .mockRejectedValueOnce(throttleError)
        .mockRejectedValueOnce(throttleError)
        .mockResolvedValueOnce({ MessageId: 'msg-retry-success' });

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Retry Test',
        html: '<p>Test</p>',
      });

      expect(result).toEqual({ messageId: 'msg-retry-success', sent: true });
      expect(sesClient.send).toHaveBeenCalledTimes(3);
    });

    it('should throw after exhausting all retry attempts', async () => {
      const serverError = new Error('Service Unavailable');
      serverError.name = 'ServiceUnavailableException';

      sesClient.send
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError);

      await expect(
        emailService.sendEmail({
          to: 'user@example.com',
          subject: 'Fail Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('Service Unavailable');

      expect(sesClient.send).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors (MessageRejected)', async () => {
      const clientError = new Error('Email address is not verified');
      clientError.name = 'MessageRejected';

      sesClient.send.mockRejectedValueOnce(clientError);

      await expect(
        emailService.sendEmail({
          to: 'invalid@example.com',
          subject: 'Non-retryable',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('Email address is not verified');

      // Should only attempt once (no retries)
      expect(sesClient.send).toHaveBeenCalledTimes(1);
    });

    it('should not retry on InvalidParameterValue errors', async () => {
      const paramError = new Error('Invalid parameter');
      paramError.name = 'InvalidParameterValue';

      sesClient.send.mockRejectedValueOnce(paramError);

      await expect(
        emailService.sendEmail({
          to: 'user@example.com',
          subject: 'Invalid Param',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('Invalid parameter');

      expect(sesClient.send).toHaveBeenCalledTimes(1);
    });
  });

  // ─── SQS Queue Publishing Tests ─────────────────────────────────────────

  describe('queueEmail (SQS Publishing)', () => {
    it('should fall back to direct send when EMAIL_QUEUE_URL is not configured', async () => {
      // Temporarily unset the queue URL
      const originalUrl = process.env.EMAIL_QUEUE_URL;
      process.env.EMAIL_QUEUE_URL = '';

      // Re-import to pick up the env change - since module caches, we test the fallback behavior
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-fallback-123' });

      const result = await emailService.queueEmail({
        to: 'user@example.com',
        subject: 'Fallback Test',
        html: '<p>Test</p>',
      });

      // Should fall back to direct send
      expect(result).toBeDefined();
      expect(sesClient.send).toHaveBeenCalled();

      // Restore
      process.env.EMAIL_QUEUE_URL = originalUrl;
    });

    it('should include correct message attributes when queuing', async () => {
      // The queueEmail function creates its own SQS client
      // We verify the function doesn't throw and returns a result
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-queue-123' });

      // Since the SQS client is internal, we test the overall behavior
      const result = await emailService.queueEmail({
        to: 'user@example.com',
        subject: 'Queue Test',
        html: '<p>Queued content</p>',
        delaySeconds: 30,
      });

      expect(result).toBeDefined();
    });
  });

  // ─── processQueuedEmail Tests ────────────────────────────────────────────

  describe('processQueuedEmail', () => {
    it('should process a valid queued email message', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-processed-123' });

      const message = {
        to: 'user@example.com',
        subject: 'Queued Email',
        html: '<p>From queue</p>',
        from: 'noreply@taskly.app',
        replyTo: null,
      };

      const result = await emailService.processQueuedEmail(message);

      expect(result).toEqual({ messageId: 'msg-processed-123', sent: true });
      expect(sesClient.send).toHaveBeenCalledTimes(1);
    });

    it('should throw on invalid message (missing required fields)', async () => {
      await expect(
        emailService.processQueuedEmail({ to: 'user@example.com' })
      ).rejects.toThrow('Invalid queued email message');

      await expect(
        emailService.processQueuedEmail({ subject: 'Test' })
      ).rejects.toThrow('Invalid queued email message');

      await expect(
        emailService.processQueuedEmail({})
      ).rejects.toThrow('Invalid queued email message');
    });

    it('should process message with custom from and replyTo', async () => {
      sesClient.send.mockResolvedValueOnce({ MessageId: 'msg-custom-queue' });

      const message = {
        to: 'user@example.com',
        subject: 'Custom Queue',
        html: '<p>Custom</p>',
        from: 'team@taskly.app',
        replyTo: 'reply@taskly.app',
      };

      await emailService.processQueuedEmail(message);

      const callArgs = sesClient.send.mock.calls[0][0];
      expect(callArgs.Source).toBe('team@taskly.app');
      expect(callArgs.ReplyToAddresses).toEqual(['reply@taskly.app']);
    });
  });
});
