# Implementation Plan: Team Features Fixes

## Overview

This implementation plan breaks down the team features fixes into actionable coding tasks. The plan follows an incremental approach, starting with backend verification and fixes, then moving to frontend components, and finally integrating everything together.

---

## Phase 1: Backend Verification and Fixes

- [x] 1. Verify and fix invitation endpoints
  - Verify `/api/invitations/user` endpoint returns user's invitations correctly
  - Verify `/api/invitations/:invitationId/accept` endpoint adds user to team
  - Verify `/api/invitations/:invitationId/deny` endpoint marks invitation as denied
  - Verify `/api/invitations/:invitationId` DELETE endpoint cancels invitations
  - Test all endpoints with valid and invalid data
  - _Requirements: 5.2, 5.3, 5.4_

- [ ]* 1.1 Write property test for invitation status transitions
  - **Property 2: Invitation Status Transitions**
  - **Validates: Requirements 5.3, 5.5**

- [x] 2. Verify and fix team endpoints
  - Verify `/api/teams/:teamId/stats` returns correct statistics
  - Verify `/api/teams/:teamId/members` returns all members with populated user data
  - Verify `/api/teams/:teamId/invitations` returns pending invitations
  - Verify permission checks on all team modification endpoints
  - _Requirements: 1.2, 1.3, 1.4, 2.4_

- [ ]* 2.1 Write property test for team member consistency
  - **Property 1: Team Member Consistency**
  - **Validates: Requirements 1.3, 2.4**

- [x] 3. Verify and fix notification endpoints
  - Verify `/api/notifications` returns user's notifications
  - Verify `/api/notifications/:id/read` marks notification as read
  - Verify `/api/notifications/:id` DELETE endpoint deletes notifications
  - Test notification creation on invitation events
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 3.1 Write property test for notification creation on invitation
  - **Property 5: Notification Creation on Invitation**
  - **Validates: Requirements 7.1**

- [x] 4. Verify and fix search endpoints
  - Verify `/api/search/users` returns users matching query
  - Verify `/api/teams/:teamId/search-users` returns users not in team
  - Test search by name, username, and email
  - _Requirements: 8.2, 8.3_

- [ ]* 4.1 Write property test for search results accuracy
  - **Property 8: Search Results Accuracy**
  - **Validates: Requirements 8.2, 8.3**

- [x] 5. Verify invite code generation and uniqueness
  - Verify invite codes are unique across all teams
  - Verify `/api/teams/:teamId/regenerate-invite` generates new code
  - Test that old code no longer works after regeneration
  - _Requirements: 3.1, 3.4_

- [ ]* 5.1 Write property test for invite code uniqueness
  - **Property 3: Invite Code Uniqueness**
  - **Validates: Requirements 3.4**

- [x] 6. Verify permission checks on all endpoints
  - Verify non-owners cannot modify team settings
  - Verify non-members cannot access team data
  - Verify only owners can delete teams
  - Test 403 responses for insufficient permissions
  - _Requirements: 2.7, 6.5_

- [ ]* 6.1 Write property test for permission-based access control
  - **Property 4: Permission-Based Access Control**
  - **Validates: Requirements 2.7, 6.5**

- [x] 7. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 2: Frontend Components - Invitations

- [x] 8. Create InvitationList component with accept/deny functionality
  - Create `frontend/src/pages/Invitations.jsx` page component
  - Fetch user's pending invitations from `/api/invitations/user`
  - Display invitations with team details, inviter info, and message
  - Implement Accept button that calls `/api/invitations/:id/accept`
  - Implement Deny button that calls `/api/invitations/:id/deny`
  - Handle loading and error states
  - Show success/error toasts on action completion
  - _Requirements: 5.2, 5.3, 5.4_

- [ ]* 8.1 Write property test for invitation acceptance flow
  - **Property 2: Invitation Status Transitions**
  - **Validates: Requirements 5.3, 5.5**

- [x] 9. Fix InvitationCard component
  - Update `frontend/src/components/invitations/InvitationCard.jsx`
  - Display invitation with team avatar, name, and description
  - Show inviter information
  - Display invitation message if present
  - Show accept/deny buttons with proper styling
  - Handle click events for accept/deny actions
  - _Requirements: 5.2_

- [x] 10. Fix InvitationList component
  - Update `frontend/src/components/invitations/InvitationList.jsx`
  - Map through invitations array and render InvitationCard for each
  - Handle empty state (no invitations)
  - Implement pagination if needed
  - _Requirements: 5.2_

---

## Phase 3: Frontend Components - Notifications

- [x] 11. Create NotificationCenter component
  - Create `frontend/src/components/notifications/NotificationCenter.jsx`
  - Fetch notifications from `/api/notifications`
  - Display notifications in a list with timestamps
  - Show notification type, title, and message
  - Implement mark as read functionality
  - Implement delete functionality
  - Handle empty state
  - _Requirements: 7.4_

