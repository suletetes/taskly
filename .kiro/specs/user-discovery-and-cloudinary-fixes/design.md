# Design Document

## Overview

This feature introduces a dedicated user discovery page that replaces the modal-based invitation search with a full-page experience featuring pagination, advanced search, and streamlined invitation workflows. Additionally, it enhances Cloudinary integration with better configuration validation, error handling, and real-time avatar preview functionality.

The design focuses on improving user experience for team building while ensuring reliable image upload functionality across the application.

## Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Navigation                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dashboard │ Tasks │ Teams │ Find Users │ Profile   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Find Users Page                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Search Bar                                           │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │    Search by name or email...                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Cards Grid (Paginated)                         │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │  │
│  │  │ Avatar │  │ Avatar │  │ Avatar │  │ Avatar │    │  │
│  │  │ Name   │  │ Name   │  │ Name   │  │ Name   │    │  │
│  │  │ Email  │  │ Email  │  │ Email  │  │ Email  │    │  │
│  │  │[Invite]│  │[Member]│  │[Invite]│  │[Pending]│   │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pagination Controls                                  │  │
│  │  ◀ Previous  [1] [2] [3] ... [10]  Next ▶           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  GET /api/users/discover                             │  │
│  │  POST /api/teams/:teamId/invitations                 │  │
│  │  POST /api/upload/avatar                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  UserDiscoveryService                                 │  │
│  │  - searchUsers(query, page, limit)                   │  │
│  │  - getUserInvitationStatus(userId, teamId)           │  │
│  │                                                        │  │
│  │  CloudinaryService                                    │  │
│  │  - validateConfig()                                   │  │
│  │  - uploadImage(file)                                  │  │
│  │  - deleteImage(publicId)                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB Collections                                  │  │
│  │  - users                                              │  │
│  │  - teams                                              │  │
│  │  - invitations                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. FindUsersPage Component

**Location:** `frontend/src/pages/FindUsers.jsx`

**Props:** None (uses URL params and context)

**State:**
```typescript
{
  users: User[],
  loading: boolean,
  error: string | null,
  searchQuery: string,
  currentPage: number,
  totalPages: number,
  selectedTeam: Team | null,
  invitationStatuses: Map<userId, status>
}
```

**Key Methods:**
- `fetchUsers(page, query)` - Fetch paginated user list
- `handleSearch(query)` - Debounced search handler
- `handleInvite(userId)` - Open team selection and send invitation
- `checkInvitationStatus(userId)` - Check if user is already member/invited

#### 2. UserDiscoveryCard Component

**Location:** `frontend/src/components/users/UserDiscoveryCard.jsx`

**Props:**
```typescript
{
  user: User,
  onInvite: (userId: string) => void,
  invitationStatus: 'available' | 'member' | 'pending' | 'invited',
  loading: boolean
}
```

**Renders:**
- User avatar
- Full name
- Email address
- Bio (truncated)
- Action button (Invite / Member / Pending)

#### 3. TeamSelectionModal Component

**Location:** `frontend/src/components/teams/TeamSelectionModal.jsx`

**Props:**
```typescript
{
  isOpen: boolean,
  onClose: () => void,
  onSelectTeam: (teamId: string) => void,
  user: User,
  teams: Team[]
}
```

**Purpose:** Allow user to select which team to invite the user to

#### 4. AvatarUploadPreview Component

**Location:** `frontend/src/components/profile/AvatarUploadPreview.jsx`

**Props:**
```typescript
{
  currentAvatar: string,
  onUpload: (file: File) => Promise<void>,
  onSelectPreset: (avatarUrl: string) => void,
  presetAvatars: string[]
}
```

**Features:**
- Real-time file preview before upload
- Drag-and-drop support
- Preset avatar selection
- Upload progress indicator

### Backend Endpoints

#### 1. User Discovery Endpoint

```
GET /api/users/discover
```

**Query Parameters:**
```typescript
{
  q?: string,           // Search query
  page?: number,        // Page number (default: 1)
  limit?: number,       // Items per page (default: 20)
  teamId?: string       // Exclude team members
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    users: User[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      pages: number
    }
  }
}
```

#### 2. Enhanced Invitation Endpoint

```
POST /api/teams/:teamId/invitations
```

**Request Body:**
```typescript
{
  userId: string,
  role: 'member' | 'admin',
  message?: string
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    invitation: Invitation
  },
  message: string
}
```

#### 3. Avatar Upload with Preview

```
POST /api/upload/avatar
```

