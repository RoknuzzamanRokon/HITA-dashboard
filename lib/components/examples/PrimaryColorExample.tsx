"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Check } from "lucide-react";

/**
 * Example component showing how to use primary color everywhere
 * This demonstrates all the ways to apply the user's selected color
 */
export const PrimaryColorExample: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Primary Color Examples
      </h2>

      {/* Buttons */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Buttons</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Primary Button
          </button>
          <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Outline Button
          </button>
          <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
            Light Button
          </button>
        </div>
      </div>

      {/* Icons */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Icons</h3>
        <div className="flex gap-4">
          <User className="w-6 h-6 text-blue-600" />
          <Mail className="w-6 h-6 text-blue-600" />
          <Phone className="w-6 h-6 text-blue-600" />
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Profile Card */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Profile Card</h3>
        <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-600 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">John Doe</h4>
              <p className="text-sm text-blue-600">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
            Active
          </span>
          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
            Premium
          </span>
          <span className="px-3 py-1 border border-blue-600 text-blue-600 rounded-full text-sm font-medium">
            Verified
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Progress Bar</h3>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: "70%" }}
          ></div>
        </div>
      </div>

      {/* Checkbox */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Checkbox</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          <span className="text-gray-700">I agree to the terms</span>
        </label>
      </div>

      {/* Links */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Links</h3>
        <div className="space-y-2">
          <a href="#" className="text-blue-600 hover:text-blue-700 underline">
            Learn more
          </a>
          <br />
          <a href="#" className="text-blue-600 hover:text-blue-700">
            View details →
          </a>
        </div>
      </div>
    </div>
  );
};
