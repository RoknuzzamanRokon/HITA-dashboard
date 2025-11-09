# Design Document

## Overview

The User Edit Management feature extends the existing user management system by adding comprehensive editing capabilities through a modal interface. When an administrator clicks on a user in the General Users Analytics Section, a modal opens displaying detailed user information with action buttons for various management operations including point allocation, supplier management, user activation, point reset, user deletion, and API key generation.

This design integrates with the existing Next.js/React frontend architecture, utilizing the established API client pattern, TypeScript types, and UI component library.

## Architecture

### Component Structure

```
app/dashboard/users/page.tsx (existing)
├── UserEditModal (new component)
│   ├── UserInfoDisplay
│   ├── PointAllocationSection
│   │   └── AllocationTypeSelector
│   ├── SupplierManagementSection
│   │   ├── ActiveSuppliersList
│   │   └── SupplierActivationControls
│   ├── UserActionsSection
│   │   ├── ActivateUserButton
│   │   ├── ResetPointsButton
│   │   ├── DeleteUserButton
│   │   └── GenerateApiKeyButton
│   └── ApiKeyDisplay
```

### Data Flow

1. **User Selection**: Administrator clicks user → triggers `handleEditUser(user)` → opens modal with user ID
2. **Data Fetching**: Modal opens → fetches detailed user info from endpoint 1 → displays in modal
3. **Action Execution**: User clicks action button → sends request to appropriate endpoint → shows loading state → displays result → refreshes user data
4. **Modal Closure**: User closes modal → refreshes analytics section → returns to list view

## Components and Interfaces

### 1. UserEditModal Component

**Purpose**: Main modal container for user editing interface

**Props**:

```typescript
interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUserUpdated?: () => void;
}
```

**State**:

```typescript
{
  userDetails: DetailedUserInfo | null;
  loading: boolean;
  error: string | null;
  actionInProgress: string | null; // tracks which action is executing
  successMessage: string | null;
}
```

**Key Methods**:

- `fetchUserDetails()`: Loads user information from endpoint 1
- `refreshUserData()`: Reloads user data after successful actions
- `handleActionComplete()`: Common handler for action success/failure

### 2. PointAllocationSection Component

**Purpose**: Manages point allocation with package type selection

**Props**:

```typescript
interface PointAllocationSectionProps {
  userId: string;
  userEmail: string;
  currentPoints: number;
  onAllocationComplete: () => void;
}
```

**State**:

```typescript
{
  selectedAllocationType: AllocationType;
  loading: boolean;
  error: string | null;
}
```

**Allocation Types**:

```typescript
type AllocationType =
  | "admin_user_package"
  | "one_year_package"
  | "one_month_package"
  | "per_request_point"
  | "guest_point";
```

### 3. SupplierManagementSection Component

**Purpose**: Handles supplier activation and deactivation

**Props**:

```typescript
interface SupplierManagementSectionProps {
  userId: string;
  activeSuppliers: string[];
  totalSuppliers: number;
  onSuppliersUpdated: () => void;
}
```

**State**:

```typescript
{
  selectedSuppliers: string[];
  availableSuppliers: string[]; // fetched from config or API
  actionType: 'activate' | 'deactivate' | null;
  loading: boolean;
}
```

### 4. UserActionsSection Component

**Purpose**: Groups all user management action buttons

**Props**:

```typescript
interface UserActionsSectionProps {
  userId: string;
  isActive: boolean;
  currentPoints: number;
  onActionComplete: (action: string, success: boolean) => void;
}
```

**Actions**:

- Activate/Deactivate User
- Reset Points (with confirmation)
- Delete User (with confirmation)
- Generate API Key

### 5. ApiKeyDisplay Component

**Purpose**: Shows generated API key with copy functionality

**Props**:

```typescript
interface ApiKeyDisplayProps {
  apiKey: string | null;
  onCopy: () => void;
}
```

## Data Models

### DetailedUserInfo Type

```typescript
interface DetailedUserInfo {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  api_key: string | null;
  points: {
    total_points: number;
    current_points: number;
    total_used_points: number;
    paid_status: string;
    total_rq: number;
  };
  active_suppliers: string[];
  total_suppliers: number;
  created_at: string;
  updated_at: string;
  user_status: string;
  is_active: boolean;
  using_rq_status: string;
  created_by: string;
  viewed_by: {
    user_id: string;
    username: string;
    email: string;
    role: string;
  };
}
```

### API Request/Response Types

```typescript
// Point Allocation Request
interface PointAllocationRequest {
  receiver_email: string;
  receiver_id: string;
  allocation_type: AllocationType;
}

// Supplier Management Request
interface SupplierManagementRequest {
  provider_activision_list: string[];
}

// API Response (generic)
interface ActionResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: {
    status: number;
    message: string;
    details?: any;
  };
}
```

## API Integration

### UserEditService Class

Create a new service class to handle user edit operations:

