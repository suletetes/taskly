# Design Document: Team Features Fixes

## Overview

This design document outlines the architecture and implementation strategy for fixing critical issues in Taskly's team management features. The fixes address non-functional buttons, missing frontend components, and incomplete invitation/notification systems. The solution involves:

1. Fixing the team dashboard page routing and data fetching
2. Creating a dedicated team settings page (not just modal)
3. Implementing complete invitation acceptance flow with frontend
4. Building notification UI components
5. Fixing search endpoints for user discovery
6. Removing emoji from documentation

## Architecture

### Frontend Architecture

```
Pages/
├── TeamDashboard.jsx (existing - needs fixes)
├── TeamSettings.jsx (existing - needs fixes)
└── Invitations.jsx (new - for viewing/managing invitations)

Components/
├── teams/
│   ├── TeamDashboard.jsx (dashboard component)
│   ├── TeamSettings.jsx (settings modal/component)
│   ├── TeamMembersList.jsx (existing - needs fixes)
│   ├── InvitationModal.jsx (existing - needs integration)
│   └── UserSearch.jsx (existing - needs integration)
├── invitations/
│   ├── InvitationList.jsx (existing - needs fixes)
│   ├── InvitationCard.jsx (existing - needs fixes)
│   └── AcceptInvitationFlow.jsx (new)
└── notifications/
    ├── NotificationCenter.jsx (new)
    ├── NotificationItem.jsx (new)
    └── NotificationBell.jsx (new)

Services/
├── api.js (existing - needs verification)
└── invitationService.js (new - for invitation operations)

Context/
├── TeamContext.jsx (existing - needs enhancements)
├── NotificationContext.jsx (existing - needs implementation)
└── InvitationContext.jsx (new - for invitation state)
```

### Backend Architecture

```
Routes/
├── teams.js (existing - needs verification)
├── invitations.js (existing - needs fixes)
└── notifications.js (existing - needs implementation)

Controllers/
├── teamController.js (existing - needs verification)
├── invitationController.js (existing - needs fixes)
└── notificationController.js (existing - needs implementation)

Models/
├── Team.js (existing)
├── Invitation.js (existing)
└── Notification.js (existing)
```

## Components and Interfaces

### Frontend Components

#### 1. TeamDashboard Page
- Displays team statistics, members, and pending invitations
- Fetches data from `/api/teams/:teamId/stats`, `/api/teams/:teamId/members`, `/api/teams/:teamId/invitations`
- Shows action buttons: View Dashboard, Team Settings, Invite Members, Leave Team
- Handles loading and error states

#### 2. TeamSettings Page
- Dedicated page at `/teams/:teamId/settings`
- Contains tabs: General, Members, Invites, Danger Zone
- General tab: Edit team name, description, privacy settings
- Members tab: View/manage team members, change roles, remove members
- Invites tab: Display invite code, copy/regenerate, send email invitations
- Danger Zone tab: Delete team (owner only)

#### 3. Invitations Page
- Displays all pending invitations for the user
- Shows invitation details: team name, inviter, message, date
- Action buttons: Accept, Deny
- Handles invitation acceptance flow

#### 4. Notification Components
- NotificationCenter: Main notification display area
- NotificationItem: Individual notification card
- NotificationBell: Icon with unread count in header

#### 5. User Search Component
- Search interface for finding users to invite
- Displays search results with user cards
- Allows selecting users for invitation

### Backend Endpoints

#### Team Endpoints
- `GET /api/teams/:teamId/stats` - Get team statistics (existing)
- `GET /api/teams/:teamId/members` - Get team members (existing)
- `GET /api/teams/:teamId/invitations` - Get team invitations (existing)
- `POST /api/teams/:teamId/invitations` - Send invitations (existing)
- `PUT /api/teams/:teamId` - Update team (existing)
- `DELETE /api/teams/:teamId` - Delete team (existing)

#### Invitation Endpoints
- `GET /api/invitations/user` - Get user's invitations (existing)
- `POST /api/invitations/:invitationId/accept` - Accept invitation (existing)
- `POST /api/invitations/:invitationId/deny` - Deny invitation (existing)
- `DELETE /api/invitations/:invitationId` - Cancel invitation (existing)

#### Notification Endpoints
- `GET /api/notifications` - Get user notifications (existing)
- `PATCH /api/notifications/:id/read` - Mark as read (existing)
- `DELETE /api/notifications/:id` - Delete notification (existing)

#### Search Endpoints
- `GET /api/search/users` - Search users (existing)
- `GET /api/teams/:teamId/search-users` - Search users for team (existing)

## Data Models

