# Requirements Document

## Introduction

This feature enables administrators to view detailed user information and perform comprehensive user management operations including editing user details, allocating points, managing supplier access, activating/deactivating users, resetting points, deleting users, and generating API keys. The feature integrates with the existing General Users Analytics Section and provides a modal-based editing interface.

## Glossary

- **User Management System**: The administrative interface for managing user accounts and permissions
- **General Users Analytics Section**: The dashboard section displaying user statistics and information
- **User Edit Modal**: A modal dialog that opens when an administrator clicks on a specific user
- **Point Allocation System**: The system for distributing points to users based on package types
- **Supplier Activation System**: The system for enabling or disabling supplier access for users
- **API Key Generator**: The system component that generates authentication keys for users

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to view comprehensive user information when I click on a user in the General Users Analytics Section, so that I can review all user details before making management decisions

#### Acceptance Criteria

1. WHEN an administrator clicks on a specific user in the General Users Analytics Section, THE User Management System SHALL retrieve the user's full information from the endpoint "http://127.0.0.1:8002/v1.0/user/check-user-info/{{user_id}}"
2. WHEN the user information is successfully retrieved, THE User Management System SHALL display the user's id, username, email, role, api_key, points (total_points, current_points, total_used_points, paid_status, total_rq), active_suppliers, total_suppliers, created_at, updated_at, user_status, is_active, using_rq_status, created_by, and viewed_by information
3. WHEN the user information retrieval fails, THE User Management System SHALL display an error message to the administrator
4. WHEN the user information is displayed, THE User Management System SHALL open an edit modal interface

### Requirement 2

**User Story:** As an administrator, I want to allocate points to users using predefined package types, so that I can manage user access and credits efficiently

#### Acceptance Criteria

1. WHEN an administrator selects a point allocation option, THE Point Allocation System SHALL provide exactly five allocation type options: "admin_user_package", "one_year_package", "one_month_package", "per_request_point", and "guest_point"
2. WHEN an administrator submits a point allocation request, THE Point Allocation System SHALL send a POST request to "http://127.0.0.1:8002/v1.0/user/points/give/" with payload containing receiver_email, receiver_id, and allocation_type
3. WHEN the point allocation is successful, THE Point Allocation System SHALL display a success confirmation message
4. WHEN the point allocation fails, THE Point Allocation System SHALL display an error message with failure details
5. WHEN a point allocation is completed, THE User Management System SHALL refresh the user's point information

### Requirement 3

**User Story:** As an administrator, I want to activate suppliers for users, so that users can access specific supplier services

#### Acceptance Criteria

1. WHEN an administrator selects suppliers to activate, THE Supplier Activation System SHALL display a list of available suppliers
2. WHEN an administrator submits supplier activation, THE Supplier Activation System SHALL send a POST request to "http://127.0.0.1:8002/v1.0/permissions/admin/activate_supplier?user_id={{user_id}}" with payload containing provider_activision_list array
3. WHEN supplier activation is successful, THE Supplier Activation System SHALL display a success confirmation message
4. WHEN supplier activation fails, THE Supplier Activation System SHALL display an error message with failure details
5. WHEN supplier activation is completed, THE User Management System SHALL refresh the user's active_suppliers list

### Requirement 4

**User Story:** As an administrator, I want to deactivate suppliers for users, so that I can revoke access to specific supplier services

#### Acceptance Criteria

1. WHEN an administrator selects suppliers to deactivate, THE Supplier Activation System SHALL display the user's currently active suppliers
2. WHEN an administrator submits supplier deactivation, THE Supplier Activation System SHALL send a POST request to "http://127.0.0.1:8002/v1.0/permissions/admin/deactivate_supplier?user_id={{user_id}}" with payload containing provider_activision_list array
3. WHEN supplier deactivation is successful, THE Supplier Activation System SHALL display a success confirmation message
4. WHEN supplier deactivation fails, THE Supplier Activation System SHALL display an error message with failure details
5. WHEN supplier deactivation is completed, THE User Management System SHALL refresh the user's active_suppliers list

### Requirement 5

**User Story:** As an administrator, I want to activate or deactivate user accounts, so that I can control user access to the system

#### Acceptance Criteria

1. WHEN an administrator clicks the activate user button, THE User Management System SHALL send a POST request to "http://127.0.0.1:8002/v1.0/auth/admin/users/{{user_id}}/activate" with an empty payload
2. WHEN user activation is successful, THE User Management System SHALL update the user's is_active status to true
3. WHEN user activation fails, THE User Management System SHALL display an error message with failure details
4. WHEN user activation is completed, THE User Management System SHALL refresh the user information display

### Requirement 6

**User Story:** As an administrator, I want to reset a user's points to zero, so that I can clear their point balance when necessary

#### Acceptance Criteria

1. WHEN an administrator clicks the reset points button, THE Point Allocation System SHALL display a confirmation dialog
2. WHEN the administrator confirms the reset action, THE Point Allocation System SHALL send a POST request to "http://127.0.0.1:8002/v1.0/user/reset_point/{{user_id}}/" with an empty payload
3. WHEN point reset is successful, THE Point Allocation System SHALL display a success confirmation message
4. WHEN point reset fails, THE Point Allocation System SHALL display an error message with failure details
5. WHEN point reset is completed, THE User Management System SHALL refresh the user's point information to show zero values

### Requirement 7

**User Story:** As an administrator, I want to delete user accounts, so that I can remove users who no longer need access to the system

#### Acceptance Criteria

1. WHEN an administrator clicks the delete user button, THE User Management System SHALL display a confirmation dialog with warning message
2. WHEN the administrator confirms the deletion, THE User Management System SHALL send a DELETE request to "http://127.0.0.1:8002/v1.0/delete/delete_user/{{user_id}}" with an empty payload
3. WHEN user deletion is successful, THE User Management System SHALL close the edit modal and remove the user from the analytics display
4. WHEN user deletion fails, THE User Management System SHALL display an error message with failure details
5. WHEN user deletion is completed, THE User Management System SHALL refresh the General Users Analytics Section

### Requirement 8

**User Story:** As an administrator, I want to generate API keys for users, so that users can authenticate with external services

#### Acceptance Criteria

1. WHEN an administrator clicks the generate API key button, THE API Key Generator SHALL send a POST request to "http://127.0.0.1:8002/v1.0/auth/generate_api_key/{{user_id}}" with an empty payload
2. WHEN API key generation is successful, THE API Key Generator SHALL display the newly generated API key to the administrator
3. WHEN API key generation fails, THE API Key Generator SHALL display an error message with failure details
4. WHEN API key generation is completed, THE User Management System SHALL refresh the user information to display the new api_key value
5. WHEN an API key is displayed, THE User Management System SHALL provide a copy-to-clipboard function for the administrator

### Requirement 9

**User Story:** As an administrator, I want all user management actions to be performed within a modal interface, so that I can manage users without navigating away from the analytics section

#### Acceptance Criteria

1. WHEN an administrator clicks on a user, THE User Management System SHALL open a modal dialog overlaying the current page
2. WHEN the modal is open, THE User Management System SHALL display all user information and management action buttons
3. WHEN an administrator performs any management action, THE User Management System SHALL execute the action without closing the modal unless explicitly requested
4. WHEN an administrator clicks outside the modal or clicks a close button, THE User Management System SHALL close the modal and return to the analytics view
5. WHEN the modal closes after successful actions, THE User Management System SHALL refresh the underlying analytics data