```typescript
// lib/api/user-edit.ts
export class UserEditService {
  /**
   * Endpoint 1: Get detailed user information
   */
  static async getUserDetails(
    userId: string
  ): Promise<ApiResponse<DetailedUserInfo>> {
    return apiClient.get<DetailedUserInfo>(`/user/check-user-info/${userId}`);
  }

  /**
   * Endpoint 2: Allocate points to user
   */
  static async allocatePoints(
    userId: string,
    email: string,
    allocationType: AllocationType
  ): Promise<ApiResponse<any>> {
    return apiClient.post("/user/points/give/", {
      receiver_email: email,
      receiver_id: userId,
      allocation_type: allocationType,
    });
  }

  /**
   * Endpoint 3: Activate suppliers for user
   */
  static async activateSuppliers(
    userId: string,
    suppliers: string[]
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      `/permissions/admin/activate_supplier?user_id=${userId}`,
      { provider_activision_list: suppliers }
    );
  }

  /**
   * Endpoint 4: Deactivate suppliers for user
   */
  static async deactivateSuppliers(
    userId: string,
    suppliers: string[]
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      `/permissions/admin/deactivate_supplier?user_id=${userId}`,
      { provider_activision_list: suppliers }
    );
  }

  /**
   * Endpoint 5: Activate user account
   */
  static async activateUser(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/auth/admin/users/${userId}/activate`, {});
  }

  /**
   * Endpoint 6: Reset user points
   */
  static async resetUserPoints(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/user/reset_point/${userId}/`, {});
  }

  /**
   * Endpoint 7: Delete user
   */
  static async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/delete/delete_user/${userId}`);
  }

  /**
   * Endpoint 8: Generate API key
   */
  static async generateApiKey(
    userId: string
  ): Promise<ApiResponse<{ api_key: string }>> {
    return apiClient.post(`/auth/generate_api_key/${userId}`, {});
  }
}
```

### API Configuration Updates

Add new endpoints to `lib/config.ts`:

```typescript
export const apiEndpoints = {
  // ... existing endpoints
  userEdit: {
    getUserDetails: (userId: string) => `/user/check-user-info/${userId}`,
    allocatePoints: "/user/points/give/",
    activateSuppliers: (userId: string) =>
      `/permissions/admin/activate_supplier?user_id=${userId}`,
    deactivateSuppliers: (userId: string) =>
      `/permissions/admin/deactivate_supplier?user_id=${userId}`,
    activateUser: (userId: string) => `/auth/admin/users/${userId}/activate`,
    resetPoints: (userId: string) => `/user/reset_point/${userId}/`,
    deleteUser: (userId: string) => `/delete/delete_user/${userId}`,
    generateApiKey: (userId: string) => `/auth/generate_api_key/${userId}`,
  },
};
```

## UI/UX Design

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Edit User: [username]                                    ✕ │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ User Information                                    │   │
│  │ • ID: [id]                                          │   │
│  │ • Email: [email]                                    │   │
│  │ • Role: [role badge]                                │   │
│  │ • Status: [active/inactive badge]                   │   │
│  │ • Current Points: [current_points]                  │   │
│  │ • Total Points: [total_points]                      │   │
│  │ • Payment Status: [paid_status]                     │   │
│  │ • Total Requests: [total_rq]                        │   │
│  │ • Active Suppliers: [supplier badges]               │   │
│  │ • Created: [created_at] by [created_by]             │   │
│  │ • API Key: [api_key or "Not generated"]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Point Allocation                                    │   │
│  │ Select Package: [dropdown]                          │   │
│  │   • Admin User Package                              │   │
│  │   • One Year Package                                │   │
│  │   • One Month Package                               │   │
│  │   • Per Request Point                               │   │
│  │   • Guest Point                                     │   │
│  │ [Allocate Points Button]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Supplier Management                                 │   │
│  │ Active: [supplier1] [supplier2] ...                 │   │
│  │ Select Suppliers: [multi-select]                    │   │
│  │ [Activate Selected] [Deactivate Selected]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ User Actions                                        │   │
│  │ [Activate/Deactivate User]                          │   │
│  │ [Reset Points]                                      │   │
│  │ [Generate API Key]                                  │   │
│  │ [Delete User]                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                    [Close] [Save Changes]   │
└─────────────────────────────────────────────────────────────┘
```

### Confirmation Dialogs

For destructive actions (Reset Points, Delete User), show confirmation modals:

```
┌─────────────────────────────────────┐
│  Confirm Action                   ✕ │
├─────────────────────────────────────┤
│                                     │
│  ⚠️  Are you sure you want to       │
│      [action description]?          │
│                                     │
│  This action cannot be undone.      │
│                                     │
├─────────────────────────────────────┤
│           [Cancel] [Confirm]        │
└─────────────────────────────────────┘
```

### Success/Error Messages

Use toast notifications or inline alerts:

- Success: Green banner with checkmark icon
- Error: Red banner with error icon
- Loading: Spinner with action description

## Error Handling

