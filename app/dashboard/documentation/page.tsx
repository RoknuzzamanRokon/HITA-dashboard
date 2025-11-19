/**
 * Documentation Page
 * Browse and search platform documentation
 */

"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { DocViewer, DocNavigation } from "@/lib/components/docs/doc-viewer";
import { Card } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Input } from "@/lib/components/ui/input";
import { BookOpen, Rocket, FileText, HelpCircle, MessageCircle, Code, Shield, Crown, User, Search } from "lucide-react";
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

  // Get role-specific API docs
  const isPaidUser = (user as any)?.paid_status === "Paid";
  const apiDocs = user ? getDocsForUser(user.role, isPaidUser) : [];
  const userFolder = user ? getUserDocFolder(user.role, isPaidUser) : "";

  // Determine user type for API docs
  const isAdminOrSuper = user?.role === UserRole.SUPER_USER || user?.role === UserRole.ADMIN_USER;
  const isDemoUser = !isPaidUser && user?.role === UserRole.GENERAL_USER;

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
      <div className={`grid grid-cols-1 ${showingApiDoc ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-6`}>
        {/* Documentation Navigation - Hide when showing API docs */}
        {!showingApiDoc && (
          <div className="lg:col-span-1">
            <DocNavigation
              items={generalDocItems}
              activePath={showingApiDoc ? "" : activeDoc}
              onNavigate={(path) => {
                setActiveDoc(path);
                setShowingApiDoc(false);
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
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    showingApiDoc
                      ? "bg-primary-color text-white"
                      : "hover:bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]"
                  }`}
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
        )}

        {/* Documentation Viewer */}
        <div className={showingApiDoc ? 'lg:col-span-1' : 'lg:col-span-3'}>
          {showingApiDoc ? (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={() => {
                  setShowingApiDoc(false);
                  setActiveApiDoc("");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--bg-secondary))] hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-primary))] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Documentation</span>
              </button>

              {/* API Docs Navigation and Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* API Docs List */}
                <div className="lg:col-span-1">
                  <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Code className="w-5 h-5 text-primary-color" />
                      <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                        {isAdminOrSuper ? "Admin" : isPaidUser ? "Paid" : "Demo"} API Docs
                      </h3>
                    </div>
                    <nav className="space-y-1">
                      {apiDocs.map((doc) => (
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
                      ))}
                    </nav>
                  </div>
                </div>

                {/* API Doc Viewer */}
                <div className="lg:col-span-3">
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
                          Choose a topic from the left to view documentation
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <DocViewer docPath={activeDoc} />
          )}
        </div>
      </div>
    </div>
  );
}