**Request:** `multipart/form-data` with `avatar` file

**Response:**
```typescript
{
  success: boolean,
  data: {
    avatar: string,      // Cloudinary URL
    publicId: string,    // Cloudinary public ID
    preview: string      // Thumbnail URL
  },
  message: string
}
```

## Data Models

### User Discovery Response

```typescript
interface UserDiscoveryItem {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
  lastActive: Date;
  invitationStatus?: 'available' | 'member' | 'pending';
}
```

### Invitation Status

```typescript
interface InvitationStatus {
  userId: string;
  teamId: string;
  status: 'available' | 'member' | 'pending' | 'invited';
  invitedAt?: Date;
  invitedBy?: string;
}
```

### Cloudinary Configuration

```typescript
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
  maxFileSize: number;
  allowedFormats: string[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Pagination Navigation Correctness
*For any* page number clicked in pagination controls, the system should load and display the correct set of users for that page without duplicates or missing users.
**Validates: Requirements 1.3**

### Property 2: Search Filtering Accuracy
*For any* search query string, all returned users should have the query present in their fullname, username, or email (case-insensitive), and no users matching the query should be excluded.
**Validates: Requirements 1.4**

### Property 3: Search Pagination Consistency
*For any* search query with results, pagination should work correctly with the filtered results, maintaining consistent total counts and page boundaries.
**Validates: Requirements 1.5**

### Property 4: Invite Button Visibility
*For any* user displayed in the discovery page, an "Invite to Team" button should appear if and only if the user is not already a member of the selected team and has no pending invitation.
**Validates: Requirements 2.1**

### Property 5: Invitation Status Display
*For any* user who is already a team member or has a pending invitation, the system should display the appropriate status text ("Member", "Pending", etc.) instead of an invite button.
**Validates: Requirements 2.5**

### Property 6: Invitation State Update
*For any* successfully sent invitation, the system should update the UI to show the new status and disable further invitation attempts for that user-team combination.
**Validates: Requirements 2.3**

### Property 7: Cloudinary Startup Validation
*For any* server startup attempt, if required Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing, the server should fail to start with a clear error message.
**Validates: Requirements 4.1**

### Property 8: Invalid Cloudinary Credentials Error
*For any* invalid Cloudinary configuration, the system should provide actionable error messages indicating which specific credentials are incorrect or invalid.
**Validates: Requirements 4.4**

### Property 9: Upload Error Message Clarity
*For any* failed image upload, the error message should clearly indicate the specific reason (file size exceeded, invalid file type, network error) without exposing sensitive system information.
**Validates: Requirements 5.1**

### Property 10: Upload Error Logging
*For any* Cloudinary API error, the system should log the full error details on the backend for debugging while returning a user-friendly message to the frontend.
**Validates: Requirements 5.2**

### Property 11: Image Preview Accuracy
*For any* valid image file selected by the user, the preview displayed should accurately represent the selected file before upload.
**Validates: Requirements 6.1**

### Property 12: Avatar Upload Without Refresh
*For any* successful image upload, the system should update the displayed avatar with the Cloudinary URL without requiring a page refresh.
**Validates: Requirements 6.3**

### Property 13: Preview Update on Selection Change
*For any* change in selected image file, the preview should immediately update to show the newly selected image.
**Validates: Requirements 6.5**

### Property 14: Environment Variable Validation
*For any* backend startup, the system should validate that all required environment variables are present before starting services, and provide clear error messages for any missing variables.
**Validates: Requirements 7.2**

### Property 15: Missing Environment Variable Errors
*For any* missing required environment variable, the system should provide a clear error message indicating which specific variable is required and where it should be defined.
**Validates: Requirements 7.4**

## Error Handling

### Frontend Error Handling

1. **Network Errors**
   - Display user-friendly toast notifications
   - Provide retry mechanisms for failed requests
   - Show loading states during operations

2. **Validation Errors**
   - Inline validation for search queries
   - File type and size validation before upload
   - Clear error messages for invalid inputs

3. **State Management Errors**
   - Graceful degradation when data is unavailable
   - Fallback UI for empty states
   - Error boundaries for component failures

### Backend Error Handling

1. **Cloudinary Errors**
   ```javascript
   try {
     const result = await cloudinary.uploader.upload(file);
     return result;
   } catch (error) {
     if (error.http_code === 413) {
       throw new Error('File size exceeds 5MB limit');
     } else if (error.message.includes('Invalid image file')) {
       throw new Error('Invalid file format. Please upload JPG, PNG, or GIF');
     } else {
       logger.error('Cloudinary upload failed:', error);
       throw new Error('Image upload failed. Please try again');
     }
   }
   ```

2. **Database Errors**
   - Transaction rollback for failed operations
   - Proper error logging with context
   - User-friendly error messages

3. **Validation Errors**
   - Input sanitization
   - Schema validation
   - Clear error responses with field-level details

## Testing Strategy

### Unit Tests

1. **User Discovery Service**
   - Test pagination logic
   - Test search filtering
   - Test team member exclusion
   - Test invitation status calculation

2. **Cloudinary Service**
   - Test configuration validation
   - Test file upload with mocked Cloudinary
   - Test error handling for various failure scenarios
   - Test file deletion

3. **Avatar Upload Component**
   - Test file selection and preview
   - Test preset avatar selection
   - Test upload progress display
   - Test error state rendering

### Property-Based Tests

We will use **fast-check** for JavaScript/TypeScript property-based testing.

**Configuration:** Each property test should run a minimum of 100 iterations.

1. **Property Test: Pagination Consistency**
   - Generate random page numbers and limits
   - Verify total count consistency
   - Verify no duplicate users across pages
   - **Feature: user-discovery-and-cloudinary-fixes, Property 1: Pagination Consistency**

2. **Property Test: Search Result Relevance**
   - Generate random search queries
   - Verify all results contain query string
   - Test case-insensitive matching
   - **Feature: user-discovery-and-cloudinary-fixes, Property 2: Search Result Relevance**

3. **Property Test: Invitation Status Accuracy**
   - Generate random user/team combinations
   - Verify status matches database state
   - Test status transitions
   - **Feature: user-discovery-and-cloudinary-fixes, Property 3: Invitation Status Accuracy**

4. **Property Test: Team Member Exclusion**
   - Generate random teams with members
   - Verify members don't appear in discovery
   - Test edge cases (owner, admins, regular members)
   - **Feature: user-discovery-and-cloudinary-fixes, Property 4: Team Member Exclusion**

5. **Property Test: Avatar Preview Consistency**
   - Generate random image files
   - Verify preview matches selected file
   - Verify uploaded URL matches Cloudinary response
   - **Feature: user-discovery-and-cloudinary-fixes, Property 5: Avatar Preview Consistency**

6. **Property Test: Upload Error Clarity**
   - Generate various invalid inputs (oversized files, wrong types, etc.)
   - Verify error messages are clear and specific
   - Verify no sensitive data in error messages
   - **Feature: user-discovery-and-cloudinary-fixes, Property 7: Upload Error Clarity**

### Integration Tests

1. **End-to-End User Discovery Flow**
   - Navigate to Find Users page
   - Perform search
   - Paginate through results
   - Send invitation
   - Verify invitation received

2. **End-to-End Avatar Upload Flow**
   - Select image file
   - Verify preview displays
   - Upload to Cloudinary
   - Verify avatar updates across app
   - Verify old avatar deleted from Cloudinary

3. **Cloudinary Configuration Validation**
   - Test server startup with missing credentials
   - Test server startup with invalid credentials
   - Verify error messages and server behavior

## Implementation Notes

### Performance Considerations

1. **Pagination**
   - Use MongoDB skip/limit for efficient pagination
   - Index user fields used in search (fullname, username, email)
   - Cache invitation statuses for current page

2. **Search**
   - Debounce search input (300ms)
   - Use MongoDB text indexes for full-text search
   - Limit search results to reasonable maximum (50 per page)

3. **Image Upload**
   - Client-side image compression before upload
   - Progress indicators for large files
   - Cloudinary transformations for optimal delivery

### Security Considerations

1. **User Discovery**
   - Require authentication for all discovery endpoints
   - Rate limit search requests
   - Sanitize search queries to prevent injection

2. **Invitations**
   - Verify user has permission to invite to team
   - Prevent invitation spam with rate limiting
   - Validate team membership before sending

3. **Image Upload**
   - Validate file types on both client and server
   - Enforce file size limits
   - Scan uploaded images for malicious content
   - Use signed URLs for Cloudinary uploads

### Accessibility

1. **Keyboard Navigation**
   - Full keyboard support for user cards
   - Tab order follows visual layout
   - Focus indicators on all interactive elements

2. **Screen Readers**
   - Proper ARIA labels for search and pagination
   - Announce search results count
   - Announce invitation status changes

3. **Visual Design**
   - High contrast for text and buttons
   - Clear visual feedback for actions
   - Responsive design for all screen sizes
