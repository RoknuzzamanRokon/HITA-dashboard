/**
 * Category Manager Component
 * Manage blog categories with CRUD operations
 */

"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Tag, FileText } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  created_at: string;
}

interface CategoryManagerProps {
  categories: Category[];
  onCreateCategory: (
    category: Omit<Category, "id" | "post_count" | "created_at">,
  ) => void;
  onUpdateCategory: (id: string, category: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  isLoading?: boolean;
}

export function CategoryManager({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading = false,
}: CategoryManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = () => {
    if (!formData.name.trim()) return;

    const slug = generateSlug(formData.name);
    onCreateCategory({
      name: formData.name.trim(),
      slug,
      description: formData.description.trim() || undefined,
    });

    setFormData({ name: "", description: "" });
    setIsCreating(false);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || !editingId) return;

    const slug = generateSlug(formData.name);
    onUpdateCategory(editingId, {
      name: formData.name.trim(),
      slug,
      description: formData.description.trim() || undefined,
    });

    setFormData({ name: "", description: "" });
    setEditingId(null);
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "" });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleDelete = (category: Category) => {
    if (category.post_count > 0) {
      if (
        !confirm(
          `This category has ${category.post_count} posts. Deleting it will remove the category from all posts. Are you sure?`,
        )
      ) {
        return;
      }
    } else {
      if (
        !confirm(
          `Are you sure you want to delete the "${category.name}" category?`,
        )
      ) {
        return;
      }
    }

    onDeleteCategory(category.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600">
            Organize your blog posts with categories
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          disabled={isCreating || editingId !== null}
        >
          Add Category
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader title="Create New Category" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <Input
                  placeholder="Enter category name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {formData.name && (
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: {generateSlug(formData.name)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Optional description..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleCreate}
                  loading={isLoading}
                  disabled={!formData.name.trim()}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Create Category
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="relative">
            {editingId === category.id ? (
              // Edit Form
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                    {formData.name && (
                      <p className="text-xs text-gray-500 mt-1">
                        Slug: {generateSlug(formData.name)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="w-full h-20 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      loading={isLoading}
                      disabled={!formData.name.trim()}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              // Display Mode
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      disabled={isCreating || editingId !== null}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {category.post_count}{" "}
                      {category.post_count === 1 ? "post" : "posts"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Created {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {categories.length === 0 && !isCreating && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first category to start organizing your blog posts.
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create First Category
          </Button>
        </Card>
      )}
    </div>
  );
}
