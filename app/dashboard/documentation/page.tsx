/**
 * Documentation Page
 * Browse and search platform documentation
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useLayout } from "@/lib/contexts/layout-context";
import { DocViewer, DocNavigation } from "@/lib/components/docs/doc-viewer";
import { Card } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Input } from "@/lib/components/ui/input";
import { BookOpen, Rocket, FileText, HelpCircle, MessageCircle, Code, Shield, Crown, User, Search, ChevronLeft } from "lucide-react";
import { UserRole } from "@/lib/types/auth";
import { getDocsForUser, getUserDocFolder, type DocFile } from "@/lib/utils/doc-loader";

const generalDocItems = [
  { title: "Getting Started", path: "getting-started.md", icon: <Rocket className="w-4 h-4" /> },
  { title: "Troubleshooting", path: "troubleshooting.md", icon: <HelpCircle className="w-4 h-4" /> },
  { title: "FAQ", path: "faq.md", icon: <MessageCircle className="w-4 h-4" /> },
];

export default function DocumentationPage() {
  const { user } = useAuth();
  const [activeDoc, setActiveDoc] = useState(generalDocItems[0].path);
  const [showingApiDoc, setShowingApiDoc] = useState(false);
  const [apiSearchTerm, setApiSearchTerm] = useState("");
  const [activeApiDoc, setActiveApiDoc] = useState<string>("");
  const { setSidebarOpen } = useLayout();

  // Auto-hide sidebar when viewing API docs
  useEffect(() => {
    if (showingApiDoc) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [showingApiDoc, setSidebarOpen]);

  // Get role-specific API docs
  // Logic: 
  // - Admin/Super User: Admin docs
  // - General User with points > 0: Paid User docs
  // - General User with points = 0: Demo User docs
  
  const isAdminOrSuper = user?.role === UserRole.SUPER_USER || user?.role === UserRole.ADMIN_USER;
  const isPaidUser = user?.role === UserRole.GENERAL_USER && (user?.pointBalance || 0) > 0;
  const isDemoUser = user?.role === UserRole.GENERAL_USER && (user?.pointBalance || 0) === 0;

  const apiDocs = user ? getDocsForUser(user.role, isPaidUser) : [];
  const userFolder = user ? getUserDocFolder(user.role, isPaidUser) : "";

  // Get API documentation content based on user type
  const getApiDocContent = () => {
    if (isAdminOrSuper) {
      return `# API Documentation - Admin & Super User

## Full API Access

Hello ${user?.username}! 👋

As an administrator, you have complete access to all API endpoints.

## Authentication
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
X-API-Key: YOUR_API_KEY
\`\`\`

## Available Endpoints

### User Management
- **POST** \`/v1.0/users/create\` - Create new user
- **PUT** \`/v1.0/users/{id}\` - Update user  
- **DELETE** \`/v1.0/users/{id}\` - Delete user
- **GET** \`/v1.0/users/list\` - List all users

### Hotels
- **GET** \`/v1.0/hotels/search\` - Search hotels
- **GET** \`/v1.0/hotels/{ittid}\` - Get hotel details

### Exports
- **POST** \`/v1.0/export/hotels\` - Create hotel export
- **GET** \`/v1.0/export/status/{jobId}\` - Check status

## Rate Limits
**Unlimited** - No rate limiting for admin users`;
    } else if (isPaidUser) {
      return `# API Documentation - Paid User

## Premium API Access

Hello ${user?.username}! 👋

You have premium access to our production API.

## Authentication
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
X-API-Key: YOUR_API_KEY
\`\`\`

## Available Endpoints

### Hotels
- **GET** \`/v1.0/hotels/search\` - Search hotels
- **GET** \`/v1.0/hotels/{ittid}\` - Get hotel details

### Exports
- **POST** \`/v1.0/export/hotels\` - Create hotel export
- **GET** \`/v1.0/export/status/{jobId}\` - Check status

## Rate Limits
- 1000 requests per hour
- 50 export jobs per day`;
    } else {
      return `# API Documentation - Demo User

## Demo API Access

Hello ${user?.username}! 👋

Welcome! You have read-only access to sample data.

## Authentication
\`\`\`
Authorization: Bearer YOUR_DEMO_TOKEN
X-API-Key: DEMO_KEY
\`\`\`

## Available Endpoints

### Hotels (Read-Only)
- **GET** \`/v1.0/hotels/search\` - Search sample hotels
- **GET** \`/v1.0/hotels/{ittid}\` - View sample details

**Note:** Returns sample/demo data only

## Rate Limits
- 100 requests per hour
- No export functionality

## Upgrade Benefits
🚀 **Upgrade to unlock:**
- Full production data access
- Export functionality  
- Higher rate limits
- Priority support`;
    }
  };

  const getUserBadgeInfo = () => {
    if (isAdminOrSuper) {
      return { label: "Admin", variant: "error" as const, icon: <Shield className="w-4 h-4" /> };
    } else if (isPaidUser) {
      return { label: "Paid", variant: "success" as const, icon: <Crown className="w-4 h-4" /> };
    } else {
      return { label: "Demo", variant: "info" as const, icon: <User className="w-4 h-4" /> };
    }
  };

  const badgeInfo = getUserBadgeInfo();

  // Filter API docs based on search term
  const filteredApiDocs = apiDocs.filter(doc => 
    doc.title.toLowerCase().includes(apiSearchTerm.toLowerCase())
  );

  // Fullscreen API Documentation Layout
  if (showingApiDoc) {
    return (
      <div className="fixed inset-0 z-50 bg-[rgb(var(--bg-primary))] flex flex-col animate-in fade-in duration-200">
        {/* Fixed Header */}
        <div className="flex-none h-16 border-b border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowingApiDoc(false);
                setActiveApiDoc("");
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-[rgb(var(--border-primary))]" />
            <h2 className="font-semibold text-lg text-[rgb(var(--text-primary))]">
              {isAdminOrSuper ? "Admin" : isPaidUser ? "Paid" : "Demo"} API Documentation
            </h2>
          </div>
          <Badge variant={badgeInfo.variant} className="flex items-center gap-1.5">
            {badgeInfo.icon}
            {badgeInfo.label} Access
          </Badge>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Fixed Sidebar */}
          <div className="w-72 flex-none border-r border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] flex flex-col">
            {/* Fixed Search Header */}
            <div className="p-4 border-b border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-secondary))]" />
                <Input
                  placeholder="Filter endpoints..."
                  value={apiSearchTerm}
                  onChange={(e) => setApiSearchTerm(e.target.value)}
                  className="pl-9 bg-[rgb(var(--bg-primary))]"
                />
              </div>
            </div>

            {/* Scrollable Menu */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-primary-color" />
                  <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                    API Reference
                  </h3>
                </div>
                <nav className="space-y-1">
                  {filteredApiDocs.length > 0 ? (
                    filteredApiDocs.map((doc) => (
                      <button
                        key={doc.path}
                        onClick={() => setActiveApiDoc(doc.path)}
                        type="button"
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                          activeApiDoc === doc.path
                            ? "bg-primary-color text-white"
                            : "hover:bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">{doc.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-[rgb(var(--text-secondary))] text-center py-4">
                      No endpoints found
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-[rgb(var(--bg-primary))]">
            <div className="max-w-5xl mx-auto p-8">
              {activeApiDoc ? (
                <DocViewer docPath={activeApiDoc} />
              ) : (
                <Card className="p-12" hover={false}>
                  <div className="text-center">
                    <Code className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--text-tertiary))]" />
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
                      Select an API Documentation
                    </h3>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                      Choose a topic from the left sidebar to view documentation
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-color" />
          Documentation
        </h1>
        <p className="text-[rgb(var(--text-secondary))] mt-2">
          Learn how to use the platform effectively
        </p>
      </div>

      {/* Documentation Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Documentation Navigation */}
        <div className="lg:col-span-1">
          <DocNavigation
            items={generalDocItems}
            activePath={activeDoc}
            onNavigate={(path) => {
              setActiveDoc(path);
            }}
          />
            
          {/* API Documentation Button */}
          <div className="mt-4">
            <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-primary-color" />
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">API Access</h3>
              </div>
              <button
                onClick={() => {
                  setShowingApiDoc(true);
                  setActiveDoc("");
                }}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 hover:bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium flex-1">API Documentation</span>
                <Badge variant={badgeInfo.variant} size="sm">
                  {badgeInfo.icon}
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Documentation Viewer */}
        <div className="lg:col-span-3">
          <DocViewer docPath={activeDoc} />
        </div>
      </div>
    </div>
  );
}
