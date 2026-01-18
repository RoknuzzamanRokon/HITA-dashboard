"use client";

/**
 * System Settings Page
 * 
 * Comprehensive system configuration interface with all important settings
 */

import React, { useState } from "react";
import {
  Settings,
  Globe,
  Database,
  Shield,
  Mail,
  Info,
  HardDrive,
  Palette,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Server,
  Key,
  Lock,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useTheme, type Theme } from "@/lib/contexts/theme-context";
import { Card } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Toggle } from "@/lib/components/ui/toggle";
import { ColorPicker } from "@/lib/components/ui/color-picker";
import { RadioGroup, type RadioOption } from "@/lib/components/ui/radio-group";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";

type SettingsTab = "general" | "api" | "database" | "security" | "email" | "system" | "backup" | "appearance";

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { settings, updateSettings } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "HITA Dashboard",
    siteUrl: "https://api.example.com",
    timezone: "UTC",
    language: "en",
    maintenanceMode: false,
    enableRegistration: true,
    enableNotifications: true,
  });

  // API Settings State
  const [apiSettings, setApiSettings] = useState({
    apiBaseUrl: "https://api.example.com/v1.0",
    apiTimeout: 30,
    rateLimitEnabled: true,
    rateLimitRequests: 100,
    rateLimitWindow: 60,
    enableCors: true,
    apiKeyRequired: true,
  });

  // Database Settings State
  const [databaseSettings, setDatabaseSettings] = useState({
    connectionPool: 20,
    queryTimeout: 30,
    enableLogging: true,
    backupEnabled: true,
    backupFrequency: "daily",
    retentionDays: 30,
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    requireStrongPassword: true,
    passwordMinLength: 8,
    sessionTimeout: 3600,
    enable2FA: false,
    enableIpWhitelist: false,
    enableAuditLog: true,
    maxLoginAttempts: 5,
    lockoutDuration: 900,
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpSecure: true,
    fromEmail: "noreply@example.com",
    fromName: "HITA System",
    enableEmailNotifications: true,
  });

  // System Info (read-only)
  const systemInfo = {
    version: "1.0.0",
    environment: "production",
    nodeVersion: "18.0.0",
    uptime: "15 days",
    memoryUsage: "2.4 GB / 8 GB",
    cpuUsage: "12%",
    diskUsage: "45%",
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Globe className="h-4 w-4" /> },
    { id: "api", label: "API", icon: <Key className="h-4 w-4" /> },
    { id: "database", label: "Database", icon: <Database className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
    { id: "system", label: "System Info", icon: <Info className="h-4 w-4" /> },
    { id: "backup", label: "Backup", icon: <HardDrive className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
  ];

  const themeOptions: RadioOption[] = [
    {
      value: "light",
      label: "Light",
      description: "Clean and bright interface",
      icon: <span className="text-lg">☀️</span>,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Easy on the eyes in low light",
      icon: <span className="text-lg">🌙</span>,
    },
    {
      value: "system",
      label: "System",
      description: "Follows your system preference",
      icon: <span className="text-lg">💻</span>,
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    updateSettings({
      theme: "system",
      accentColor: "blue",
      borderRadius: "md",
      animations: true,
      reducedMotion: false,
    });
  };

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission={Permission.VIEW_SYSTEM_SETTINGS}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                System Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Configure and manage all system settings and preferences
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Reset
              </Button>
              <Button
                variant="gradient"
                onClick={handleSave}
                leftIcon={<Save className="h-4 w-4" />}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSaveSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-from-bottom">
            <Card className="bg-green-50 border-green-200 p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Settings saved successfully!
                </span>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeTab === "general" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                    <p className="text-sm text-gray-600">Basic system configuration</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site URL
                    </label>
                    <input
                      type="url"
                      value={generalSettings.siteUrl}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={generalSettings.language}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, language: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Toggle
                      checked={generalSettings.maintenanceMode}
                      onChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, maintenanceMode: checked })
                      }
                      label="Maintenance Mode"
                      description="Enable to put the system in maintenance mode"
                    />

                    <Toggle
                      checked={generalSettings.enableRegistration}
                      onChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, enableRegistration: checked })
                      }
                      label="Enable User Registration"
                      description="Allow new users to register"
                    />

                    <Toggle
                      checked={generalSettings.enableNotifications}
                      onChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, enableNotifications: checked })
                      }
                      label="Enable Notifications"
                      description="Enable system-wide notifications"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* API Settings */}
            {activeTab === "api" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Key className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
                    <p className="text-sm text-gray-600">Manage API endpoints and rate limiting</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Base URL
                    </label>
                    <input
                      type="url"
                      value={apiSettings.apiBaseUrl}
                      onChange={(e) =>
                        setApiSettings({ ...apiSettings, apiBaseUrl: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        value={apiSettings.apiTimeout}
                        onChange={(e) =>
                          setApiSettings({ ...apiSettings, apiTimeout: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Toggle
                      checked={apiSettings.rateLimitEnabled}
                      onChange={(checked) =>
                        setApiSettings({ ...apiSettings, rateLimitEnabled: checked })
                      }
                      label="Enable Rate Limiting"
                      description="Limit API requests per time window"
                    />

                    {apiSettings.rateLimitEnabled && (
                      <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Requests per Window
                          </label>
                          <input
                            type="number"
                            value={apiSettings.rateLimitRequests}
                            onChange={(e) =>
                              setApiSettings({
                                ...apiSettings,
                                rateLimitRequests: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Window (seconds)
                          </label>
                          <input
                            type="number"
                            value={apiSettings.rateLimitWindow}
                            onChange={(e) =>
                              setApiSettings({
                                ...apiSettings,
                                rateLimitWindow: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <Toggle
                      checked={apiSettings.enableCors}
                      onChange={(checked) =>
                        setApiSettings({ ...apiSettings, enableCors: checked })
                      }
                      label="Enable CORS"
                      description="Allow cross-origin requests"
                    />

                    <Toggle
                      checked={apiSettings.apiKeyRequired}
                      onChange={(checked) =>
                        setApiSettings({ ...apiSettings, apiKeyRequired: checked })
                      }
                      label="Require API Key"
                      description="Require API key for all requests"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Database Settings */}
            {activeTab === "database" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Database Settings</h2>
                    <p className="text-sm text-gray-600">Configure database connections and backups</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Connection Pool Size
                      </label>
                      <input
                        type="number"
                        value={databaseSettings.connectionPool}
                        onChange={(e) =>
                          setDatabaseSettings({
                            ...databaseSettings,
                            connectionPool: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Query Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        value={databaseSettings.queryTimeout}
                        onChange={(e) =>
                          setDatabaseSettings({
                            ...databaseSettings,
                            queryTimeout: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Toggle
                      checked={databaseSettings.enableLogging}
                      onChange={(checked) =>
                        setDatabaseSettings({ ...databaseSettings, enableLogging: checked })
                      }
                      label="Enable Query Logging"
                      description="Log all database queries for debugging"
                    />

                    <Toggle
                      checked={databaseSettings.backupEnabled}
                      onChange={(checked) =>
                        setDatabaseSettings({ ...databaseSettings, backupEnabled: checked })
                      }
                      label="Enable Automatic Backups"
                      description="Automatically backup database on schedule"
                    />

                    {databaseSettings.backupEnabled && (
                      <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Backup Frequency
                          </label>
                          <select
                            value={databaseSettings.backupFrequency}
                            onChange={(e) =>
                              setDatabaseSettings({
                                ...databaseSettings,
                                backupFrequency: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Retention (days)
                          </label>
                          <input
                            type="number"
                            value={databaseSettings.retentionDays}
                            onChange={(e) =>
                              setDatabaseSettings({
                                ...databaseSettings,
                                retentionDays: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                    <p className="text-sm text-gray-600">Configure security and authentication</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordMinLength: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            maxLoginAttempts: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lockout Duration (seconds)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.lockoutDuration}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            lockoutDuration: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Toggle
                      checked={securitySettings.requireStrongPassword}
                      onChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          requireStrongPassword: checked,
                        })
                      }
                      label="Require Strong Password"
                      description="Enforce complex password requirements"
                    />

                    <Toggle
                      checked={securitySettings.enable2FA}
                      onChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, enable2FA: checked })
                      }
                      label="Enable Two-Factor Authentication"
                      description="Require 2FA for all users"
                    />

                    <Toggle
                      checked={securitySettings.enableIpWhitelist}
                      onChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, enableIpWhitelist: checked })
                      }
                      label="Enable IP Whitelist"
                      description="Restrict access to whitelisted IPs only"
                    />

                    <Toggle
                      checked={securitySettings.enableAuditLog}
                      onChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, enableAuditLog: checked })
                      }
                      label="Enable Audit Logging"
                      description="Log all security-related events"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Mail className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Email Settings</h2>
                    <p className="text-sm text-gray-600">Configure SMTP and email notifications</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpPort: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpUser}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={emailSettings.fromName}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, fromName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Toggle
                      checked={emailSettings.smtpSecure}
                      onChange={(checked) =>
                        setEmailSettings({ ...emailSettings, smtpSecure: checked })
                      }
                      label="Use Secure Connection (TLS/SSL)"
                      description="Enable secure SMTP connection"
                    />

                    <Toggle
                      checked={emailSettings.enableEmailNotifications}
                      onChange={(checked) =>
                        setEmailSettings({ ...emailSettings, enableEmailNotifications: checked })
                      }
                      label="Enable Email Notifications"
                      description="Send email notifications for system events"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* System Information */}
            {activeTab === "system" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Info className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">System Information</h2>
                    <p className="text-sm text-gray-600">View system status and details</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Version</div>
                      <div className="text-lg font-semibold text-gray-900">{systemInfo.version}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Environment</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {systemInfo.environment}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Node Version</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {systemInfo.nodeVersion}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Uptime</div>
                      <div className="text-lg font-semibold text-gray-900">{systemInfo.uptime}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Memory Usage</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {systemInfo.memoryUsage}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">CPU Usage</div>
                      <div className="text-lg font-semibold text-gray-900">{systemInfo.cpuUsage}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Disk Usage</div>
                      <div className="text-lg font-semibold text-gray-900">{systemInfo.diskUsage}</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Backup Settings */}
            {activeTab === "backup" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <HardDrive className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Backup & Restore</h2>
                    <p className="text-sm text-gray-600">Manage system backups</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Backup Information</h3>
                    </div>
                    <p className="text-sm text-blue-800">
                      Automatic backups are configured in Database Settings. Manual backups can be
                      created using the button below.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="gradient" leftIcon={<HardDrive className="h-4 w-4" />}>
                      Create Backup Now
                    </Button>
                    <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>
                      Restore from Backup
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Backups</h3>
                    <div className="space-y-2">
                      <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Full System Backup</div>
                          <div className="text-sm text-gray-600">2 hours ago</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Database Backup</div>
                          <div className="text-sm text-gray-600">1 day ago</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Palette className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                    <p className="text-sm text-gray-600">Customize the visual appearance</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <RadioGroup
                    value={settings.theme}
                    onChange={(value) => updateSettings({ theme: value as Theme })}
                    options={themeOptions}
                    name="theme"
                    label="Theme Mode"
                  />

                  <ColorPicker
                    value={settings.accentColor}
                    onChange={(value) => updateSettings({ accentColor: value })}
                    label="Accent Color"
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
