"use client";

import React from "react";
import { useTheme } from "@/lib/contexts/theme-context";

/**
 * Theme Preview Component
 * Shows the current theme's color palette for testing and documentation
 */
export function ThemePreview() {
  const { resolvedTheme } = useTheme();

  const colorGroups = [
    {
      title: "Backgrounds",
      colors: [
        { name: "Primary", var: "--bg-primary" },
        { name: "Secondary", var: "--bg-secondary" },
        { name: "Tertiary", var: "--bg-tertiary" },
        { name: "Hover", var: "--bg-hover" },
        { name: "Active", var: "--bg-active" },
      ],
    },
    {
      title: "Text Colors",
      colors: [
        { name: "Primary", var: "--text-primary" },
        { name: "Secondary", var: "--text-secondary" },
        { name: "Tertiary", var: "--text-tertiary" },
      ],
    },
    {
      title: "Borders",
      colors: [
        { name: "Primary", var: "--border-primary" },
        { name: "Secondary", var: "--border-secondary" },
        { name: "Focus", var: "--border-focus" },
      ],
    },
    {
      title: "Status Colors",
      colors: [
        { name: "Success", var: "--success" },
        { name: "Warning", var: "--warning" },
        { name: "Error", var: "--error" },
        { name: "Info", var: "--info" },
      ],
    },
  ];

  return (
    <div className="p-6 bg-[rgb(var(--bg-primary))] rounded-xl border border-[rgb(var(--border-primary))]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
          Theme Preview
        </h2>
        <p className="text-[rgb(var(--text-secondary))]">
          Current theme: <span className="font-semibold">{resolvedTheme}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colorGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
              {group.title}
            </h3>
            <div className="space-y-2">
              {group.colors.map((color) => (
                <div
                  key={color.name}
                  className="flex items-center gap-3 p-3 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]"
                >
                  <div
                    className="w-12 h-12 rounded-md border-2 border-[rgb(var(--border-secondary))]"
                    style={{ backgroundColor: `rgb(var(${color.var}))` }}
                  />
                  <div>
                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                      {color.name}
                    </div>
                    <div className="text-xs text-[rgb(var(--text-tertiary))] font-mono">
                      {color.var}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Component Examples */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
          Component Examples
        </h3>

        <div className="space-y-4">
          {/* Buttons */}
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
              Buttons
            </p>
            <div className="flex gap-2 flex-wrap">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
              Badges
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="badge-success">Success</span>
              <span className="badge-warning">Warning</span>
              <span className="badge-error">Error</span>
              <span className="badge-info">Info</span>
            </div>
          </div>

          {/* Alerts */}
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
              Alerts
            </p>
            <div className="space-y-2">
              <div className="alert alert-success">
                This is a success alert message
              </div>
              <div className="alert alert-warning">
                This is a warning alert message
              </div>
              <div className="alert alert-error">
                This is an error alert message
              </div>
              <div className="alert alert-info">
                This is an info alert message
              </div>
            </div>
          </div>

          {/* Card */}
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
              Card
            </p>
            <div className="card p-4">
              <h4 className="text-[rgb(var(--text-primary))] font-semibold mb-2">
                Card Title
              </h4>
              <p className="text-[rgb(var(--text-secondary))]">
                This is a card component with automatic theming support.
              </p>
            </div>
          </div>

          {/* Input */}
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
              Input
            </p>
            <input
              type="text"
              className="input w-full max-w-md"
              placeholder="Enter text here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
