/**
 * Blog Management Dashboard
 * Complete blog management interface for admins
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { UserRole } from "@/lib/types/auth";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag,
  User,
  BarChart3,
  Settings,
  FileText,
  Clock,
  Globe,
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  RefreshCw,
  Download,
  Upload,
  BookOpen,
  Zap,
  Shield,
  Code,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import {
  BlogPostEditor,
  BlogAnalytics,
  CategoryManager,
} from "@/lib/components/blog";
import {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogAnalytics as BlogAnalyticsType,
  blogService,
} from "@/lib/api/blog";
import {
  mockBlogPosts,
  mockBlogCategories,
  mockBlogTags,
  mockBlogAnalytics,
} from "@/lib/api/mock-blog-data";

// Mock data for demonstration - using shared mock data
const mockPosts: BlogPost[] = mockBlogPosts;

const mockCategories: BlogCategory[] = mockBlogCategories;

const mockTags: BlogTag[] = mockBlogTags;

// Helper functions
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const generateExcerpt = (content: string, maxLength: number = 150) => {
  const plainText = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + "..."
    : plainText;
};

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

const mockAnalytics: BlogAnalyticsType = mockBlogAnalytics;

export default function BlogDashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState<
    "posts" | "analytics" | "categories" | "settings"
  >("posts");
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [categories, setCategories] = useState<BlogCategory[]>(mockCategories);
  const [analytics, setAnalytics] = useState<BlogAnalyticsType>(mockAnalytics);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Check if user has admin permissions
  const isAdmin =
    user?.role === UserRole.ADMIN_USER || user?.role === UserRole.SUPER_USER;

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      // Redirect non-admin users
      window.location.href = "/dashboard";
    } else if (isAuthenticated && isAdmin) {
      // Load blog data for admin users
      loadBlogData();
    }
  }, [isAuthenticated, isAdmin]);

  // Load blog data from API
  const loadBlogData = async () => {
    try {
      setIsDataLoading(true);
      console.log("📚 Loading blog data from API...");

      // Load posts
      const postsResponse = await blogService.getPosts({
        status: "all",
        sort: "date",
        order: "desc",
      });

      if (postsResponse.success && postsResponse.data) {
        setPosts(postsResponse.data.posts);
        console.log(
          "✅ Loaded posts from API:",
          postsResponse.data.posts.length,
        );
      } else {
        console.warn("⚠️ Failed to load posts from API, using mock data");
        setPosts(mockPosts);
      }

      // Load categories
      const categoriesResponse = await blogService.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
        console.log(
          "✅ Loaded categories from API:",
          categoriesResponse.data.length,
        );
      } else {
        console.warn("⚠️ Failed to load categories from API, using mock data");
        setCategories(mockCategories);
      }

      // Load analytics
      const analyticsResponse = await blogService.getAnalytics();
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
        console.log("✅ Loaded analytics from API");
      } else {
        console.warn("⚠️ Failed to load analytics from API, using mock data");
        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error("❌ Error loading blog data:", error);
      // Fallback to mock data
      setPosts(mockPosts);
      setCategories(mockCategories);
      setAnalytics(mockAnalytics);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Filter posts based on search and filters
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.category.id === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || post.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Event handlers
  const handleCreatePost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      console.log("📤 Uploading image:", file.name, file.type, file.size);
      
      const response = await blogService.uploadImage(file);
      
      if (response.success && response.data) {
        console.log("✅ Image uploaded successfully:", response.data.url);
        return response.data.url;
      } else {
        console.error("❌ Image upload failed:", response.error);
        throw new Error(response.error?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("❌ Image upload error:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  const handleEditPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPost(post);
      setShowEditor(true);
    }
  };

  const handleSavePost = async (postData: any) => {
    try {
      setIsDataLoading(true);

      if (editingPost) {
        // Update existing post via API
        console.log("🔄 Updating existing post:", editingPost.id);

        const response = await blogService.updatePost(editingPost.id, postData);

        if (response.success && response.data) {
          // Update local state with API response
          setPosts(
            posts.map((p) => (p.id === editingPost.id ? response.data! : p)),
          );
          console.log("✅ Post updated successfully:", response.data);
        } else {
          // Fallback to local update if API fails
          console.warn("⚠️ API update failed, updating locally");
          const updatedPost: BlogPost = {
            ...editingPost,
            ...postData,
            category:
              categories.find((c) => c.id === postData.category_id) ||
              editingPost.category,
            tags: postData.tags.map(
              (tagId: string) =>
                mockTags.find((t) => t.id === tagId) || {
                  id: tagId,
                  name: `Tag ${tagId}`,
                  slug: tagId,
                  post_count: 0,
                  created_at: new Date().toISOString(),
                },
            ),
            updated_at: new Date().toISOString(),
            published_at:
              postData.status === "published" && !editingPost.published_at
                ? new Date().toISOString()
                : editingPost.published_at,
          };

          setPosts(
            posts.map((p) => (p.id === editingPost.id ? updatedPost : p)),
          );
        }
      } else {
        // Create new post via API
        console.log("📝 Creating new post:", postData.title);

        const response = await blogService.createPost(postData);

        if (response.success && response.data) {
          // Add new post from API response
          setPosts([response.data, ...posts]);
          console.log("✅ Post created successfully:", response.data);
          alert("Post created successfully and saved to database!");
        } else {
          // Show error to user instead of silently falling back to local creation
          console.error("❌ API creation failed:", response.error);
          alert("Failed to save post to database: " + (response.error?.message || "Unknown error"));
          throw new Error("Failed to create post: " + JSON.stringify(response.error));

          const selectedCategory = categories.find(
            (c) => c.id === postData.category_id,
          );
          const selectedTags = postData.tags.map(
            (tagId: string) =>
              mockTags.find((t) => t.id === tagId) || {
                id: tagId,
                name: `Tag ${tagId}`,
                slug: tagId,
                post_count: 0,
                created_at: new Date().toISOString(),
              },
          );

          if (!selectedCategory) {
            alert("Please select a category for the post.");
            return;
          }

          if (!postData.title.trim()) {
            alert("Please enter a title for the post.");
            return;
          }

          // If we get here, it means the API call failed and we already showed an error
          // We don't want to create local posts - they should be saved to the database
          return;
        }
      }

      setShowEditor(false);
      setEditingPost(null);
    } catch (error) {
      console.error("❌ Failed to save post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingPost(null);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        console.log("🗑️ Deleting post:", postId);

        const response = await blogService.deletePost(postId);

        if (response.success) {
          setPosts(posts.filter((p) => p.id !== postId));
          console.log("✅ Post deleted successfully");
        } else {
          // Fallback to local deletion if API fails
          console.warn("⚠️ API deletion failed, deleting locally");
          setPosts(posts.filter((p) => p.id !== postId));
        }
      } catch (error) {
        console.error("❌ Failed to delete post:", error);
        // Still remove from local state as fallback
        setPosts(posts.filter((p) => p.id !== postId));
        alert("Failed to delete post from server, but removed locally.");
      }
    }
  };

  const handleViewPost = (postId: string) => {
    // TODO: Open post in new tab
    console.log("View post:", postId);
  };

  const handleRefreshData = async () => {
    console.log("🔄 Refreshing blog data...");
    await loadBlogData();
  };

  // Category management handlers
  const handleCreateCategory = (categoryData: any) => {
    const newCategory: BlogCategory = {
      id: Date.now().toString(),
      ...categoryData,
      post_count: 0,
      created_at: new Date().toISOString(),
    };
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (id: string, categoryData: any) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, ...categoryData } : c)),
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need admin privileges to access the blog management dashboard.
          </p>
        </Card>
      </div>
    );
  }

  // Show editor if editing or creating
  if (showEditor) {
    return (
      <BlogPostEditor
        post={
          editingPost
            ? {
                id: editingPost.id,
                title: editingPost.title,
                content: editingPost.content,
                excerpt: editingPost.excerpt,
                author: editingPost.author,
                category_id: editingPost.category.id,
                tags: editingPost.tags.map((t) => t.id),
                featured_image: editingPost.featured_image,
                status: editingPost.status,
                meta_title: editingPost.meta_title,
                meta_description: editingPost.meta_description,
              }
            : undefined
        }
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        tags={mockTags.map((t) => ({ id: t.id, name: t.name }))}
        onSave={handleSavePost}
        onCancel={handleCancelEdit}
        isLoading={isDataLoading}
        onImageUpload={handleImageUpload}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">
            Manage your blog content, analytics, and settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            loading={isDataLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            onClick={handleCreatePost}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Post
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total_posts}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total_views.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total_subscribers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "posts", label: "Posts", icon: FileText },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "categories", label: "Categories", icon: Tag },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Posts List */}
          <Card>
            <CardHeader
              title="Blog Posts"
              subtitle={`${filteredPosts.length} posts found`}
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {post.excerpt}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {post.author}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {post.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.view_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPost(post.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPost(post.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "analytics" && <BlogAnalytics />}

      {activeTab === "categories" && (
        <CategoryManager
          categories={categories}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          isLoading={isDataLoading}
        />
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Blog Settings"
              subtitle="Configure blog preferences"
            />
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    General Settings
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blog Title
                      </label>
                      <Input defaultValue="Developer Blog" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blog Description
                      </label>
                      <Input defaultValue="Tutorials, best practices, and insights for developers" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    SEO Settings
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title
                      </label>
                      <Input defaultValue="HotelAPI Developer Blog" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <Input defaultValue="Learn how to build amazing hotel booking experiences with our comprehensive guides and tutorials." />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
