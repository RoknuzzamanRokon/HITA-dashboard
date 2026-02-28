"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import { PublicNavigation } from "@/lib/components/layout/public-navigation";
import { blogService, BlogPost } from "@/lib/api/blog";
import { mockBlogPosts } from "@/lib/api/mock-blog-data";
import { marked } from "marked";
import hljs from "highlight.js";
import "./blog-content.css";

export default function BlogPostPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasTrackedViewRef = useRef(false);

  const fallbackPost = useMemo(() => {
    if (!id) return null;
    return mockBlogPosts.find((p) => p.id === id) || null;
  }, [id]);

  // Load highlight.js styles
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);

      try {
        const viewedKey = `blog_viewed_${id}`;
        const alreadyViewed =
          typeof window !== "undefined"
            ? sessionStorage.getItem(viewedKey)
            : null;

        // Track view once per open. If backend already increments view_count and writes to blog_analytics
        // on GET post, this ensures we don't trigger extra increments on re-renders.
        if (!hasTrackedViewRef.current && !alreadyViewed) {
          hasTrackedViewRef.current = true;
          sessionStorage.setItem(viewedKey, new Date().toISOString());
        }

        const res = await blogService.getPost(id);
        if (res.success && res.data) {
          setPost(res.data);
        } else {
          setPost(null);
          setError("Failed to load the blog post.");
        }
      } catch (e) {
        setPost(null);
        setError("Failed to load the blog post.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const renderContent = (content: string) => {
    const looksLikeHtml = /<\w+[^>]*>/.test(content);

    if (looksLikeHtml) {
      return (
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // Configure marked for better markdown parsing
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });

    // Use marked hooks for code highlighting
    marked.use({
      renderer: {
        code({ text, lang }: { text: string; lang?: string }) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              const highlighted = hljs.highlight(text, {
                language: lang,
              }).value;
              return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
            } catch (err) {
              console.error("Highlight error:", err);
            }
          }
          const highlighted = hljs.highlightAuto(text).value;
          return `<pre><code class="hljs">${highlighted}</code></pre>`;
        },
      },
    });

    // Parse markdown to HTML
    const htmlContent = marked.parse(content) as string;

    return (
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  const finalPost = post || fallbackPost;

  return (
    <div className="min-h-screen bg-white">
      <PublicNavigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-primary-color transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading post...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            {fallbackPost ? (
              <p className="text-gray-600">Showing cached content.</p>
            ) : (
              <p className="text-gray-600">Post not found.</p>
            )}
          </div>
        ) : !finalPost ? (
          <div className="py-16 text-center">
            <p className="text-gray-600">Post not found.</p>
          </div>
        ) : (
          <article className="bg-white">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {finalPost.category.name}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(
                  finalPost.published_at || finalPost.created_at,
                ).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {finalPost.read_time} min read
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <User className="w-4 h-4 mr-1" />
                {finalPost.author}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {finalPost.title}
            </h1>

            {finalPost.excerpt && (
              <p className="text-xl text-gray-600 mb-8">{finalPost.excerpt}</p>
            )}

            <div className="border-t border-gray-200 pt-8">
              {renderContent(finalPost.content)}
            </div>

            {finalPost.tags?.length ? (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Tag className="w-4 h-4" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {finalPost.tags.map((t) => (
                    <span
                      key={t.id}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        )}
      </div>
    </div>
  );
}
