"use client";

import React from "react";

export type PhotoCategory =
  | "All"
  | "Room"
  | "Restaurant"
  | "Lobby"
  | "Sports and Entertainment"
  | "General view";

export interface CategoryFilterProps {
  activeCategory: PhotoCategory;
  onCategoryChange: (category: PhotoCategory) => void;
  availableCategories: PhotoCategory[];
}

const categoryButtons: PhotoCategory[] = [
  "All",
  "Room",
  "Restaurant",
  "Lobby",
  "Sports and Entertainment",
  "General view",
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onCategoryChange,
  availableCategories,
}) => {
  // Filter buttons to only show categories that have photos (plus "All")
  const visibleCategories = categoryButtons.filter(
    (category) => category === "All" || availableCategories.includes(category)
  );

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        Filter by Category
      </h4>
      <div className="flex flex-wrap gap-2">
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
              aria-pressed={isActive}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
