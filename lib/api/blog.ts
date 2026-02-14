/**
 * Blog API Service
 * Handles all blog-related API calls
 */

import { apiClient } from "./client";

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    author: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    tags: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    featured_image?: string;
    status: "draft" | "published";
    view_count: number;
    read_time: number;
    created_at: string;
    updated_at: string;
    published_at?: string;
    meta_title?: string;
    meta_description?: string;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    post_count: number;
    created_at: string;
}

export interface BlogTag {
    id: string;
    name: string;
    slug: string;
    post_count: number;
    created_at: string;
}

export interface BlogAnalytics {
    total_posts: number;
    total_views: number;
    total_subscribers: number;
    popular_posts: BlogPost[];
    popular_categories: BlogCategory[];
    recent_activity: any[];
}

export interface CreatePostRequest {
    title: string;
    content: string;
    excerpt?: string;
    author: string;
    category_id: string;
    tags: string[];
    featured_image?: string;
    status: "draft" | "published";
    meta_title?: string;
    meta_description?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> { }

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> { }

export interface BlogPostsResponse {
    posts: BlogPost[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface BlogSearchParams {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    sort?: "date" | "title" | "popularity";
    order?: "asc" | "desc";
    status?: "published" | "draft" | "all";
}

class BlogService {
    private baseUrl = "/blog";
    private unwrap<T>(payload: any): T | undefined {
        if (!payload) return undefined;
        if (payload.success && payload.data !== undefined) {
            return payload.data as T;
        }
        return payload as T;
    }

    /**
     * Get all blog posts with filtering and pagination
     */
    async getPosts(params: BlogSearchParams = {}): Promise<{ success: boolean; data?: BlogPostsResponse; error?: any }> {
        try {
            const queryParams = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await apiClient.get(`${this.baseUrl}/posts?${queryParams.toString()}`, false);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogPostsResponse>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to fetch blog posts:", error);
            return { success: false, error };
        }
    }

    /**
     * Get a single blog post by ID
     */
    async getPost(id: string): Promise<{ success: boolean; data?: BlogPost; error?: any }> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/posts/${id}`, false);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogPost>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to fetch blog post:", error);
            return { success: false, error };
        }
    }

    /**
     * Create a new blog post (Admin only)
     */
    async createPost(postData: CreatePostRequest): Promise<{ success: boolean; data?: BlogPost; error?: any }> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/posts`, postData);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogPost>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to create blog post:", error);
            return { success: false, error };
        }
    }

    /**
     * Update an existing blog post (Admin only)
     */
    async updatePost(id: string, postData: UpdatePostRequest): Promise<{ success: boolean; data?: BlogPost; error?: any }> {
        try {
            const response = await apiClient.put(`${this.baseUrl}/posts/${id}`, postData);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogPost>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to update blog post:", error);
            return { success: false, error };
        }
    }

    /**
     * Delete a blog post (Admin only)
     */
    async deletePost(id: string): Promise<{ success: boolean; error?: any }> {
        try {
            const response = await apiClient.delete(`${this.baseUrl}/posts/${id}`);
            return { success: response.success, error: response.error };
        } catch (error) {
            console.error("Failed to delete blog post:", error);
            return { success: false, error };
        }
    }

    /**
     * Get all categories
     */
    async getCategories(): Promise<{ success: boolean; data?: BlogCategory[]; error?: any }> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/categories`, false);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogCategory[]>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            return { success: false, error };
        }
    }

    /**
     * Create a new category (Admin only)
     */
    async createCategory(categoryData: CreateCategoryRequest): Promise<{ success: boolean; data?: BlogCategory; error?: any }> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/categories`, categoryData);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogCategory>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to create category:", error);
            return { success: false, error };
        }
    }

    /**
     * Update a category (Admin only)
     */
    async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<{ success: boolean; data?: BlogCategory; error?: any }> {
        try {
            const response = await apiClient.put(`${this.baseUrl}/categories/${id}`, categoryData);
            return response;
        } catch (error) {
            console.error("Failed to update category:", error);
            return { success: false, error };
        }
    }

    /**
     * Delete a category (Admin only)
     */
    async deleteCategory(id: string): Promise<{ success: boolean; error?: any }> {
        try {
            const response = await apiClient.delete(`${this.baseUrl}/categories/${id}`);
            return response;
        } catch (error) {
            console.error("Failed to delete category:", error);
            return { success: false, error };
        }
    }

    /**
     * Get all tags
     */
    async getTags(): Promise<{ success: boolean; data?: BlogTag[]; error?: any }> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/tags`, false);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogTag[]>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to fetch tags:", error);
            return { success: false, error };
        }
    }

    /**
     * Search blog posts
     */
    async searchPosts(query: string, params: Omit<BlogSearchParams, 'search'> = {}): Promise<{ success: boolean; data?: BlogPostsResponse; error?: any }> {
        try {
            const queryParams = new URLSearchParams({ q: query });

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await apiClient.get(`${this.baseUrl}/search?${queryParams.toString()}`, false);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogPostsResponse>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to search blog posts:", error);
            return { success: false, error };
        }
    }

    /**
     * Get blog analytics (Admin only)
     */
    async getAnalytics(): Promise<{ success: boolean; data?: BlogAnalytics; error?: any }> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/analytics/stats`);
            return {
                success: response.success,
                data: response.success ? this.unwrap<BlogAnalytics>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to fetch blog analytics:", error);
            return { success: false, error };
        }
    }

    /**
     * Upload an image for blog posts (Admin only)
     */
    async uploadImage(file: File): Promise<{ success: boolean; data?: { url: string }; error?: any }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await apiClient.post(`${this.baseUrl}/images/upload`, formData, true, 0);
            return {
                success: response.success,
                data: response.success ? this.unwrap<{ url: string }>(response.data) : undefined,
                error: response.error,
            };
        } catch (error) {
            console.error("Failed to upload blog image:", error);
            return { success: false, error };
        }
    }

    /**
     * Subscribe to newsletter
     */
    async subscribeNewsletter(email: string, preferences?: any): Promise<{ success: boolean; error?: any }> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/newsletter/subscribe`, {
                email,
                preferences: preferences || {},
            });
            return response;
        } catch (error) {
            console.error("Failed to subscribe to newsletter:", error);
            return { success: false, error };
        }
    }

    /**
     * Unsubscribe from newsletter
     */
    async unsubscribeNewsletter(email: string, token: string): Promise<{ success: boolean; error?: any }> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/newsletter/unsubscribe`, {
                email,
                token,
            });
            return response;
        } catch (error) {
            console.error("Failed to unsubscribe from newsletter:", error);
            return { success: false, error };
        }
    }
}

export const blogService = new BlogService();
