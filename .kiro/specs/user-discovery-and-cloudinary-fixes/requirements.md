# Requirements Document

## Introduction

This feature enhances the user invitation workflow by creating a dedicated user discovery page with pagination and search capabilities, replacing the current modal-based search. Additionally, it addresses Cloudinary configuration and upload reliability issues to ensure consistent image upload functionality.

## Glossary

- **User Discovery Page**: A dedicated page where users can browse, search, and invite other users to teams
- **Invitation System**: The mechanism for sending team membership invitations to other users
- **Cloudinary**: Third-party cloud-based image management service used for avatar uploads
- **Pagination**: Breaking large lists of users into smaller pages for better performance and usability
- **Team Context**: The currently selected team for which invitations are being sent

## Requirements

### Requirement 1: User Discovery Page

**User Story:** As a team admin, I want a dedicated page to browse and search all users, so that I can easily find and invite people to my team without being constrained by a modal dialog.

#### Acceptance Criteria

1. WHEN a user navigates to the user discovery page THEN the system SHALL display a paginated list of all users with their avatars, names, and email addresses
2. WHEN the user discovery page loads THEN the system SHALL fetch and display the first page of users with a default page size of 20 users
3. WHEN a user clicks on pagination controls THEN the system SHALL load and display the requested page of users
4. WHEN a user types in the search field THEN the system SHALL filter users by name or email in real-time
5. WHEN search results are displayed THEN the system SHALL maintain pagination for the filtered results

### Requirement 2: Team Invitation from User Discovery

**User Story:** As a team admin, I want to send invitations directly from the user discovery page, so that I can quickly add members to my team.

#### Acceptance Criteria

1. WHEN a user views the user discovery page THEN the system SHALL display an "Invite to Team" button next to each user who is not already a team member
2. WHEN a user clicks "Invite to Team" THEN the system SHALL prompt for team selection if multiple teams exist
3. WHEN a team is selected and invitation is confirmed THEN the system SHALL send the invitation and update the UI to show invitation status
4. WHEN an invitation is successfully sent THEN the system SHALL display a success notification and disable the invite button for that user
5. WHEN a user is already a team member or has a pending invitation THEN the system SHALL display appropriate status text instead of the invite button

### Requirement 3: Navigation Integration

**User Story:** As a user, I want easy access to the user discovery page from the main navigation, so that I can quickly find and invite team members.

#### Acceptance Criteria

1. WHEN a user views the main navigation THEN the system SHALL display a "Find Users" or "Invite Members" link
2. WHEN a user clicks the navigation link THEN the system SHALL navigate to the user discovery page
3. WHEN a user is on the user discovery page THEN the system SHALL highlight the corresponding navigation item

### Requirement 4: Cloudinary Configuration Validation

**User Story:** As a system administrator, I want Cloudinary to be properly configured and validated on startup, so that image uploads work reliably without runtime errors.

#### Acceptance Criteria

1. WHEN the backend server starts THEN the system SHALL validate that all required Cloudinary environment variables are present
2. WHEN Cloudinary environment variables are missing THEN the system SHALL log a clear error message and prevent server startup
3. WHEN Cloudinary is configured THEN the system SHALL test the connection during startup and log the result
4. WHEN the Cloudinary configuration is invalid THEN the system SHALL provide actionable error messages indicating which credentials are incorrect

### Requirement 5: Cloudinary Upload Error Handling

**User Story:** As a user uploading an avatar, I want clear error messages when uploads fail, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN an image upload to Cloudinary fails THEN the system SHALL return a user-friendly error message to the frontend
2. WHEN a Cloudinary API error occurs THEN the system SHALL log the full error details on the backend for debugging
3. WHEN an upload fails due to file size limits THEN the system SHALL inform the user of the maximum allowed file size
4. WHEN an upload fails due to invalid file type THEN the system SHALL inform the user of the accepted file formats
5. WHEN network errors occur during upload THEN the system SHALL provide retry functionality or clear guidance to the user

### Requirement 6: Avatar Upload UI Feedback

**User Story:** As a user uploading a custom avatar, I want to see a preview of my selected image before uploading, so that I can confirm it's the correct image.

#### Acceptance Criteria

1. WHEN a user selects an image file for upload THEN the system SHALL display a preview of the selected image immediately
2. WHEN the preview is displayed THEN the system SHALL show the image in the avatar display area before upload
3. WHEN a user clicks the upload button THEN the system SHALL upload the image and update the avatar without requiring a page refresh
4. WHEN the upload completes successfully THEN the system SHALL display the uploaded image from Cloudinary
5. WHEN a user selects a different image THEN the system SHALL update the preview to show the new selection

### Requirement 7: Environment Variable Management

**User Story:** As a developer, I want consistent environment variable loading across the application, so that configuration works reliably in all environments.

#### Acceptance Criteria

1. WHEN the backend starts THEN the system SHALL load environment variables from the backend/.env file
2. WHEN environment variables are loaded THEN the system SHALL validate all required variables are present before starting services
3. WHEN the frontend builds THEN the system SHALL use environment variables from frontend/.env with the VITE_ prefix
4. WHEN environment variables are missing THEN the system SHALL provide clear error messages indicating which variables are required