- [ ]* 11.1 Write property test for notification display
  - **Property 5: Notification Creation on Invitation**
  - **Validates: Requirements 7.1**

- [x] 12. Create NotificationItem component
  - Create `frontend/src/components/notifications/NotificationItem.jsx`
  - Display individual notification with icon based on type
  - Show timestamp in relative format (e.g., "2 hours ago")
  - Implement click handler to navigate to relevant page
  - Implement mark as read on click
  - Implement delete button
  - _Requirements: 7.4, 7.5_

- [x] 13. Create NotificationBell component
  - Create `frontend/src/components/notifications/NotificationBell.jsx`
  - Display bell icon in header/navigation
  - Show unread notification count as badge
  - Implement dropdown to show recent notifications
  - Link to full notification center
  - _Requirements: 7.4_

- [x] 14. Integrate NotificationBell into Navigation
  - Update `frontend/src/components/layout/Navigation.jsx`
  - Add NotificationBell component to header
  - Position it near user profile/settings
  - Ensure it's visible on all pages
  - _Requirements: 7.4_

---

## Phase 4: Frontend Components - Team Dashboard

- [x] 15. Fix TeamDashboard page component
  - Update `frontend/src/pages/TeamDashboard.jsx`
  - Fetch team data from `/api/teams/:teamId`
  - Fetch team statistics from `/api/teams/:teamId/stats`
  - Fetch team members from `/api/teams/:teamId/members`
  - Fetch pending invitations from `/api/teams/:teamId/invitations`
  - Display statistics cards (members, projects, tasks, etc.)
  - Display team members list with roles and task completion
  - Display pending invitations
  - Add action buttons: View Dashboard, Team Settings, Invite Members, Leave Team
  - Handle loading and error states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 15.1 Write property test for team dashboard data consistency
  - **Property 1: Team Member Consistency**
  - **Validates: Requirements 1.3, 2.4**

- [x] 16. Fix TeamMembersList component
  - Update `frontend/src/components/teams/TeamMembersList.jsx`
  - Ensure members array is properly handled (check for undefined)
  - Display member avatar, name, username
  - Display member role as badge
  - Display task completion rate (completed/total)
  - Add remove button for non-owner members (if user has permission)
  - Handle click on remove button with confirmation
  - _Requirements: 1.3, 6.1_

- [x] 17. Add action buttons to TeamDashboard
  - Add "View Dashboard" button that navigates to team dashboard
  - Add "Team Settings" button that navigates to `/teams/:teamId/settings`
  - Add "Invite Members" button that opens invitation modal/form
  - Add "Leave Team" button that removes user from team
  - Implement proper permissions checks for each button
  - _Requirements: 2.1_

---

## Phase 5: Frontend Components - Team Settings

- [x] 18. Create dedicated TeamSettings page
  - Create `frontend/src/pages/TeamSettings.jsx` page component
  - Fetch team data from `/api/teams/:teamId`
  - Display tabs: General, Members, Invites, Danger Zone
  - Implement tab switching with smooth animations
  - Pass teamId to TeamSettings component
  - _Requirements: 2.1, 2.2_

- [x] 19. Implement General tab in TeamSettings
  - Update `frontend/src/components/teams/TeamSettings.jsx` General tab
  - Display form with team name, description, privacy settings
  - Implement form submission to `/api/teams/:teamId` PUT endpoint
  - Show success/error toasts
  - Disable form if user lacks permissions
  - _Requirements: 2.3, 2.7_

- [ ]* 19.1 Write property test for team settings update
  - **Property 4: Permission-Based Access Control**
  - **Validates: Requirements 2.7, 6.5**

- [x] 20. Implement Members tab in TeamSettings
  - Update `frontend/src/components/teams/TeamSettings.jsx` Members tab
  - Display all team members with roles and task counts
  - Implement role change dropdown (member/admin)
  - Call `/api/teams/:teamId/members/:userId` PUT endpoint on role change
  - Implement remove button with confirmation dialog
  - Call `/api/teams/:teamId/members/:userId` DELETE endpoint on confirm
  - Disable controls if user lacks permissions
  - _Requirements: 2.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 20.1 Write property test for member removal consistency
  - **Property 6: Member Removal Consistency**
  - **Validates: Requirements 6.4**

- [x] 21. Implement Invites tab in TeamSettings
  - Update `frontend/src/components/teams/TeamSettings.jsx` Invites tab
  - Display invite code with copy button
  - Implement show/hide toggle for invite code
  - Implement regenerate button that calls `/api/teams/:teamId/regenerate-invite`
  - Display invite link in format `/join/:inviteCode`
  - Implement copy button for invite link
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ]* 21.1 Write property test for invite code format
  - **Property 7: Invite Link Format**
  - **Validates: Requirements 3.5**

