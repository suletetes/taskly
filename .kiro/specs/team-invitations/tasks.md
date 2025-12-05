# Team Invitations & Enhanced Features - Implementation Tasks

## Phase 1: User Search & Invitations

- [x] 1. Set up invitation data model and database schema
  - Create Invitation model with all required fields
  - Add indexes for team, inviter, invitee, status
  - Add expiration date handling
  - _Requirements: 2.1, 2.2, 7.1_

- [x] 2. Implement user search endpoint
  - Create GET /api/teams/:teamId/search-users endpoint
  - Implement search by username, email, full name
  - Exclude current team members from results
  - Add pagination support
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 2.1 Write property test for search excludes members
  - **Property 3: Search Excludes Members**
  - **Validates: Requirements 1.3, 1.4**

- [x] 3. Implement send invitation endpoint
  - Create POST /api/teams/:teamId/invitations endpoint
  - Validate inviter has permission (owner/admin)
  - Check for duplicate invitations
  - Create invitation record
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 3.1 Write property test for invitation uniqueness
  - **Property 1: Invitation Uniqueness**
  - **Validates: Requirements 2.3**

- [x] 4. Build user search UI component
  - Create search input with real-time results
  - Display user avatars and information
  - Show "Already a member" indicator
  - Add loading and error states
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 5. Build send invitation UI
  - Create invitation preview component
  - Show team and user information
  - Add send button with confirmation
  - Display success/error messages
  - _Requirements: 2.1, 2.2, 2.4_

## Phase 2: Invitation Acceptance & Notifications

- [x] 6. Implement accept invitation endpoint
  - Create PUT /api/invitations/:invitationId/accept endpoint
  - Add user to team as member
  - Update invitation status
  - Remove invitation record
  - _Requirements: 3.3, 3.5_

- [ ]* 6.1 Write property test for acceptance idempotence
  - **Property 2: Invitation Acceptance Idempotence**
  - **Validates: Requirements 3.3**

- [x] 7. Implement deny invitation endpoint
  - Create PUT /api/invitations/:invitationId/deny endpoint
  - Update invitation status to denied
  - Keep invitation in history
  - _Requirements: 3.4_

- [x] 8. Implement notification system
  - Create notification model
  - Implement in-app notification creation
  - Integrate with email service (Resend)
  - Add notification templates
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 8.1 Write property test for notification delivery
  - **Property 8: Notification Delivery**
  - **Validates: Requirements 8.1**

- [x] 9. Build user invitations UI
  - Create invitations page/section
  - Display pending invitations with team info
  - Add accept/deny buttons
  - Show invitation details
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 10. Implement invitation history endpoint
  - Create GET /api/teams/:teamId/invitations endpoint
  - Return all invitations with status
  - Include sent date and invitee info
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Team Enhancements

- [x] 12. Implement team statistics endpoint
  - Create GET /api/teams/:teamId/statistics endpoint
  - Calculate member count, project count, task count
  - Track active members
  - _Requirements: 4.1, 4.2_

- [x] 13. Enhance team members endpoint
  - Update GET /api/teams/:teamId/members endpoint
  - Include role, join date, last active status
  - _Requirements: 4.3_

- [x] 14. Implement member removal with cascade
  - Update DELETE /api/teams/:teamId/members/:userId endpoint
  - Remove user from all projects in team
  - Send notification to removed member
  - _Requirements: 4.4, 8.5_

- [ ]* 14.1 Write property test for member removal cascade
  - **Property 7: Member Removal Cascade**
  - **Validates: Requirements 4.4**

- [x] 15. Build team dashboard UI
  - Display team statistics
  - Show pending invitations count
  - Display team members with details
  - Add member management options
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 16. Implement team settings updates
  - Update PUT /api/teams/:teamId endpoint
  - Allow description and privacy updates
  - _Requirements: 4.5_

## Phase 4: Project & Task Enhancements

- [ ] 17. Implement project progress calculation
  - Create GET /api/projects/:projectId/progress endpoint
  - Calculate progress percentage
  - Track member workload
  - _Requirements: 5.1, 5.2_

- [ ]* 17.1 Write property test for progress accuracy
  - **Property 5: Project Progress Accuracy**
  - **Validates: Requirements 5.1**

- [x] 18. Implement project archiving
  - Update PUT /api/projects/:projectId endpoint
  - Add archive/unarchive functionality
  - _Requirements: 5.5_

- [x] 19. Enhance task model and endpoints
  - Update task model with overdue flag
  - Create GET /api/tasks/:taskId endpoint with full details
  - Implement task assignment notifications
  - _Requirements: 6.1, 6.4_

- [ ]* 19.1 Write property test for overdue detection
  - **Property 6: Task Overdue Detection**
  - **Validates: Requirements 6.2**

- [x] 20. Implement task filtering endpoint
  - Create GET /api/projects/:projectId/tasks endpoint
  - Support filtering by status, priority, assignee
  - _Requirements: 6.5_

- [x] 21. Build project progress UI
  - Display progress bar
  - Show member workload
  - Display project timeline
  - Add archive button
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 22. Build enhanced task UI
  - Display task details with status
  - Show overdue indicators
  - Add filtering options
  - Display assignee information
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 23. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Integration & Polish

- [x] 24. Implement invitation expiration
  - Add background job to expire invitations after 30 days
  - Clean up expired invitations
  - _Requirements: 2.5_

- [x] 25. Add invitation cancellation
  - Implement DELETE /api/invitations/:invitationId endpoint
  - Send notification to invitee
  - _Requirements: 7.5_

- [x] 26. Implement status transition validation
  - Validate invitation status transitions
  - Prevent invalid state changes
  - _Requirements: 3.3, 3.4_

- [ ]* 26.1 Write property test for status consistency
  - **Property 4: Invitation Status Consistency**
  - **Validates: Requirements 3.3, 3.4**

- [x] 27. Add comprehensive error handling
  - Handle all error scenarios
  - Return appropriate HTTP status codes
  - Provide clear error messages
  - _Requirements: All_

- [ ] 28. Final testing and validation
  - Run all property-based tests
  - Run all unit tests
  - Test complete workflows
  - Verify all requirements met

- [ ] 29. Checkpoint - Final verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All endpoints should follow REST conventions
- All responses should use consistent error format
- All operations should be logged for audit trail
- All notifications should be sent asynchronously
- All user inputs should be validated and sanitized
- All operations should check user permissions
