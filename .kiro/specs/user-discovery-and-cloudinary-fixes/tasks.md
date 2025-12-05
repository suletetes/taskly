# Implementation Plan

- [x] 1. Backend: Create user discovery endpoint with pagination
  - Create GET /api/users/discover endpoint in backend/routes/users.js
  - Implement pagination logic with page, limit, and search query parameters
  - Add MongoDB indexes on fullname, username, and email fields for search performance
  - Exclude current user from results
  - Support team context to exclude team members
  - Return paginated response with user data and pagination metadata
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write property test for pagination navigation
  - **Property 1: Pagination Navigation Correctness**
  - **Validates: Requirements 1.3**

- [ ]* 1.2 Write property test for search filtering
  - **Property 2: Search Filtering Accuracy**
  - **Validates: Requirements 1.4**

- [ ]* 1.3 Write property test for search pagination
  - **Property 3: Search Pagination Consistency**
  - **Validates: Requirements 1.5**

- [x] 2. Backend: Enhance invitation status checking
  - Add helper function to check user invitation status for a team
  - Return status: 'available', 'member', 'pending', or 'invited'
  - Optimize database queries to check membership and pending invitations
  - Add caching for invitation statuses to improve performance
  - _Requirements: 2.1, 2.5_

- [ ]* 2.1 Write property test for invite button visibility
  - **Property 4: Invite Button Visibility**
  - **Validates: Requirements 2.1**

- [ ]* 2.2 Write property test for invitation status display
  - **Property 5: Invitation Status Display**
  - **Validates: Requirements 2.5**

- [x] 3. Backend: Improve Cloudinary configuration validation
  - Add startup validation for Cloudinary environment variables
  - Create validateCloudinaryConfig() function in backend/config/cloudinary.js
  - Test Cloudinary connection on server startup
  - Log clear error messages for missing or invalid credentials
  - Prevent server startup if Cloudinary is not properly configured
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 3.1 Write property test for Cloudinary startup validation
  - **Property 7: Cloudinary Startup Validation**
  - **Validates: Requirements 4.1**

- [ ]* 3.2 Write property test for invalid credentials error
  - **Property 8: Invalid Cloudinary Credentials Error**
  - **Validates: Requirements 4.4**

- [x] 4. Backend: Enhance upload error handling
  - Improve error handling in backend/routes/upload.js
  - Add specific error messages for file size limits (5MB)
  - Add specific error messages for invalid file types
  - Add network error handling with retry suggestions
  - Log full error details on backend while returning user-friendly messages
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 4.1 Write property test for upload error clarity
  - **Property 9: Upload Error Message Clarity**
  - **Validates: Requirements 5.1**

- [ ]* 4.2 Write property test for error logging
  - **Property 10: Upload Error Logging**
  - **Validates: Requirements 5.2**

- [x] 5. Backend: Add environment variable validation
  - Create backend/utils/envValidation.js if it doesn't exist
  - Add validation for all required environment variables
  - Provide clear error messages for missing variables
  - Run validation before starting any services
  - _Requirements: 7.1, 7.2, 7.4_

- [ ]* 5.1 Write property test for environment validation
  - **Property 14: Environment Variable Validation**
  - **Validates: Requirements 7.2**

- [ ]* 5.2 Write property test for missing variable errors
  - **Property 15: Missing Environment Variable Errors**
  - **Validates: Requirements 7.4**

- [x] 6. Frontend: Create FindUsers page component
  - Create frontend/src/pages/FindUsers.jsx
  - Implement page layout with search bar and user grid
  - Add pagination controls at the bottom
  - Fetch users from /api/users/discover endpoint
  - Implement debounced search (300ms delay)
  - Handle loading and error states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 7. Frontend: Create UserDiscoveryCard component
  - Create frontend/src/components/users/UserDiscoveryCard.jsx
  - Display user avatar, name, email, and bio (truncated)
  - Show invitation status or invite button based on user state
  - Handle invite button click to open team selection
  - Show loading state during invitation sending
  - Update UI after successful invitation
  - _Requirements: 2.1, 2.4, 2.5_

- [ ]* 7.1 Write property test for invitation state update
  - **Property 6: Invitation State Update**
  - **Validates: Requirements 2.3**

- [x] 8. Frontend: Create TeamSelectionModal component
  - Create frontend/src/components/teams/TeamSelectionModal.jsx
  - Display list of user's teams
  - Allow selection of team for invitation
  - Show selected user information
  - Handle invitation submission with role and optional message
  - Display success/error notifications
  - _Requirements: 2.2, 2.3_

- [x] 9. Frontend: Add navigation link for Find Users
  - Update frontend/src/components/layout/Navigation.jsx
  - Add "Find Users" or "Invite Members" link to main navigation
  - Add route for /find-users in frontend/src/App.jsx
  - Highlight navigation item when on Find Users page
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 10. Frontend: Enhance avatar upload with preview
  - Update frontend/src/pages/Profile.jsx avatar upload modal
  - Add real-time preview when file is selected
  - Display preview in avatar area before upload
  - Update avatar immediately after successful upload without page refresh
  - Update preview when different image is selected
  - Add drag-and-drop support for file selection
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 10.1 Write property test for image preview accuracy
  - **Property 11: Image Preview Accuracy**
  - **Validates: Requirements 6.1**

- [ ]* 10.2 Write property test for avatar update without refresh
  - **Property 12: Avatar Upload Without Refresh**
  - **Validates: Requirements 6.3**

- [ ]* 10.3 Write property test for preview update on selection change
  - **Property 13: Preview Update on Selection Change**
  - **Validates: Requirements 6.5**

- [x] 11. Frontend: Update Settings page avatar upload
  - Update frontend/src/pages/Settings.jsx if it has avatar upload
  - Apply same preview and upload improvements as Profile page
  - Ensure consistency between Profile and Settings avatar upload
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Frontend: Add user service methods
  - Update frontend/src/services/userService.js
  - Add discoverUsers(query, page, limit, teamId) method
  - Add checkInvitationStatus(userId, teamId) method
  - Add proper error handling and response parsing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.5_

- [x] 13. Frontend: Add team service methods
  - Update frontend/src/services/teamService.js
  - Add sendInvitation(teamId, userId, role, message) method
  - Handle invitation response and errors
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Testing: Manual testing of user discovery flow
  - Test navigation to Find Users page
  - Test search functionality with various queries
  - Test pagination through multiple pages
  - Test sending invitations to users
  - Test invitation status display
  - Verify team member exclusion works correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 16. Testing: Manual testing of avatar upload flow
  - Test file selection and preview display
  - Test preset avatar selection
  - Test custom image upload to Cloudinary
  - Test avatar update without page refresh
  - Test error handling for oversized files
  - Test error handling for invalid file types
  - Verify old avatar is deleted from Cloudinary
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 5.1, 5.3, 5.4_

- [ ] 17. Testing: Manual testing of Cloudinary configuration
  - Test server startup with missing Cloudinary variables
  - Test server startup with invalid Cloudinary credentials
  - Verify error messages are clear and actionable
  - Test server startup with valid configuration
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 18. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
