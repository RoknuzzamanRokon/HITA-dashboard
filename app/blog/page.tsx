"use client";

import React from "react";
import Link from "next/link";
import { PublicNavigation } from "@/lib/components/layout/public-navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  ArrowRight,
  Globe,
  BookOpen,
  Code,
  Zap,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { blogService, BlogPost } from "@/lib/api/blog";
import { mockBlogPosts, mockBlogCategories } from "@/lib/api/mock-blog-data";

// Icon mapping for categories
const getCategoryIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case "tutorial":
      return <BookOpen className="w-6 h-6" />;
    case "performance":
      return <Zap className="w-6 h-6" />;
    case "security":
      return <Shield className="w-6 h-6" />;
    case "development":
      return <Code className="w-6 h-6" />;
    default:
      return <BookOpen className="w-6 h-6" />;
  }
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "All",
    "Tutorial",
    "Performance",
    "Security",
    "Development",
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Fetch blog posts and categories on component mount
  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true);

    const fetchBlogData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch published posts only for public blog
        const postsResponse = await blogService.getPosts({
          status: "published",
          sort: "date",
          order: "desc",
        });

        if (postsResponse.success && postsResponse.data) {
          setBlogPosts(postsResponse.data.posts);

          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(postsResponse.data.posts.map((post) => post.category.name)),
          );
          setCategories(["All", ...uniqueCategories]);
        } else {
          // Show error to user instead of silently falling back to mock data
          console.error("Blog API failed:", postsResponse.error);
          setError("Failed to load blog posts. Please try again later.");
          setBlogPosts([]);
        }
      } catch (err) {
        console.error("Error fetching blog data:", err);
        setError("Failed to load blog posts");
        // Fallback to mock data on error
        setBlogPosts(
          mockBlogPosts.filter((post) => post.status === "published"),
        );
        const uniqueCategories = Array.from(
          new Set(mockBlogPosts.map((post) => post.category.name)),
        );
        setCategories(["All", ...uniqueCategories]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category.name === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Developer Blog
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tutorials, best practices, and insights to help you build amazing
            hotel booking experiences
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {isClient &&
              categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading blog posts from database...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-600 mb-4">
                This might be due to server connectivity issues or the blog
                service being temporarily unavailable.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {selectedCategory === "All"
                  ? "No blog posts found. Check back later for updates!"
                  : "No blog posts found for the selected category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="block group"
                >
                  <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {post.category.name}
                        </span>
                        <div className="text-blue-600 group-hover:scale-110 transition-transform">
                          {getCategoryIcon(post.category.name)}
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-gray-600 mb-6">{post.excerpt}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(
                            post.published_at || post.created_at,
                          ).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.read_time} min read
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-gray-700 font-medium">
                            {post.author}
                          </span>
                        </div>

                        <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag.id}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get the latest tutorials and API updates delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-color focus:border-transparent"
            />
            <button className="bg-primary-color text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-color rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HotelAPI</span>
              </div>
              <p className="text-gray-400">
                The most comprehensive hotel API platform for developers and
                businesses worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HotelAPI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
