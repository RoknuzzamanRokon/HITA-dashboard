/**
 * Documentation Viewer Component
 * Renders markdown documentation files
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/lib/components/ui/card";
import { FileText, Search, BookOpen } from "lucide-react";
import { Input } from "@/lib/components/ui/input";

interface DocViewerProps {
  docPath: string;
}

export function DocViewer({ docPath }: DocViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/docs/${docPath}`);
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          setContent("# Documentation Not Found\n\nThe requested documentation could not be loaded.");
        }
      } catch (error) {
        console.error("Failed to load documentation:", error);
        setContent("# Error Loading Documentation\n\nPlease try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [docPath]);

  // Simple markdown to HTML converter (basic implementation)
  const renderMarkdown = (markdown: string): string => {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-[rgb(var(--text-primary))] mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-[rgb(var(--text-primary))] mt-8 mb-4 pb-2 border-b border-[rgb(var(--border-primary))]">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-[rgb(var(--text-primary))] mb-6">$1</h1>');

    // Code blocks - with user-select enabled
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-lg p-4 my-4 overflow-x-auto select-text" style="user-select: text; -webkit-user-select: text;"><code class="text-sm select-text" style="user-select: text; -webkit-user-select: text;">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-[rgb(var(--bg-secondary))] px-1.5 py-0.5 rounded text-sm font-mono text-primary-color select-text" style="user-select: text;">$1</code>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[rgb(var(--text-primary))]">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-color hover:text-primary-hover underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>');
    html = html.replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside mb-4">$1</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1">$1</li>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-[rgb(var(--text-primary))]">');
    html = '<p class="mb-4 text-[rgb(var(--text-primary))]">' + html + '</p>';

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary-color bg-[rgb(var(--bg-secondary))] pl-4 py-2 my-4 italic">$1</blockquote>');

    return html;
  };

  // Highlight search term in content
  const highlightSearchTerm = (html: string, term: string): string => {
    if (!term) return html;
    const regex = new RegExp(`(${term})`, 'gi');
    return html.replace(regex, '<mark class="bg-yellow-200 px-1">$1</mark>');
  };

  if (loading) {
    return (
      <Card className="p-6" hover={false}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto mb-4" />
            <p className="text-sm text-[rgb(var(--text-secondary))]">Loading documentation...</p>
          </div>
        </div>
      </Card>
    );
  }

  const renderedHTML = highlightSearchTerm(renderMarkdown(content), searchTerm);

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search in documentation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Content */}
      <Card className="p-6" hover={false}>
        <div
          className="prose prose-sm max-w-none select-text"
          style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
        />
      </Card>
    </div>
  );
}

interface DocNavItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
}

interface DocNavigationProps {
  items: DocNavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
}

export function DocNavigation({ items, activePath, onNavigate }: DocNavigationProps) {
  return (
    <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary-color" />
        <h3 className="font-semibold text-[rgb(var(--text-primary))]">Documentation</h3>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            type="button"
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activePath === item.path
                ? "bg-primary-color text-white"
                : "hover:bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]"
            }`}
          >
            {item.icon || <FileText className="w-4 h-4" />}
            <span className="text-sm font-medium">{item.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
