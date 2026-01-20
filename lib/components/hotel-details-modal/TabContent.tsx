"use client";

import React from "react";
import type { TabType } from "./TabNavigation";

export interface TabContentProps {
  activeTab: TabType;
  children: React.ReactNode;
}

export const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  children,
}) => {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${activeTab}`}
      aria-labelledby={`tab-${activeTab}`}
      tabIndex={0}
      className="px-4 py-4 sm:px-6 sm:py-6 focus:outline-none animate-fadeIn"
    >
      {children}
    </div>
  );
};
