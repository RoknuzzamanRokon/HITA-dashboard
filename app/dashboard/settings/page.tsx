"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import {
  Palette,
  Monitor,
  Sun,
  Moon,
  Zap,
  Eye,
  Square,
  Save,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { useTheme, type Theme } from "@/lib/contexts/theme-context";
import { Card } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Toggle } from "@/lib/components/ui/toggle";
import { ColorPicker } from "@/lib/components/ui/color-picker";
import { RadioGroup, type RadioOption } from "@/lib/components/ui/radio-group";

export default function SettingsPage() {
  const { settings, updateSettings } = useTheme();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const themeOptions: RadioOption[] = [
    {
      value: "light",
      label: "Light",
      description: "Clean and bright interface",
      icon: <Sun className="w-4 h-4" />,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Easy on the eyes in low light",
      icon: <Moon className="w-4 h-4" />,
    },
    {
      value: "system",
      label: "System",
      description: "Follows your system preference",
      icon: <Monitor className="w-4 h-4" />,
    },
  ];

  const borderRadiusOptions: RadioOption[] = [
    {
      value: "none",
      label: "None",
      description: "Sharp corners",
    },
    {
      value: "sm",
      label: "Small",
      description: "Slightly rounded",
    },
    {
      value: "md",
      label: "Medium",
      description: "Moderately rounded",
    },
    {
      value: "lg",
      label: "Large",
      description: "Very rounded",
    },
    {
      value: "xl",
      label: "Extra Large",
      description: "Maximum roundness",
    },
  ];

  const handleSave = () => {
    // Settings are automatically saved via updateSettings
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

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your dashboard appearance and preferences
        </p>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-from-bottom">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Settings saved successfully!
              </span>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Settings */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Theme & Appearance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize the visual appearance
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Theme Selection */}
            <RadioGroup
              value={settings.theme}
              onChange={(value) => updateSettings({ theme: value as Theme })}
              options={themeOptions}
              name="theme"
              label="Theme Mode"
            />

            {/* Accent Color */}
            <ColorPicker
              value={settings.accentColor}
              onChange={(value) => updateSettings({ accentColor: value })}
              label="Accent Color"
            />
          </div>
        </Card>

        {/* Interface Settings */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Square className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Interface
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adjust interface elements
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Border Radius */}
            <RadioGroup
              value={settings.borderRadius}
              onChange={(value) =>
                updateSettings({ borderRadius: value as any })
              }
              options={borderRadiusOptions}
              name="borderRadius"
              label="Border Radius"
              orientation="horizontal"
              size="sm"
            />
          </div>
        </Card>

        {/* Animation Settings */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Animations
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control motion and effects
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Toggle
              checked={settings.animations}
              onChange={(checked) => updateSettings({ animations: checked })}
              label="Enable Animations"
              description="Show smooth transitions and micro-interactions"
            />

            <Toggle
              checked={settings.reducedMotion}
              onChange={(checked) => updateSettings({ reducedMotion: checked })}
              label="Reduced Motion"
              description="Minimize animations for accessibility"
            />
          </div>
        </Card>

        {/* Accessibility Settings */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Accessibility
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Improve usability and accessibility
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Additional accessibility options will be available in future
                updates. Current settings already include focus management,
                keyboard navigation, and screen reader support.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Reset to Defaults
        </Button>

        <Button
          variant="gradient"
          onClick={handleSave}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