### Error Scenarios and Handling

1. **Network Errors**

   - Display: "Unable to connect to server. Please check your connection."
   - Action: Retry button

2. **Authentication Errors (401)**

   - Display: "Session expired. Please log in again."
   - Action: Redirect to login

3. **Permission Errors (403)**

   - Display: "You don't have permission to perform this action."
   - Action: Disable action buttons

4. **Not Found Errors (404)**

   - Display: "User not found or has been deleted."
   - Action: Close modal, refresh list

5. **Validation Errors (400)**

   - Display: Specific validation message from API
   - Action: Highlight invalid fields

6. **Server Errors (500)**
   - Display: "Server error occurred. Please try again later."
   - Action: Retry button

### Error Handling Pattern

```typescript
async function handleAction(actionFn: () => Promise<ApiResponse<any>>) {
  try {
    setLoading(true);
    setError(null);

    const response = await actionFn();

    if (response.success) {
      setSuccessMessage("Action completed successfully");
      await refreshUserData();
    } else {
      const errorMsg = response.error?.message || "Action failed";
      setError(errorMsg);
    }
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "An unexpected error occurred"
    );
  } finally {
    setLoading(false);
  }
}
```

## Testing Strategy

### Unit Tests

1. **Component Tests**

   - UserEditModal renders correctly with user data
   - PointAllocationSection displays all allocation types
   - SupplierManagementSection handles supplier selection
   - Action buttons trigger correct API calls
   - Error states display properly
   - Success messages appear after actions

2. **Service Tests**
   - UserEditService methods call correct endpoints
   - Request payloads match API specifications
   - Response transformations work correctly
   - Error responses are handled properly

### Integration Tests

1. **Modal Flow Tests**

   - Opening modal fetches user details
   - Point allocation updates user points
   - Supplier activation/deactivation updates supplier list
   - User activation toggles status
   - Point reset clears points
   - API key generation displays new key
   - Delete user removes user and closes modal

2. **Error Handling Tests**
   - Network errors show appropriate messages
   - API errors display correctly
   - Confirmation dialogs prevent accidental actions
   - Loading states prevent duplicate requests

### E2E Tests

1. **Complete User Edit Workflow**

   - Admin logs in
   - Navigates to users page
   - Clicks on a user
   - Modal opens with user details
   - Performs point allocation
   - Activates a supplier
   - Generates API key
   - Closes modal
   - Verifies changes in user list

2. **Permission Tests**
   - Non-admin users cannot access edit features
   - Action buttons are disabled based on permissions
   - Unauthorized actions show error messages

## Security Considerations

1. **Authentication**: All API calls require valid JWT token
2. **Authorization**: Verify user has admin/super_user role before showing edit modal
3. **Input Validation**: Validate all inputs before sending to API
4. **Sensitive Data**: Mask API keys by default, show only on user action
5. **Audit Trail**: Log all user management actions with timestamp and admin user
6. **Confirmation**: Require confirmation for destructive actions (delete, reset points)
7. **Rate Limiting**: Implement client-side throttling for API calls
8. **CSRF Protection**: Use CSRF tokens for state-changing operations

## Performance Considerations

1. **Lazy Loading**: Load modal component only when needed
2. **Data Caching**: Cache user details for 30 seconds to reduce API calls
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Debouncing**: Debounce search/filter inputs in supplier selection
5. **Pagination**: If supplier list is large, implement pagination
6. **Loading States**: Show skeleton loaders while fetching data
7. **Error Boundaries**: Wrap modal in error boundary to prevent app crashes

## Accessibility

1. **Keyboard Navigation**: All actions accessible via keyboard
2. **Screen Readers**: Proper ARIA labels on all interactive elements
3. **Focus Management**: Focus trap within modal, return focus on close
4. **Color Contrast**: Ensure WCAG AA compliance for all text
5. **Error Announcements**: Use ARIA live regions for error/success messages
6. **Button States**: Clear visual indication of disabled/loading states

## Migration and Rollout

### Phase 1: Backend Integration

- Add UserEditService class
- Update API configuration
- Add new TypeScript types

### Phase 2: UI Components

- Create UserEditModal component
- Implement sub-components (PointAllocation, SupplierManagement, etc.)
- Add to existing users page

### Phase 3: Testing

- Unit tests for all components
- Integration tests for API calls
- E2E tests for complete workflows

### Phase 4: Deployment

- Deploy to staging environment
- Conduct user acceptance testing
- Deploy to production with feature flag
- Monitor for errors and performance issues

## Future Enhancements

1. **Bulk Operations**: Edit multiple users at once
2. **History View**: Show audit log of user changes
3. **Advanced Filters**: Filter suppliers by category
4. **Point History**: Display point allocation/usage history
5. **Email Notifications**: Send email when points are allocated
6. **Custom Packages**: Allow admins to create custom point packages
7. **Supplier Analytics**: Show usage statistics per supplier
8. **Export Functionality**: Export user data to CSV/PDF
