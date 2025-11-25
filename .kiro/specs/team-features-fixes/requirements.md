# Requirements Document: Team Features Fixes

## Introduction

This document outlines the requirements for fixing critical issues in the team management features of Taskly. The team dashboard, settings, and invitation system have several non-functional components that prevent users from managing teams effectively. This includes broken buttons, missing frontend components for invitations and notifications, and non-functional search endpoints.

## Glossary

- **Team Dashboard**: The main page displaying team statistics, members, and pending invitations
- **Team Settings**: Modal/page for managing team configuration, members, and invitations
- **Invitation System**: Backend and frontend components for sending and accepting team invitations
- **Invite Code**: A unique code that allows users to join a team
- **Invite Link**: A shareable URL containing the invite code for team joining
- **Notification System**: In-app notifications for team events (invitations, member joins, etc.)
- **Search Endpoint**: API endpoint for searching users to invite to teams

## Requirements

### Requirement 1: Team Dashboard Navigation

**User Story:** As a team member, I want to navigate to the team dashboard and see all team information, so that I can manage team activities effectively.

#### Acceptance Criteria

1. WHEN a user navigates to `/teams/:teamId` THEN the system SHALL display the team dashboard with statistics, members list, and pending invitations
2. WHEN the team dashboard loads THEN the system SHALL fetch and display team statistics (member count, projects, tasks, etc.)
3. WHEN the team dashboard loads THEN the system SHALL fetch and display all team members with their roles and task completion rates
4. WHEN the team dashboard loads THEN the system SHALL fetch and display pending invitations sent by the team
5. IF the user is not a team member THEN the system SHALL display an error message and prevent access to the dashboard

### Requirement 2: Team Settings Modal/Page

**User Story:** As a team owner or admin, I want to access team settings to manage team configuration, members, and invitations, so that I can control team operations.

#### Acceptance Criteria

1. WHEN a user clicks "Team Settings" button THEN the system SHALL navigate to `/teams/:teamId/settings` page
2. WHEN the team settings page loads THEN the system SHALL display tabs for General, Members, Invites, and Danger Zone
3. WHEN on the General tab THEN the system SHALL allow editing team name, description, and privacy settings
4. WHEN on the Members tab THEN the system SHALL display all team members with options to change roles or remove members
5. WHEN on the Invites tab THEN the system SHALL display the invite code and allow copying/regenerating it
6. WHEN on the Invites tab THEN the system SHALL provide a form to send email invitations to multiple users
7. IF the user lacks permission THEN the system SHALL disable editing controls and show read-only information

### Requirement 3: Invite Code and Link Sharing

**User Story:** As a team owner, I want to share an invite code or link with others, so that they can easily join my team.

#### Acceptance Criteria

1. WHEN viewing the Invites tab THEN the system SHALL display the team's unique invite code
2. WHEN the user clicks "Copy" on the invite code THEN the system SHALL copy the code to clipboard and show a success message
3. WHEN the user clicks "Show" on the invite code THEN the system SHALL reveal the full code (initially hidden)
4. WHEN the user clicks "Regenerate" THEN the system SHALL generate a new invite code and update the display
5. WHEN viewing the Invites tab THEN the system SHALL display a shareable invite link in the format `/join/:inviteCode`
6. WHEN the user clicks "Copy" on the invite link THEN the system SHALL copy the full URL to clipboard

### Requirement 4: Email Invitations

**User Story:** As a team owner, I want to send email invitations to specific users, so that I can invite them to join my team directly.

#### Acceptance Criteria

1. WHEN on the Invites tab THEN the system SHALL display a form to enter email addresses (comma-separated)
2. WHEN the user enters email addresses and clicks "Send Invitations" THEN the system SHALL validate the emails and send invitations
3. WHEN invitations are sent successfully THEN the system SHALL display a success message with the count of invitations sent
4. WHEN sending invitations THEN the system SHALL create invitation records in the database with pending status
5. IF email addresses are invalid THEN the system SHALL display validation errors and prevent sending

### Requirement 5: Invitation Acceptance Flow

**User Story:** As a user, I want to accept or deny team invitations, so that I can control which teams I join.

#### Acceptance Criteria

1. WHEN a user receives an invitation THEN the system SHALL create an in-app notification
2. WHEN the user navigates to the invitations page THEN the system SHALL display all pending invitations with team details
3. WHEN the user clicks "Accept" on an invitation THEN the system SHALL add them to the team and update their status
4. WHEN the user clicks "Deny" on an invitation THEN the system SHALL mark the invitation as denied
5. WHEN an invitation is accepted THEN the system SHALL remove it from the pending list and add the user to the team

### Requirement 6: Team Member Management

**User Story:** As a team owner, I want to manage team members, so that I can control who has access and what permissions they have.

#### Acceptance Criteria

1. WHEN viewing the Members tab THEN the system SHALL display all team members with their names, roles, and task completion rates
2. WHEN the user clicks on a member's role dropdown THEN the system SHALL allow changing the role (member/admin)
3. WHEN the user clicks the remove button on a member THEN the system SHALL show a confirmation dialog
4. WHEN the user confirms member removal THEN the system SHALL remove the member from the team
5. IF the user lacks permission THEN the system SHALL disable member management controls

### Requirement 7: Notification System

**User Story:** As a user, I want to receive notifications about team events, so that I stay informed about team activities.

#### Acceptance Criteria

1. WHEN a user is invited to a team THEN the system SHALL create an in-app notification
2. WHEN a user accepts an invitation THEN the system SHALL notify the team owner
3. WHEN a user joins a team THEN the system SHALL notify other team members
4. WHEN viewing notifications THEN the system SHALL display all notifications with timestamps and actions
5. WHEN the user clicks on a notification THEN the system SHALL navigate to the relevant team or invitation

### Requirement 8: Search Users for Invitation

**User Story:** As a team owner, I want to search for users to invite, so that I can find specific people to add to my team.

#### Acceptance Criteria

1. WHEN on the Invites tab THEN the system SHALL provide a search interface to find users
2. WHEN the user types a search query THEN the system SHALL search users by name, username, or email
3. WHEN search results are displayed THEN the system SHALL show user cards with name, username, and avatar
4. WHEN the user clicks on a search result THEN the system SHALL add that user to the invitation list
5. IF no results are found THEN the system SHALL display a "No users found" message

### Requirement 9: Join Team via Invite Code

**User Story:** As a user, I want to join a team using an invite code or link, so that I can quickly become a team member.

#### Acceptance Criteria

1. WHEN a user navigates to `/join/:inviteCode` THEN the system SHALL validate the invite code
2. WHEN the invite code is valid THEN the system SHALL add the user to the team and redirect to the team dashboard
3. WHEN the invite code is invalid or expired THEN the system SHALL display an error message
4. IF the user is already a team member THEN the system SHALL display a message and redirect to the team dashboard
5. WHEN the user joins via invite code THEN the system SHALL create a notification for the team owner

### Requirement 10: Remove Emoji from Documentation

**User Story:** As a developer, I want clean documentation without emoji, so that the README is professional and consistent.

#### Acceptance Criteria

1. WHEN viewing the backend README THEN the system SHALL not contain any emoji characters
2. WHEN viewing the frontend README THEN the system SHALL not contain any emoji characters
3. WHEN viewing the root README THEN the system SHALL not contain any emoji characters
4. WHEN documentation is updated THEN the system SHALL maintain all technical content and formatting
