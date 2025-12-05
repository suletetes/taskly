# Team Invitations & Enhanced Features - Design Document

## Overview

This design document outlines the implementation of an enhanced team invitation system with user search, invitation management, and additional features for teams, projects, and tasks. The system enables seamless team collaboration through intuitive invitation workflows and improved team/project/task management capabilities.

## Architecture

### System Components

1. **User Search Service** - Searches users by username, email, or full name
2. **Invitation Service** - Manages invitation creation, acceptance, and denial
3. **Notification Service** - Sends notifications for invitations and team activities
4. **Team Management Service** - Handles team operations and statistics
5. **Project Management Service** - Manages project features and progress
6. **Task Management Service** - Handles task assignments and tracking

### Data Flow

```
User Search → Select User → Send Invitation → Notification
                                    ↓
                            Invitation Created
                                    ↓
                        User Receives Notification
                                    ↓
                        Accept/Deny Invitation
                                    ↓
                    Add to Team / Reject Request
```

## Components and Interfaces

### 1. User Search Component

**Purpose**: Search for users to invite to team

**Inputs**:
- Search query (string)
- Team ID (string)

**Outputs**:
- List of matching users with profile info
- Excluded: current team members

**Features**:
- Real-time search results
- Display user avatar, name, username, email
- Show "Already a member" indicator
- Pagination for large result sets

### 2. Invitation Management Component

**Purpose**: Display and manage pending invitations

**Inputs**:
- User ID (string)
- Team ID (string)

**Outputs**:
- List of pending invitations
- Accept/Deny buttons
- Team information display

**Features**:
- Show team avatar and details
- Display inviter information
- Accept/Deny actions
- Invitation timestamp

### 3. Team Members Component

**Purpose**: Display team members and manage invitations

**Inputs**:
- Team ID (string)

**Outputs**:
- List of team members
- Pending invitations count
- Team statistics

**Features**:
- Member list with roles
- Last active status
- Join dates
- Remove member option
- Send invitation interface

### 4. Project Progress Component

**Purpose**: Display project progress and member assignments

**Inputs**:
- Project ID (string)

**Outputs**:
- Progress percentage
- Member task counts
- Timeline information

**Features**:
- Progress bar
- Member workload display
- Project dates
- Archive option

### 5. Task Management Component

**Purpose**: Display and manage tasks with enhanced features

**Inputs**:
- Task ID (string)
- Project ID (string)

**Outputs**:
- Task details with status
- Assignee information
- Overdue indicators

**Features**:
- Status display
- Priority indicators
- Overdue warnings
- Filter options
- Assignment notifications

## Data Models

### Invitation Model

```javascript
{
  _id: ObjectId,
  team: ObjectId (ref: Team),
  inviter: ObjectId (ref: User),
  invitee: ObjectId (ref: User),
  status: 'pending' | 'accepted' | 'denied',
  message: String (optional),
  createdAt: Date,
  respondedAt: Date (optional),
  expiresAt: Date (30 days from creation)
}
```

### Team Model (Enhanced)

```javascript
{
  // existing fields...
  pendingInvitations: [ObjectId],
  statistics: {
    memberCount: Number,
    projectCount: Number,
    taskCount: Number,
    activeMembers: Number
  },
  lastActivity: Date
}
```

### Project Model (Enhanced)

```javascript
{
  // existing fields...
  progress: Number (0-100),
  archived: Boolean,
  memberWorkload: {
    userId: Number (task count)
  }
}
```

### Task Model (Enhanced)