### Team Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId (User),
  members: [{
    user: ObjectId (User),
    role: String (owner/admin/member),
    joinedAt: Date,
    permissions: Object
  }],
  projects: [ObjectId (Project)],
  inviteCode: String (unique),
  isPrivate: Boolean,
  settings: {
    maxMembers: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Invitation Model
```javascript
{
  _id: ObjectId,
  team: ObjectId (Team),
  inviter: ObjectId (User),
  invitee: ObjectId (User),
  role: String (admin/member),
  status: String (pending/accepted/denied/cancelled),
  message: String,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (User),
  type: String (invitation_received/invitation_accepted/member_joined/etc),
  title: String,
  message: String,
  read: Boolean,
  data: Object (contextual data),
  createdAt: Date,
  updatedAt: Date
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Team Member Consistency
*For any* team, the members list returned from the API should match the members stored in the database, with all user references properly populated.
**Validates: Requirements 1.3, 2.4**

### Property 2: Invitation Status Transitions
*For any* invitation, accepting it should transition its status from pending to accepted, and the invitee should be added to the team members list.
**Validates: Requirements 5.3, 5.5**

### Property 3: Invite Code Uniqueness
*For any* team, the invite code should be unique across all teams in the database, and regenerating it should produce a different code.
**Validates: Requirements 3.4**

### Property 4: Permission-Based Access Control
*For any* user without owner/admin role, attempting to modify team settings should fail with a 403 Forbidden response.
**Validates: Requirements 2.7, 6.5**

### Property 5: Notification Creation on Invitation
*For any* invitation sent to a user, a corresponding notification should be created in the database with type 'invitation_received'.
**Validates: Requirements 7.1**

### Property 6: Member Removal Consistency
*For any* team member removed from a team, they should no longer appear in the team's members list and should be removed from all team projects.
**Validates: Requirements 6.4**

### Property 7: Invite Link Format
*For any* team, the invite link should be in the format `{origin}/join/:inviteCode` where inviteCode matches the team's inviteCode.
**Validates: Requirements 3.5**

### Property 8: Search Results Accuracy
*For any* search query, the returned users should match the query by name, username, or email, and should not include users already in the team.
**Validates: Requirements 8.2, 8.3**

## Error Handling

### Frontend Error Handling
- Display user-friendly error messages for API failures
- Show loading states during async operations
- Implement retry mechanisms for failed requests
- Handle 401 (unauthorized) and 403 (forbidden) responses appropriately
- Validate form inputs before submission

### Backend Error Handling
- Return appropriate HTTP status codes (400, 401, 403, 404, 500)
- Include error messages and error codes in responses
- Log errors for debugging
- Validate all inputs using express-validator
- Handle database errors gracefully

### Specific Error Cases
- Invalid invite code: Return 404 with "Invalid invite code" message
- User already in team: Return 409 with "User is already a team member" message
- Insufficient permissions: Return 403 with "Insufficient permissions" message
- Team not found: Return 404 with "Team not found" message
- Invitation expired: Return 400 with "Invitation has expired" message

## Testing Strategy

### Unit Testing
- Test individual components in isolation
- Test API response formatting
- Test data validation functions
- Test permission checking logic
- Test notification creation logic

### Property-Based Testing
- Test that team member lists are always consistent with database
- Test that invitation status transitions are valid
- Test that invite codes are always unique
- Test that permission checks always work correctly
- Test that notifications are created for all invitation events
- Test that member removal is consistent across team and projects
- Test that invite links are always properly formatted
- Test that search results are accurate and don't include team members

### Integration Testing
- Test complete invitation flow: send → receive → accept → join team
- Test team settings page: load → edit → save
- Test member management: add → change role → remove
- Test invite code sharing: copy → regenerate → share
- Test notification display and interaction
- Test search and user selection for invitations

### Test Coverage
- Aim for 80%+ code coverage on critical paths
- Focus on happy path and error cases
- Test edge cases (empty lists, expired invitations, etc.)
- Test permission boundaries

## Implementation Notes

### Frontend Fixes Needed
1. Fix TeamDashboard page routing and component integration
2. Create dedicated TeamSettings page (not just modal)
3. Implement InvitationList component with accept/deny functionality
4. Create NotificationCenter and related components
5. Integrate UserSearch component in invitation flow
6. Fix API calls to use correct endpoints
7. Add proper error handling and loading states
8. Implement real-time updates for notifications

### Backend Fixes Needed
1. Verify all invitation endpoints are working correctly
2. Ensure notification creation on invitation events
3. Verify search endpoints return correct results
4. Add proper permission checks on all endpoints
5. Ensure invite code is unique and properly formatted
6. Test all error cases and responses

### Documentation Updates
1. Remove all emoji from README files
2. Update API documentation with correct endpoints
3. Add troubleshooting section for common issues
4. Document invitation flow and notification system

## Performance Considerations

- Implement pagination for large member lists
- Cache team data to reduce API calls
- Use lazy loading for team members and invitations
- Implement debouncing for search queries
- Use React.memo for list items to prevent unnecessary re-renders
- Implement virtual scrolling for large lists if needed

## Security Considerations

- Validate all user inputs on both frontend and backend
- Implement rate limiting on invitation endpoints
- Ensure invite codes cannot be guessed (use cryptographically secure random)
- Verify user permissions before allowing team modifications
- Sanitize all user-provided data
- Use HTTPS for all API calls
- Implement CSRF protection if needed
