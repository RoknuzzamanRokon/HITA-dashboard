"use client";

import React, { useEffect, useRef } from "react";

export type TabType =
  | "overview"
  | "rooms"
  | "facilities"
  | "policies"
  | "providers"
  | "photos";

export interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface Tab {
  id: TabType;
  label: string;
}

const tabs: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms" },
  { id: "facilities", label: "Facilities" },
  { id: "policies", label: "Policies" },
  { id: "providers", label: "Providers" },
  { id: "photos", label: "Photos" },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabListRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case "ArrowRight":
        event.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        event.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        event.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (nextTab) {
      onTabChange(nextTab.id);
      // Focus the newly selected tab
      setTimeout(() => {
        const tabButton = tabListRef.current?.querySelector(
          `button[data-tab="${nextTab.id}"]`
        ) as HTMLButtonElement;
        tabButton?.focus();
      }, 0);
    }
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label="Hotel information tabs"
      className="border-b border-gray-200 bg-white sticky top-0 z-10"
    >
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={handleKeyDown}
              className={`
                flex-shrink-0 min-h-[44px] px-3 py-2.5 sm:px-4 sm:py-3 
                text-xs sm:text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
