/**
 * Time Period Selector Component
 * Beautiful time period selection with data update animations
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/lib/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimePeriod = "7d" | "30d" | "90d" | "1y";

export interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  loading?: boolean;
  className?: string;
}

const periodOptions: {
  value: TimePeriod;
  label: string;
  description: string;
}[] = [
  { value: "7d", label: "Last 7 Days", description: "Recent activity" },
  { value: "30d", label: "Last 30 Days", description: "Monthly overview" },
  { value: "90d", label: "Last 90 Days", description: "Quarterly trends" },
  { value: "1y", label: "Last Year", description: "Annual insights" },
];

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  loading = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const selectedOption = periodOptions.find(
    (option) => option.value === selectedPeriod
  );

  const handlePeriodSelect = async (period: TimePeriod) => {
    if (period === selectedPeriod || loading) return;

    setIsAnimating(true);
    setIsOpen(false);

    // Trigger animation before calling onChange
    setTimeout(() => {
      onPeriodChange(period);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={cn(
          "min-w-[160px] justify-between transition-all duration-200",
          isOpen && "ring-2 ring-blue-500 ring-opacity-50",
          (loading || isAnimating) && "opacity-75"
        )}
        rightIcon={
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        }
        leftIcon={<Calendar className="w-4 h-4" />}
      >
        <span className="flex flex-col items-start">
          <span className="text-sm font-medium">{selectedOption?.label}</span>
          <span className="text-xs text-gray-500">
            {selectedOption?.description}
          </span>
        </span>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="py-2">
              {periodOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handlePeriodSelect(option.value)}
                  disabled={loading || isAnimating}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-150",
                    "flex flex-col space-y-1 disabled:opacity-50 disabled:cursor-not-allowed",
                    selectedPeriod === option.value &&
                      "bg-blue-50 border-r-2 border-blue-500"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {option.description}
                  </span>

                  {/* Selection indicator */}
                  {selectedPeriod === option.value && (
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs text-blue-600 font-medium">
                        Currently selected
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Loading indicator */}
            {(loading || isAnimating) && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Updating data...</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Quick period buttons for common selections
export const QuickPeriodButtons: React.FC<{
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  loading?: boolean;
  className?: string;
}> = ({ selectedPeriod, onPeriodChange, loading = false, className }) => {
  return (
    <div className={cn("flex space-x-2", className)}>
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedPeriod === option.value ? "primary" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(option.value)}
          disabled={loading}
          className={cn(
            "transition-all duration-200",
            selectedPeriod === option.value && "shadow-lg scale-105"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};
