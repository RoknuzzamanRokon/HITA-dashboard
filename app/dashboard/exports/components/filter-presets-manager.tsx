"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { FilterPreset, ExportFilters, ExportType } from "@/lib/types/exports";
import { Save, FolderOpen, Trash2, X, Check } from "lucide-react";
import { clsx } from "clsx";

const STORAGE_KEY = "export_filter_presets";

export interface FilterPresetsManagerProps {
  exportType: ExportType;
  currentFilters: ExportFilters;
  onLoadPreset: (filters: ExportFilters) => void;
}

export function FilterPresetsManager({
  exportType,
  currentFilters,
  onLoadPreset,
}: FilterPresetsManagerProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [nameError, setNameError] = useState("");

  // Load presets from localStorage on mount
  useEffect(() => {
    loadPresetsFromStorage();
  }, []);

  // Load presets from localStorage
  const loadPresetsFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const presetsWithDates = parsed.map((preset: any) => ({
          ...preset,
          createdAt: new Date(preset.createdAt),
        }));
        setPresets(presetsWithDates);
      }
    } catch (error) {
      console.error("Failed to load presets from storage:", error);
    }
  };

  // Save presets to localStorage
  const savePresetsToStorage = (updatedPresets: FilterPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
    } catch (error) {
      console.error("Failed to save presets to storage:", error);
    }
  };

  // Save current filters as a new preset
  const savePreset = () => {
    // Validate preset name
    if (!presetName.trim()) {
      setNameError("Preset name is required");
      return;
    }

    // Check for duplicate names
    if (
      presets.some(
        (p) =>
          p.name.toLowerCase() === presetName.trim().toLowerCase() &&
          p.exportType === exportType
      )
    ) {
      setNameError("A preset with this name already exists");
      return;
    }

    // Create new preset
    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: presetName.trim(),
      exportType,
      filters: currentFilters,
      createdAt: new Date(),
    };

    // Add to presets array
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);

    // Close modal and reset form
    setIsModalOpen(false);
    setPresetName("");
    setNameError("");
  };

  // Load a preset and populate filter panel
  const loadPreset = (preset: FilterPreset) => {
    onLoadPreset(preset.filters);
    setIsDropdownOpen(false);
  };

  // Delete a preset
  const deletePreset = (presetId: string) => {
    const updatedPresets = presets.filter((p) => p.id !== presetId);
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
  };

  // Get presets for current export type
  const filteredPresets = presets.filter((p) => p.exportType === exportType);

  return (
    <div className="flex gap-2">
      {/* Load Preset Dropdown */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          leftIcon={<FolderOpen className="w-4 h-4" />}
          disabled={filteredPresets.length === 0}
        >
          Load Preset
        </Button>

        {isDropdownOpen && filteredPresets.length > 0 && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown menu */}
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
              <div className="p-2">
                {filteredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group"
                  >
                    <button
                      type="button"
                      onClick={() => loadPreset(preset)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-900">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created {preset.createdAt.toLocaleDateString()}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePreset(preset.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete preset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save Current Filters Button */}
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={() => setIsModalOpen(true)}
        leftIcon={<Save className="w-4 h-4" />}
      >
        Save Preset
      </Button>

      {/* Save Preset Modal */}
      {isModalOpen && (
        <>
          {/* Modal backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
            onClick={() => {
              setIsModalOpen(false);
              setPresetName("");
              setNameError("");
            }}
          >
            {/* Modal content */}
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Save Filter Preset
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setPresetName("");
                    setNameError("");
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <Input
                  label="Preset Name"
                  placeholder="Enter a name for this preset"
                  value={presetName}
                  onChange={(e) => {
                    setPresetName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  error={nameError}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      savePreset();
                    }
                  }}
                />
                <p className="mt-3 text-sm text-gray-500">
                  Save your current filter configuration to quickly reuse it
                  later.
                </p>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsModalOpen(false);
                    setPresetName("");
                    setNameError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={savePreset}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Save Preset
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
