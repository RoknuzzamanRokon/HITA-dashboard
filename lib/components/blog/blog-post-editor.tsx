/**
 * Blog Post Editor Component
 * Rich text editor for creating and editing blog posts
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Eye,
  Upload,
  Image,
  Bold,
  Italic,
  Link,
  List,
  Quote,
  Code,
  X,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";

interface BlogPostEditorProps {
  post?: {
    id?: string;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    category_id: string;
    tags: string[];
    featured_image?: string;
    status: "draft" | "published";
    meta_title?: string;
    meta_description?: string;
  };
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  onSave: (post: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function BlogPostEditor({
  post,
  categories,
  tags,
  onSave,
  onCancel,
  isLoading = false,
  onImageUpload,
}: BlogPostEditorProps) {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    author: post?.author || "Admin User", // Default author
    category_id: post?.category_id || "",
    tags: post?.tags || [],
    featured_image: post?.featured_image || "",
    status: post?.status || ("draft" as "draft" | "published"),
    meta_title: post?.meta_title || "",
    meta_description: post?.meta_description || "",
  });

  const [activeTab, setActiveTab] = useState<"content" | "seo" | "preview">(
    "content",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate read time based on content
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId];

      setFormData((prevForm) => ({
        ...prevForm,
        tags: newTags,
      }));

      return newTags;
    });
  };

  const handleSave = (status: "draft" | "published") => {
    // Validation
    if (!formData.title.trim()) {
      alert("Please enter a title for the post.");
      return;
    }

    if (!formData.content.trim()) {
      alert("Please enter content for the post.");
      return;
    }

    if (!formData.category_id) {
      alert("Please select a category for the post.");
      return;
    }

    if (!formData.author.trim()) {
      alert("Please enter an author name.");
      return;
    }

    const postData = {
      ...formData,
      status,
      tags: selectedTags,
      read_time: calculateReadTime(formData.content),
    };

    console.log("💾 Saving post data:", postData);
    onSave(postData);
  };

  const handleImageUpload = async () => {
    if (!fileInputRef.current) return;
    
    try {
      setUploadingImage(true);
      
      // Trigger file input click
      fileInputRef.current.click();
    } catch (error) {
      console.error("Error initiating image upload:", error);
      alert("Failed to initiate image upload. Please try again.");
      setUploadingImage(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload an image file (JPEG, PNG, GIF, or WebP).');
        setUploadingImage(false);
        return;
      }
      
      if (file.size > maxSize) {
        alert('Image size exceeds 5MB limit. Please upload a smaller image.');
        setUploadingImage(false);
        return;
      }
      
      // If custom upload handler is provided, use it
      if (onImageUpload) {
        const imageUrl = await onImageUpload(file);
        handleInputChange('featured_image', imageUrl);
      } else {
        // Fallback: create a local URL for preview (won't be saved to server)
        const localUrl = URL.createObjectURL(file);
        handleInputChange('featured_image', localUrl);
        alert('Image uploaded locally for preview. To save permanently, implement server-side image upload.');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {post?.id ? "Edit Post" : "Create New Post"}
          </h2>
          <p className="text-gray-600">
            {formData.content
              ? `${calculateReadTime(formData.content)} min read`
              : "Start writing..."}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            loading={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} loading={isLoading}>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="p-6">
              <Input
                placeholder="Enter post title..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-2xl font-bold border-none p-0 focus:ring-0"
              />
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Card>
            <CardHeader>
              <div className="flex space-x-4">
                {[
                  { id: "content", label: "Content" },
                  { id: "seo", label: "SEO" },
                  { id: "preview", label: "Preview" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "content" && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                    <Button variant="ghost" size="sm">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Link className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <List className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Quote className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Code className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleImageUpload}
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Content Editor */}
                  <textarea
                    placeholder="Write your blog post content here..."
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    className="w-full h-96 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      placeholder="Brief description of the post..."
                      value={formData.excerpt}
                      onChange={(e) =>
                        handleInputChange("excerpt", e.target.value)
                      }
                      className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <Input
                      placeholder="SEO title for search engines..."
                      value={formData.meta_title}
                      onChange={(e) =>
                        handleInputChange("meta_title", e.target.value)
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.meta_title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      placeholder="SEO description for search engines..."
                      value={formData.meta_description}
                      onChange={(e) =>
                        handleInputChange("meta_description", e.target.value)
                      }
                      className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.meta_description.length}/160 characters
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "preview" && (
                <div className="prose max-w-none">
                  <h1>{formData.title || "Untitled Post"}</h1>
                  {formData.excerpt && (
                    <p className="text-lg text-gray-600 italic">
                      {formData.excerpt}
                    </p>
                  )}
                  <div className="whitespace-pre-wrap">
                    {formData.content || "No content yet..."}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Settings */}
          <Card>
            <CardHeader title="Post Settings" />
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    handleInputChange("category_id", e.target.value)
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader title="Featured Image" />
            <CardContent>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
              />
              
              {formData.featured_image ? (
                <div className="space-y-3">
                  <img
                    src={formData.featured_image}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange("featured_image", "")}
                    >
                      Remove Image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Replace'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleImageUpload}
                  className="w-full"
                  disabled={uploadingImage}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader title="Tags" />
            <CardContent>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tag.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