```javascript
{
  // existing fields...
  overdue: Boolean,
  notificationSent: Boolean,
  completedAt: Date (optional)
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Invitation Uniqueness
*For any* team and user pair, there should be at most one pending invitation at any time. Attempting to send a duplicate invitation should be rejected.
**Validates: Requirements 2.3**

### Property 2: Invitation Acceptance Idempotence
*For any* accepted invitation, accepting it again should have no additional effect. The user should remain a team member.
**Validates: Requirements 3.3**

### Property 3: Search Excludes Members
*For any* search query in a team context, the results should never include users who are already team members.
**Validates: Requirements 1.3, 1.4**

### Property 4: Invitation Status Consistency
*For any* invitation, the status should accurately reflect the user's response. Accepted invitations should result in team membership.
**Validates: Requirements 3.3, 3.4**

### Property 5: Project Progress Accuracy
*For any* project, the progress percentage should equal (completed tasks / total tasks) * 100, rounded to nearest integer.
**Validates: Requirements 5.1**

### Property 6: Task Overdue Detection
*For any* task with a due date in the past and status not completed, the overdue flag should be true.
**Validates: Requirements 6.2**

### Property 7: Member Removal Cascade
*For any* team member removal, that user should be removed from all projects within the team.
**Validates: Requirements 4.4**

### Property 8: Notification Delivery
*For any* invitation sent, a notification should be created for the invitee within the system.
**Validates: Requirements 8.1**

## Error Handling

### Invitation Errors
- Duplicate invitation: Return 409 Conflict
- User not found: Return 404 Not Found
- User already member: Return 409 Conflict
- Expired invitation: Return 410 Gone
- Invalid status transition: Return 400 Bad Request

### Search Errors
- Invalid search query: Return 400 Bad Request
- Team not found: Return 404 Not Found
- Unauthorized access: Return 403 Forbidden

### Notification Errors
- Email service unavailable: Log error, continue with in-app notification
- Invalid recipient: Skip notification, log error

## Testing Strategy

### Unit Testing

- Test invitation creation with valid/invalid data
- Test search filtering logic
- Test status transitions
- Test progress calculation
- Test overdue detection

### Property-Based Testing

- Generate random users and teams, verify search excludes members
- Generate random invitations, verify uniqueness constraint
- Generate random tasks, verify progress calculation
- Generate random task states, verify overdue detection
- Generate random member removals, verify cascade deletion

### Integration Testing

- Test complete invitation workflow (search → send → accept)
- Test notification delivery
- Test team member management
- Test project progress updates
- Test task assignment notifications

## API Endpoints

### User Search
- `GET /api/teams/:teamId/search-users?query=<search>`

### Invitations
- `POST /api/teams/:teamId/invitations` - Send invitation
- `GET /api/users/invitations` - Get user's pending invitations
- `PUT /api/invitations/:invitationId/accept` - Accept invitation
- `PUT /api/invitations/:invitationId/deny` - Deny invitation
- `GET /api/teams/:teamId/invitations` - Get team's invitations

### Team Management
- `GET /api/teams/:teamId/statistics` - Get team stats
- `GET /api/teams/:teamId/members` - Get team members with details

### Project Management
- `GET /api/projects/:projectId/progress` - Get project progress
- `PUT /api/projects/:projectId/archive` - Archive project

### Task Management
- `GET /api/tasks/:taskId` - Get task with enhanced details
- `GET /api/projects/:projectId/tasks?filter=<status|priority|assignee>` - Get filtered tasks

## Implementation Phases

### Phase 1: User Search & Invitations
- Implement user search endpoint
- Create invitation model and endpoints
- Build search UI component
- Build invitation management UI

### Phase 2: Invitation Acceptance
- Implement accept/deny endpoints
- Create notification system
- Build user invitations UI
- Add email notifications

### Phase 3: Team Enhancements
- Add team statistics
- Implement member management
- Add team activity tracking
- Build team dashboard

### Phase 4: Project & Task Enhancements
- Implement project progress calculation
- Add project archiving
- Enhance task management
- Add task filtering and notifications

## Security Considerations

- Only team owners/admins can send invitations
- Users can only see their own invitations
- Invitations expire after 30 days
- Prevent duplicate invitations
- Validate all user inputs
- Check permissions on all operations
