/**
 * Admin Users Page
 * Example implementation of the enhanced user management interface
 */

import { UserManagementPageWithProvider } from "@/lib/components/users";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <UserManagementPageWithProvider />
      </div>
    </div>
  );
}

export const metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage user accounts, roles, and permissions",
};
