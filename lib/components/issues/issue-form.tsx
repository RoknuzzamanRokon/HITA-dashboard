/**
 * Issue Submission Form Component
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/lib/components/ui/card";
import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";
import { Select, SelectOption } from "@/lib/components/ui/select";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import type { IssueCategory, IssuePriority, CreateIssueInput } from "@/lib/types/issue";

interface IssueFormProps {
  onSubmit: (issue: CreateIssueInput) => Promise<void>;
  isSubmitting?: boolean;
}

const categoryOptions: SelectOption[] = [
  { value: "bug", label: "🐛 Bug Report" },
  { value: "feature", label: "✨ Feature Request" },
  { value: "help", label: "❓ Help & Support" },
  { value: "other", label: "📝 Other" },
];

const priorityOptions: SelectOption[] = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "critical", label: "🔴 Critical" },
];

export function IssueForm({ onSubmit, isSubmitting = false }: IssueFormProps) {
  const [formData, setFormData] = useState<CreateIssueInput>({
    title: "",
    description: "",
    category: "bug",
    priority: "medium",
    userEmail: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateIssueInput, string>>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateIssueInput, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (formData.userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "bug",
        priority: "medium",
        userEmail: "",
      });
      setErrors({});

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to submit issue:", error);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary-color" />
          Report an Issue
        </h2>
        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
          Describe your issue and we'll get back to you as soon as possible
        </p>
      </div>

      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">Issue submitted successfully!</p>
            <p className="text-xs text-green-700 mt-0.5">We'll review your issue and get back to you soon.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Issue Title"
          placeholder="Brief description of the issue"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          required
        />

        {/* Category & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            placeholder="Select category"
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as IssueCategory })}
            options={categoryOptions}
            required
          />

          <Select
            label="Priority"
            placeholder="Select priority"
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as IssuePriority })}
            options={priorityOptions}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide details about the issue..."
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] ${
              errors.description ? "border-red-500" : "border-[rgb(var(--border-primary))]"
            }`}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-[rgb(var(--text-tertiary))]">
            {formData.description.length} characters (minimum 20)
          </p>
        </div>

        {/* Email (Optional) */}
        <Input
          label="Email (Optional)"
          type="email"
          placeholder="your.email@example.com"
          value={formData.userEmail}
          onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
          error={errors.userEmail}
          helperText="We'll send updates about your issue to this email"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
          leftIcon={<Send className="w-4 h-4" />}
        >
          {isSubmitting ? "Submitting..." : "Submit Issue"}
        </Button>
      </form>
    </Card>
  );
}