- [x] 22. Implement email invitations form in Invites tab
  - Add form to enter comma-separated email addresses
  - Add role selector (member/admin)
  - Add optional message field
  - Implement form submission to `/api/teams/:teamId/invitations`
  - Validate email addresses before submission
  - Show success message with count of invitations sent
  - Show error messages for invalid emails
  - Clear form after successful submission
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 22.1 Write property test for email invitation validation
  - **Property 4: Permission-Based Access Control**
  - **Validates: Requirements 2.7, 6.5**

- [x] 23. Implement Danger Zone tab in TeamSettings
  - Update `frontend/src/components/teams/TeamSettings.jsx` Danger Zone tab
  - Display delete team button (owner only)
  - Implement confirmation dialog with team name verification
  - Call `/api/teams/:teamId` DELETE endpoint on confirm
  - Redirect to teams list after deletion
  - _Requirements: 2.1_

---

## Phase 6: Frontend Components - User Search and Invitations

- [x] 24. Integrate UserSearch component in Invites tab
  - Update `frontend/src/components/teams/UserSearch.jsx`
  - Implement search input that calls `/api/teams/:teamId/search-users`
  - Display search results as user cards
  - Show user avatar, name, username, and email
  - Implement click handler to add user to invitation list
  - Show "No users found" message when no results
  - Debounce search queries to reduce API calls
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 24.1 Write property test for search results accuracy
  - **Property 8: Search Results Accuracy**
  - **Validates: Requirements 8.2, 8.3**

- [x] 25. Create join team page for invite codes
  - Create `frontend/src/pages/JoinTeam.jsx` page component
  - Extract invite code from URL query parameter or route
  - Call `/api/teams/join/:inviteCode` POST endpoint
  - Handle success: add user to team and redirect to team dashboard
  - Handle errors: display error message and provide navigation options
  - Handle already member case: show message and redirect
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 25.1 Write property test for join team flow
  - **Property 9: Invite Link Format**
  - **Validates: Requirements 3.5**

---

## Phase 7: Frontend Routing and Integration

- [x] 26. Add routes for new pages
  - Update `frontend/src/App.jsx` routes
  - Add route for `/invitations` page
  - Add route for `/teams/:teamId/settings` page
  - Add route for `/join/:inviteCode` page
  - Ensure routes are protected with ProtectedRoute where needed
  - _Requirements: 2.1, 5.2, 9.1_

- [x] 27. Update Navigation to include new links
  - Update `frontend/src/components/layout/Navigation.jsx`
  - Add link to Invitations page
  - Add link to Notifications
  - Ensure all navigation items are properly styled
  - _Requirements: 5.2, 7.4_

- [x] 28. Integrate TeamContext with new components
  - Update `frontend/src/context/TeamContext.jsx`
  - Add methods for fetching team statistics
  - Add methods for fetching team members
  - Add methods for fetching team invitations
  - Add methods for sending invitations
  - Add methods for updating team settings
  - Add methods for managing team members
  - Ensure all methods handle errors properly
  - _Requirements: 1.2, 1.3, 1.4, 2.3, 2.4, 4.2_

---

## Phase 8: Documentation Updates

- [ ] 29. Remove emoji from backend README
  - Update `backend/README.md`
  - Remove all emoji characters
  - Maintain all technical content and formatting
  - Verify all sections are still clear and readable
  - _Requirements: 10.1, 10.4_

- [ ] 30. Remove emoji from frontend README
  - Update `frontend/README.md`
  - Remove all emoji characters
  - Maintain all technical content and formatting
  - Verify all sections are still clear and readable
  - _Requirements: 10.2, 10.4_

- [ ] 31. Remove emoji from root README
  - Update `Readme.md`
  - Remove all emoji characters
  - Maintain all technical content and formatting
  - Verify all sections are still clear and readable
  - _Requirements: 10.3, 10.4_

---

## Phase 9: Testing and Validation

- [ ] 32. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 33. Manual testing of complete invitation flow
  - Test sending invitation via email
  - Test receiving invitation notification
  - Test accepting invitation
  - Test user being added to team
  - Test team owner receiving notification
  - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2_

- [ ] 34. Manual testing of team settings
  - Test editing team name and description
  - Test changing member roles
  - Test removing members
  - Test regenerating invite code
  - Test copying invite code and link
  - Test deleting team (owner only)
  - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 6.2, 6.3, 6.4_

- [ ] 35. Manual testing of join team flow
  - Test joining team with valid invite code
  - Test error handling for invalid code
  - Test error handling for expired code
  - Test error handling for already member
  - Test notification creation on join
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 36. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
