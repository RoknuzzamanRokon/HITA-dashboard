/**
 * Documentation Viewer Component
 * Renders markdown documentation files with GitHub-flavored markdown support
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/lib/components/ui/card";
import { FileText, Search, BookOpen } from "lucide-react";
import { Input } from "@/lib/components/ui/input";
import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml"; // for HTML
import "highlight.js/styles/github.css"; // GitHub light theme

// Register languages
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);

interface DocViewerProps {
  docPath: string;
}

export function DocViewer({ docPath }: DocViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Configure marked for GitHub-flavored markdown
  useEffect(() => {
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });
  }, []);

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

  // Handle anchor link clicks for smooth scrolling
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            // Find the scrollable container (parent with overflow-y-auto)
            let scrollContainer: HTMLElement | null = element.parentElement;
            while (scrollContainer && scrollContainer !== document.body) {
              const overflow = window.getComputedStyle(scrollContainer).overflowY;
              if (overflow === 'auto' || overflow === 'scroll') {
                break;
              }
              scrollContainer = scrollContainer.parentElement;
            }

            // Scroll within the container if found, otherwise scroll the page
            if (scrollContainer && scrollContainer !== document.body) {
              const containerRect = scrollContainer.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              const scrollTop = scrollContainer.scrollTop + elementRect.top - containerRect.top - 80; // 80px offset for header
              scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' });
            } else {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Update URL without triggering page reload
            window.history.pushState(null, '', `#${id}`);
          }
        }
      }
    };

    // Add event listener to the document
    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  // Render markdown using marked library
  const renderMarkdown = (markdown: string): string => {
    try {
      let html = marked.parse(markdown) as string;
      
      // Generate IDs for headers to enable anchor links
      let headerId = 0;
      const headerMap = new Map<string, string>();
      
      // Add custom styling to the generated HTML
      html = html
        // Style headers and add IDs for anchor links (GitHub-style: emojis stripped, spaces/special chars become hyphens)
        .replace(/<h1>(.+?)<\/h1>/g, (match, content) => {
          // GitHub converts emojis and special chars to hyphens
          const id = content
            .toLowerCase()
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')   // Remove emojis completely (don't replace with hyphen)
            .replace(/[^\w\s-]/g, '-')                 // Replace other special chars with hyphen
            .replace(/\s+/g, '-');                     // Replace spaces with hyphens
            // Do NOT remove leading/trailing hyphens to match user's TOC (e.g. "-overview")
          headerMap.set(content, id);
          return `<h1 id="${id}" class="text-3xl font-bold text-[rgb(var(--text-primary))] mb-6 mt-8 first:mt-0 scroll-mt-20">${content}</h1>`;
        })
        .replace(/<h2>(.+?)<\/h2>/g, (match, content) => {
          const id = content
            .toLowerCase()
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
            .replace(/[^\w\s-]/g, '-')
            .replace(/\s+/g, '-');
          headerMap.set(content, id);
          return `<h2 id="${id}" class="text-2xl font-bold text-[rgb(var(--text-primary))] mt-8 mb-4 pb-2 border-b border-[rgb(var(--border-primary))] scroll-mt-20">${content}</h2>`;
        })
        .replace(/<h3>(.+?)<\/h3>/g, (match, content) => {
          const id = content
            .toLowerCase()
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
            .replace(/[^\w\s-]/g, '-')
            .replace(/\s+/g, '-');
          headerMap.set(content, id);
          return `<h3 id="${id}" class="text-xl font-semibold text-[rgb(var(--text-primary))] mt-6 mb-3 scroll-mt-20">${content}</h3>`;
        })
        .replace(/<h4>(.+?)<\/h4>/g, (match, content) => {
          const id = content
            .toLowerCase()
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
            .replace(/[^\w\s-]/g, '-')
            .replace(/\s+/g, '-');
          return `<h4 id="${id}" class="text-lg font-semibold text-[rgb(var(--text-primary))] mt-4 mb-2 scroll-mt-20">${content}</h4>`;
        })
        .replace(/<h5>(.+?)<\/h5>/g, (match, content) => {
          const id = content
            .toLowerCase()
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
            .replace(/[^\w\s-]/g, '-')
            .replace(/\s+/g, '-');
          return `<h5 id="${id}" class="text-base font-semibold text-[rgb(var(--text-primary))] mt-3 mb-2 scroll-mt-20">${content}</h5>`;
        })
        .replace(/<h6>(.+?)<\/h6>/g, (match, content) => {
          const id = content
            .toLowerCase()
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
            .replace(/[^\w\s-]/g, '-')
            .replace(/\s+/g, '-');
          return `<h6 id="${id}" class="text-sm font-semibold text-[rgb(var(--text-primary))] mt-3 mb-2 scroll-mt-20">${content}</h6>`;
        })
        
        // Style paragraphs
        .replace(/<p>/g, '<p class="mb-4 text-[rgb(var(--text-primary))] leading-relaxed">')
        
        // Make links in markdown work (including anchor links)
        .replace(/<a href="(#[^"]+)"/g, '<a href="$1" class="text-primary-color hover:text-primary-hover underline cursor-pointer"')
        .replace(/<a href="([^#][^"]*)"/g, '<a href="$1" class="text-primary-color hover:text-primary-hover underline cursor-pointer" target="_blank" rel="noopener noreferrer"')
        
        // Style lists
        .replace(/<ul>/g, '<ul class="list-disc list-outside mb-4 ml-6 space-y-1">')
        .replace(/<ol>/g, '<ol class="list-decimal list-outside mb-4 ml-6 space-y-1">')
        .replace(/<li>/g, '<li class="text-[rgb(var(--text-primary))] leading-relaxed">')
        
        // Style code blocks with syntax highlighting and add copy button
        .replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
          const codeId = `code-${headerId++}`;
          // Decode HTML entities
          const decodedCode = code
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          
          // Apply syntax highlighting
          let highlightedCode;
          try {
            if (hljs.getLanguage(lang)) {
              highlightedCode = hljs.highlight(decodedCode, { language: lang }).value;
            } else {
              highlightedCode = hljs.highlightAuto(decodedCode).value;
            }
          } catch (e) {
            highlightedCode = decodedCode;
          }
          
          return `<div class="relative group my-6">
            <div class="flex items-center justify-between bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-primary))] border-b-0 rounded-t-lg px-4 py-2">
              <span class="text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase">${lang}</span>
              <button 
                onclick="navigator.clipboard.writeText(document.getElementById('${codeId}').textContent); this.innerHTML = '<svg class=\\'w-3 h-3 inline mr-1\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M5 13l4 4L19 7\\'></path></svg>Copied!'; setTimeout(() => this.innerHTML = '<svg class=\\'w-3 h-3 inline mr-1\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\\'></path></svg>Copy', 2000);"
                class="flex items-center gap-1 px-3 py-1 text-xs bg-[rgb(var(--bg-secondary))] hover:bg-primary-color text-[rgb(var(--text-secondary))] hover:text-white rounded transition-colors"
              ><svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>Copy</button>
            </div>
            <pre class="!mt-0 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-b-lg p-4 overflow-x-auto select-text" style="user-select: text; -webkit-user-select: text;"><code id="${codeId}" class="hljs text-sm font-mono select-text language-${lang}" style="user-select: text; -webkit-user-select: text; background: transparent;">${highlightedCode}</code></pre>
          </div>`;
        })
        .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
          const codeId = `code-${headerId++}`;
          // Decode HTML entities
          const decodedCode = code
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          
          // Auto-detect language
          const highlighted = hljs.highlightAuto(decodedCode).value;
          const detectedLang = hljs.highlightAuto(decodedCode).language || 'text';
          
          return `<div class="relative group my-6">
            <div class="flex items-center justify-between bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-primary))] border-b-0 rounded-t-lg px-4 py-2">
              <span class="text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase">${detectedLang}</span>
              <button 
                onclick="navigator.clipboard.writeText(document.getElementById('${codeId}').textContent); this.innerHTML = '<svg class=\\'w-3 h-3 inline mr-1\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M5 13l4 4L19 7\\'></path></svg>Copied!'; setTimeout(() => this.innerHTML = '<svg class=\\'w-3 h-3 inline mr-1\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\\'></path></svg>Copy', 2000);"
                class="flex items-center gap-1 px-3 py-1 text-xs bg-[rgb(var(--bg-secondary))] hover:bg-primary-color text-[rgb(var(--text-secondary))] hover:text-white rounded transition-colors"
              ><svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>Copy</button>
            </div>
            <pre class="!mt-0 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-b-lg p-4 overflow-x-auto select-text" style="user-select: text; -webkit-user-select: text;"><code id="${codeId}" class="hljs text-sm font-mono select-text" style="user-select: text; -webkit-user-select: text; background: transparent;">${highlighted}</code></pre>
          </div>`;
        })
        
        // Style inline code (not inside pre)
        .replace(/(?<!<pre[^>]*>.*)<code class="text-sm font-mono select-text"/g, '<code class="bg-[rgb(var(--bg-secondary))] px-1.5 py-0.5 rounded text-sm font-mono text-primary-color select-text"')
        
        // Style blockquotes
        .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-primary-color bg-[rgb(var(--bg-secondary))] pl-4 py-2 my-4 italic text-[rgb(var(--text-secondary))]">')
        
        // Style tables
        .replace(/<table>/g, '<table class="min-w-full border-collapse border border-[rgb(var(--border-primary))] my-4">')
        .replace(/<thead>/g, '<thead class="bg-[rgb(var(--bg-secondary))]">')
        .replace(/<th>/g, '<th class="border border-[rgb(var(--border-primary))] px-4 py-2 text-left font-semibold text-[rgb(var(--text-primary))]">')
        .replace(/<td>/g, '<td class="border border-[rgb(var(--border-primary))] px-4 py-2 text-[rgb(var(--text-primary))]">')
        .replace(/<tr>/g, '<tr class="hover:bg-[rgb(var(--bg-tertiary))] transition-colors">')
        
        // Style horizontal rules
        .replace(/<hr>/g, '<hr class="my-8 border-t border-[rgb(var(--border-primary))]/>')
        
        // Style task lists (GitHub-style checkboxes)
        .replace(/<input type="checkbox" disabled/g, '<input type="checkbox" disabled class="mr-2 cursor-not-allowed"');
      
      return html;
    } catch (error) {
      console.error("Markdown parsing error:", error);
      return `<p class="text-red-500">Error parsing markdown</p>`;
    }
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
          className="max-w-none select-text"
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
