# Implementation Plan

- [x] 1. Create API service layer for user edit operations

  - Create `lib/api/user-edit.ts` with UserEditService class
  - Implement getUserDetails method for endpoint 1 (check-user-info)
  - Implement allocatePoints method for endpoint 2 (points/give)
  - Implement activateSuppliers method for endpoint 3 (activate_supplier)
  - Implement deactivateSuppliers method for endpoint 4 (deactivate_supplier)
  - Implement activateUser method for endpoint 5 (users/activate)
  - Implement resetUserPoints method for endpoint 6 (reset_point)
  - Implement deleteUser method for endpoint 7 (delete_user)
  - Implement generateApiKey method for endpoint 8 (generate_api_key)
  - _Requirements: 1.1, 2.2, 3.2, 4.2, 5.1, 6.2, 7.2, 8.1_

- [x] 2. Add TypeScript types for user edit functionality

  - Create DetailedUserInfo interface in `lib/types/user.ts`
  - Create PointAllocationRequest interface
  - Create SupplierManagementRequest interface
  - Create AllocationType type with 5 package options
  - Create ActionResponse interface for API responses
  - Update existing user types to support new fields
  - _Requirements: 1.2, 2.1, 3.1, 4.1_

- [x] 3. Update API configuration with new endpoints

  - Add userEdit section to apiEndpoints in `lib/config.ts`
  - Define all 8 endpoint paths with proper parameter handling
  - Ensure endpoint URLs match backend specification exactly
  - _Requirements: 1.1, 2.2, 3.2, 4.2, 5.1, 6.2, 7.2, 8.1_

- [x] 4. Create UserEditModal component

  - Create `lib/components/users/user-edit-modal.tsx`
  - Implement modal open/close functionality
  - Add state management for user details, loading, and errors
  - Implement fetchUserDetails on modal open
  - Add refreshUserData method for post-action updates
  - Implement handleActionComplete for success/error handling
  - Add modal layout with sections for info, actions, and messages
  - _Requirements: 1.1, 1.2, 1.4, 9.1, 9.2_

- [x] 5. Create PointAllocationSection component

  - Create `lib/components/users/point-allocation-section.tsx`
  - Implement dropdown with 5 allocation type options
  - Add state for selected allocation type
  - Implement allocate points button with loading state
  - Call UserEditService.allocatePoints on submission
  - Display success/error messages
  - Trigger parent refresh on successful allocation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Create SupplierManagementSection component

  - Create `lib/components/users/supplier-management-section.tsx`
  - Display list of currently active suppliers
  - Implement multi-select for supplier selection
  - Add activate suppliers button
  - Add deactivate suppliers button
  - Call UserEditService.activateSuppliers for activation
  - Call UserEditService.deactivateSuppliers for deactivation
  - Display success/error messages
  - Trigger parent refresh on successful changes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Create UserActionsSection component

  - Create `lib/components/users/user-actions-section.tsx`
  - Implement activate/deactivate user button
  - Implement reset points button with confirmation dialog
  - Implement delete user button with confirmation dialog
  - Implement generate API key button
  - Add loading states for each action
  - Call appropriate UserEditService methods
  - Display success/error messages for each action
  - Trigger parent refresh on successful actions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4_

- [x] 8. Create ApiKeyDisplay component

  - Create `lib/components/users/api-key-display.tsx`
  - Display API key with masked/unmasked toggle
  - Implement copy-to-clipboard functionality
  - Show copy success feedback
  - Handle null/empty API key state
  - _Requirements: 8.2, 8.4, 8.5_

- [x] 9. Create confirmation dialog component

  - Create `lib/components/ui/confirmation-dialog.tsx` (if not exists)
  - Implement reusable confirmation modal
  - Add props for title, message, confirm/cancel actions
  - Style with warning icon for destructive actions
  - _Requirements: 6.1, 7.1_

- [x] 10. Integrate UserEditModal into users page

  - Update `app/dashboard/users/page.tsx`
  - Modify handleEditUser to open UserEditModal instead of existing modal
  - Pass userId and onUserUpdated callback to modal
  - Ensure modal opens when user clicks on user in analytics section
  - Refresh analytics data when modal closes after changes
  - _Requirements: 1.1, 1.4, 9.1, 9.4, 9.5_

- [ ] 11. Add error handling and user feedback

  - Implement error boundary for modal
  - Add toast notifications for success/error messages
  - Implement loading skeletons for data fetching
  - Add inline error displays for form validation
  - Handle network errors with retry functionality
  - Handle authentication errors with redirect
  - Handle permission errors with disabled buttons
  - _Requirements: 1.3, 2.4, 3.4, 4.4, 5.3, 6.4, 7.4, 8.3_

- [ ] 12. Implement accessibility features

  - Add ARIA labels to all interactive elements
  - Implement keyboard navigation for modal
  - Add focus trap within modal
  - Ensure focus returns to trigger element on close
  - Add ARIA live regions for success/error announcements
  - Test with screen reader
  - Verify color contrast meets WCAG AA standards
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 13. Add loading and optimistic UI updates

  - Implement skeleton loaders for user details
  - Add loading spinners for action buttons
  - Disable buttons during API calls
  - Show optimistic updates where appropriate
  - Implement rollback on error
  - _Requirements: 1.2, 2.2, 3.2, 4.2, 5.1, 6.2, 7.2, 8.1_

- [ ]\* 14. Write unit tests for components

  - Test UserEditModal rendering and data fetching
  - Test PointAllocationSection with all allocation types
  - Test SupplierManagementSection supplier selection
  - Test UserActionsSection button actions
  - Test ApiKeyDisplay copy functionality
  - Test confirmation dialog behavior
  - Test error state rendering
  - Test loading state rendering
  - _Requirements: All_

- [ ]\* 15. Write integration tests for API service

  - Test UserEditService.getUserDetails endpoint call
  - Test UserEditService.allocatePoints with correct payload
  - Test UserEditService.activateSuppliers with supplier list
  - Test UserEditService.deactivateSuppliers with supplier list
  - Test UserEditService.activateUser endpoint call
  - Test UserEditService.resetUserPoints endpoint call
  - Test UserEditService.deleteUser endpoint call
  - Test UserEditService.generateApiKey endpoint call
  - Test error response handling for all methods
  - _Requirements: 1.1, 2.2, 3.2, 4.2, 5.1, 6.2, 7.2, 8.1_

- [ ]\* 16. Write E2E tests for complete workflow
  - Test opening modal from user click
  - Test viewing user details
  - Test allocating points with different packages
  - Test activating suppliers
  - Test deactivating suppliers
  - Test generating API key
  - Test resetting points with confirmation
  - Test deleting user with confirmation
  - Test modal close and data refresh
  - Test permission-based access control
  - _Requirements: All_
