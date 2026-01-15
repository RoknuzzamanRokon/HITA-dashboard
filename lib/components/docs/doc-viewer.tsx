/**
 * Documentation Viewer Component
 * Renders markdown documentation files with GitHub-flavored markdown support
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);

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
    const container = contentRef.current;
    if (!container) return;

    const handleAnchorClick = (e: MouseEvent) => {
      try {
        // Don't interfere with text selection - only handle clicks on links
        const target = (e.target as HTMLElement).closest('a');
        if (!target) {
          // Not a link, allow default behavior (text selection)
          return;
        }
        
        // Check if user is trying to select text (mouse drag)
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          // User is selecting text, don't interfere
          return;
        }
        
        console.log('🖱️ Click event detected on link:', e.target);
        
        const href = target.getAttribute('href');
        console.log('🔗 Found href:', href);
        
        if (!href || !href.startsWith('#')) {
          console.log('❌ Not an anchor link, allowing default behavior');
          return;
        }
        
        let id = href.substring(1);
      if (!id) {
        console.log('❌ No ID in href');
        return;
      }
      
      // Decode URL-encoded characters
      id = decodeURIComponent(id);
      
      console.log('🔍 Clicked link, looking for element with ID:', id);
        
        // Try to find the element by ID
        let element = document.getElementById(id);
        
        // If not found, try with different ID formats (handle markdown TOC variations)
        if (!element) {
          // Try exact match with different case
          element = document.getElementById(id.toLowerCase());
        }
        if (!element) {
          // Try with leading hyphen added (for TOC links like #-overview)
          element = document.getElementById(`-${id.replace(/^-+/, '')}`);
        }
        if (!element) {
          // Try with leading hyphen removed (for generated IDs)
          const cleanId = id.replace(/^-+/, '');
          element = document.getElementById(cleanId);
        }
        if (!element) {
          // Try with trailing hyphens removed
          const cleanId = id.replace(/-+$/, '');
          element = document.getElementById(cleanId);
        }
        if (!element) {
          // Try finding by partial match (for numbered sections like "1--health-check")
          // First, try to match numbered sections exactly (preserve double hyphens)
          const numberMatch = id.match(/^(\d+)(-+)(.+)$/);
          if (numberMatch) {
            const [, number, hyphens, rest] = numberMatch;
            // Try with double hyphen format first (as generated)
            const doubleHyphenId = `${number}--${rest}`;
            element = document.getElementById(doubleHyphenId);
            if (!element) {
              // Try with single hyphen
              const singleHyphenId = `${number}-${rest}`;
              element = document.getElementById(singleHyphenId);
            }
            if (!element) {
              // Try with triple hyphen (in case of variations)
              const tripleHyphenId = `${number}---${rest}`;
              element = document.getElementById(tripleHyphenId);
            }
          }
          
          // If still not found, try normalization (but be more careful)
          if (!element) {
            const allElements = document.querySelectorAll('[id]');
            for (const el of allElements) {
              const elId = el.getAttribute('id') || '';
              // For numbered sections, preserve the number prefix exactly
              const numberMatchId = id.match(/^(\d+)(-+)(.+)$/);
              const numberMatchEl = elId.match(/^(\d+)(-+)(.+)$/);
              
              if (numberMatchId && numberMatchEl) {
                // Both are numbered - compare number and rest separately
                const [, numId, , restId] = numberMatchId;
                const [, numEl, , restEl] = numberMatchEl;
                // Normalize the rest part (remove extra hyphens, lowercase)
                const normalizedRestId = restId.toLowerCase().replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                const normalizedRestEl = restEl.toLowerCase().replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                if (numId === numEl && normalizedRestId === normalizedRestEl) {
                  element = el as HTMLElement;
                  break;
                }
              } else {
                // Normalize non-numbered IDs (remove extra hyphens, case insensitive)
                const normalizedId = id.toLowerCase().replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                const normalizedElId = elId.toLowerCase().replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                if (normalizedId === normalizedElId) {
                  element = el as HTMLElement;
                  break;
                }
              }
            }
          }
        }
        
        if (element) {
          // Only prevent default if we found the element and can handle it
          e.preventDefault();
          e.stopPropagation();
          
          try {
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
            // Account for sticky search bar (approximately 80px)
            const offset = 100;
            
            if (!element) {
              console.error('❌ Element became null during scroll calculation');
              return;
            }
            
            if (scrollContainer && scrollContainer !== document.body) {
              const containerRect = scrollContainer.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              const scrollTop = scrollContainer.scrollTop + elementRect.top - containerRect.top - offset;
              scrollContainer.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
            } else {
              // Use scrollIntoView with offset
              const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
              window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
            }
            
            // Update URL without triggering page reload
            window.history.pushState(null, '', `#${id}`);
          } catch (error) {
            console.error('❌ Error scrolling to element:', error);
          }
        } else {
          // Debug: Log all available IDs to help troubleshoot
          const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.getAttribute('id')).filter(Boolean);
          console.warn(`❌ Element with id "${id}" not found.`);
          console.log('📋 Available header IDs:', allIds.filter(id => id && (id.startsWith('-') || id.includes('--'))).slice(0, 30));
          console.log('📋 All IDs (first 30):', allIds.slice(0, 30));
          
          // Try one more time with a more aggressive search
          const searchVariations = [
            id,
            id.toLowerCase(),
            `-${id.replace(/^-+/, '')}`,
            id.replace(/^-+/, ''),
            id.replace(/-+$/, ''),
            id.replace(/-+/g, '-'),
            // Try with URL encoding
            encodeURIComponent(id),
            decodeURIComponent(id),
          ];
          
          for (const variation of searchVariations) {
            const found = document.getElementById(variation);
            if (found) {
              console.log(`✅ Found element with variation: "${variation}"`);
              element = found;
              break;
            }
          }
          
          // Try querySelector with attribute selector as another fallback
          if (!element && container) {
            // Try to find by partial ID match using querySelector
            try {
              const cleanId = id.replace(/^-+/, '').replace(/[^a-zA-Z0-9-]/g, '');
              if (cleanId) {
                const partialMatch = container.querySelector(`[id*="${cleanId}"]`) as HTMLElement;
                if (partialMatch) {
                  console.log(`✅ Found element by partial ID match: "${partialMatch.getAttribute('id')}"`);
                  element = partialMatch;
                }
              }
            } catch (e) {
              console.warn('⚠️ Error in partial ID match:', e);
            }
          }
          
          // Last resort: try to find by text content in headers
          if (!element && container && container instanceof Element) {
            // Extract the expected text from the TOC link
            const linkText = target.textContent?.trim() || '';
            if (linkText) {
              // Helper to remove emojis and numbers from text
              const normalizeText = (text: string): string => {
                try {
                  return text
                    .split('')
                    .filter(char => {
                      const code = char.codePointAt(0) || 0;
                      // Remove emojis (high Unicode ranges)
                      return !(code >= 0x1F300 && code <= 0x1F9FF);
                    })
                    .join('')
                    .replace(/^\d+\.?\s*/, '') // Remove leading numbers like "1. " or "1 "
                    .trim()
                    .toLowerCase();
                } catch (e) {
                  console.warn('⚠️ Error normalizing text:', e);
                  return text.toLowerCase().trim();
                }
              };
              
              try {
                // Find all headers and try to match by text content
                if (container && container.querySelectorAll) {
                  const headers = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
                  for (const header of Array.from(headers)) {
                    try {
                      const headerText = header.textContent?.trim() || '';
                      const normalizedLinkText = normalizeText(linkText);
                      const normalizedHeaderText = normalizeText(headerText);
                      
                      // Try exact match first
                      if (normalizedLinkText === normalizedHeaderText) {
                        console.log(`✅ Found element by exact text match: "${headerText}"`);
                        element = header as HTMLElement;
                        break;
                      }
                      
                      // Try partial match (link text is contained in header or vice versa)
                      if (normalizedHeaderText.includes(normalizedLinkText) ||
                          normalizedLinkText.includes(normalizedHeaderText)) {
                        console.log(`✅ Found element by partial text match: "${headerText}"`);
                        element = header as HTMLElement;
                        break;
                      }
                    } catch (headerError) {
                      console.warn('⚠️ Error processing header:', headerError);
                      continue;
                    }
                  }
                }
              } catch (e) {
                console.warn('⚠️ Error in text-based matching:', e);
              }
            }
          }
          
          if (element) {
            // Found element in fallback search, now scroll to it
            // Only prevent default if we found the element and can handle it
            e.preventDefault();
            e.stopPropagation();
            
            try {
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
              // Account for sticky search bar (approximately 80px)
              const offset = 100;
              
              if (scrollContainer && scrollContainer !== document.body && element) {
                const containerRect = scrollContainer.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                const scrollTop = scrollContainer.scrollTop + elementRect.top - containerRect.top - offset;
                scrollContainer.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
              } else if (element) {
                // Use scrollIntoView with offset
                const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
              }
              
              // Update URL without triggering page reload
              window.history.pushState(null, '', `#${id}`);
            } catch (error) {
              console.error('❌ Error scrolling to element:', error);
            }
          } else {
            console.warn(`⚠️ Could not find element with id "${id}" after all search attempts.`);
            
            // Debug: Log all available IDs to help troubleshoot
            try {
              const allIds = Array.from(document.querySelectorAll('[id]'))
                .map(el => el.getAttribute('id'))
                .filter(Boolean)
                .slice(0, 50);
              console.log('📋 Available IDs in document (first 50):', allIds);
              
              // Try to find similar IDs
              const similarIds = allIds.filter(existingId => {
                const normalized = existingId?.toLowerCase().replace(/-+/g, '-');
                const normalizedSearch = id.toLowerCase().replace(/-+/g, '-');
                return normalized?.includes(normalizedSearch) || normalizedSearch.includes(normalized || '');
              });
              if (similarIds.length > 0) {
                console.log('🔍 Similar IDs found:', similarIds);
              }
            } catch (debugError) {
              console.warn('⚠️ Error in debug logging:', debugError);
            }
            
            // Final fallback: Try browser's native anchor behavior
            // Use a small timeout to ensure DOM is ready, then let browser handle it
            setTimeout(() => {
              try {
                // Try one more time with the exact ID
                const finalAttempt = document.getElementById(id) || 
                                   document.getElementById(id.toLowerCase()) ||
                                   document.querySelector(`[id*="${id.replace(/^-+/, '')}"]`);
                
                if (finalAttempt) {
                  finalAttempt.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  // Update URL
                  window.history.pushState(null, '', `#${id}`);
                } else {
                  // Last resort: set hash and let browser handle it
                  window.location.hash = id;
                }
              } catch (e) {
                console.warn('⚠️ Error in final fallback:', e);
                // Set hash as absolute last resort
                window.location.hash = id;
              }
            }, 50);
            
            // Don't prevent default - let browser handle it as fallback
            return; // Allow browser's default anchor behavior
          }
        }
      } catch (error) {
        // Catch any unexpected errors and fall back to browser default behavior
        console.warn('⚠️ Unexpected error in anchor click handler:', error);
        // Don't prevent default - let browser handle the anchor link naturally
        return;
      }
    };

    // Add event listener to the container (event delegation)
    container.addEventListener('click', handleAnchorClick, true);

    return () => {
      container.removeEventListener('click', handleAnchorClick, true);
    };
  }, [content]); // Re-attach when content changes

  // Render markdown using marked library
  const renderMarkdown = (markdown: string): string => {
    try {
      let html = marked.parse(markdown) as string;
      
      // Generate IDs for headers to enable anchor links
      let headerId = 0;
      const headerMap = new Map<string, string>();
      
      // Helper function to generate consistent IDs from header text (GitHub-style)
      // This matches how most markdown processors generate anchor IDs
      // Handles emojis, numbers, and preserves format that matches TOC links
      const generateHeaderId = (text: string): string => {
        // Extract text content (remove HTML tags if any)
        let textContent = text.replace(/<[^>]*>/g, '').trim();
        
        // Check if text starts with an emoji (for TOC format like "#-overview")
        // Emojis are typically in high Unicode ranges
        const firstChar = textContent.charAt(0);
        const firstCharCode = firstChar ? firstChar.codePointAt(0) || 0 : 0;
        // Check if first character is likely an emoji (high Unicode ranges)
        const startsWithEmoji = firstCharCode >= 0x1F300 && firstCharCode <= 0x1F9FF;
        
        // Check if text starts with a number (like "1. Health Check")
        const numberMatch = textContent.match(/^(\d+)\.?\s*/);
        const hasLeadingNumber = numberMatch !== null;
        const numberPrefix = hasLeadingNumber ? numberMatch[1] : '';
        
        // Remove the number prefix from processing
        if (hasLeadingNumber) {
          textContent = textContent.substring(numberMatch[0].length).trim();
        }
        
        // Process the text - remove emojis by filtering out high Unicode characters
        let processedText = textContent
          .toLowerCase()
          .split('')
          .filter(char => {
            const code = char.codePointAt(0) || 0;
            // Keep only characters that are NOT in emoji ranges
            return !(code >= 0x1F300 && code <= 0x1F9FF);
          })
          .join('');
        
        let id = processedText
          .replace(/[^\w\s-]/g, '')                 // Remove special chars (keep only word chars, spaces, hyphens)
          .replace(/\s+/g, '-')                     // Replace spaces with hyphens
          .replace(/-+/g, '-')                      // Replace multiple hyphens with single hyphen
          .replace(/^-+|-+$/g, '');                 // Remove leading/trailing hyphens
        
        // Handle different ID formats based on TOC expectations
        if (hasLeadingNumber) {
          // Format: "1--health-check" (number, double hyphen, then text)
          id = id ? `${numberPrefix}--${id}` : `${numberPrefix}--`;
        } else if (startsWithEmoji) {
          // If original text started with emoji, add leading hyphen (matches TOC format like "#-overview")
          // This handles cases like "🎯 Overview" → "-overview"
          id = id ? `-${id}` : '-';
        } else if (!id) {
          // If empty after processing, just use a hyphen
          id = '-';
        }
        
        console.log(`🏷️ Generated ID for "${text}": "${id}" (startsWithEmoji: ${startsWithEmoji}, hasLeadingNumber: ${hasLeadingNumber})`);
        
        return id;
      };
      
      // Add custom styling to the generated HTML
      html = html
        // Style headers and add IDs for anchor links (GitHub-style) - ensure text is selectable
        .replace(/<h1>(.+?)<\/h1>/g, (match, content) => {
          const id = generateHeaderId(content);
          headerMap.set(content, id);
          return `<h1 id="${id}" class="text-3xl font-bold text-[rgb(var(--text-primary))] mb-6 mt-8 first:mt-0 scroll-mt-20 select-text" style="user-select: text; -webkit-user-select: text; cursor: text;">${content}</h1>`;
        })
        .replace(/<h2>(.+?)<\/h2>/g, (match, content) => {
          const id = generateHeaderId(content);
          headerMap.set(content, id);
          return `<h2 id="${id}" class="text-2xl font-bold text-[rgb(var(--text-primary))] mt-8 mb-4 pb-2 border-b border-[rgb(var(--border-primary))] scroll-mt-20 select-text" style="user-select: text; -webkit-user-select: text; cursor: text;">${content}</h2>`;
        })
        .replace(/<h3>(.+?)<\/h3>/g, (match, content) => {
          const id = generateHeaderId(content);
          headerMap.set(content, id);
          return `<h3 id="${id}" class="text-xl font-semibold text-[rgb(var(--text-primary))] mt-6 mb-3 scroll-mt-20 select-text" style="user-select: text; -webkit-user-select: text; cursor: text;">${content}</h3>`;
        })
        .replace(/<h4>(.+?)<\/h4>/g, (match, content) => {
          const id = generateHeaderId(content);
          return `<h4 id="${id}" class="text-lg font-semibold text-[rgb(var(--text-primary))] mt-4 mb-2 scroll-mt-20 select-text" style="user-select: text; -webkit-user-select: text; cursor: text;">${content}</h4>`;
        })
        .replace(/<h5>(.+?)<\/h5>/g, (match, content) => {
          const id = generateHeaderId(content);
          return `<h5 id="${id}" class="text-base font-semibold text-[rgb(var(--text-primary))] mt-3 mb-2 scroll-mt-20 select-text" style="user-select: text; -webkit-user-select: text; cursor: text;">${content}</h5>`;
        })
        .replace(/<h6>(.+?)<\/h6>/g, (match, content) => {
          const id = generateHeaderId(content);
          return `<h6 id="${id}" class="text-sm font-semibold text-[rgb(var(--text-primary))] mt-3 mb-2 scroll-mt-20 select-text" style="user-select: text; -webkit-user-select: text; cursor: text;">${content}</h6>`;
        })
        
        // Style paragraphs - ensure text is selectable
        .replace(/<p>/g, '<p class="mb-4 text-[rgb(var(--text-primary))] leading-relaxed select-text" style="user-select: text; -webkit-user-select: text; cursor: text;">')
        
        // Make links in markdown work (including anchor links)
        // Anchor links (internal navigation) - these will be handled by our click handler
        .replace(/<a href="(#[^"]+)"/g, '<a href="$1" class="text-primary-color hover:text-primary-hover underline cursor-pointer transition-colors" style="pointer-events: auto; cursor: pointer;"')
        // External links
        .replace(/<a href="([^#][^"]*)"/g, '<a href="$1" class="text-primary-color hover:text-primary-hover underline cursor-pointer transition-colors" target="_blank" rel="noopener noreferrer" style="pointer-events: auto; cursor: pointer;"')
        
        // Style lists - ensure text is selectable
        .replace(/<ul>/g, '<ul class="list-disc list-outside mb-4 ml-6 space-y-1 select-text" style="user-select: text; -webkit-user-select: text;">')
        .replace(/<ol>/g, '<ol class="list-decimal list-outside mb-4 ml-6 space-y-1 select-text" style="user-select: text; -webkit-user-select: text;">')
        .replace(/<li>/g, '<li class="text-[rgb(var(--text-primary))] leading-relaxed select-text" style="user-select: text; -webkit-user-select: text; cursor: text;">')
        
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
      {/* Sticky Search */}
      <div className="sticky top-0 z-10 bg-[rgb(var(--bg-primary))] pb-4 pt-0 -mt-8 -mx-8 px-8 border-b border-[rgb(var(--border-primary))]">
        <div className="max-w-md py-4">
          <Input
            placeholder="Search in documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Content */}
      <Card className="p-6" hover={false} style={{ position: 'relative', zIndex: 1 }}>
        <style dangerouslySetInnerHTML={{ __html: `
          [data-content-area] {
            cursor: text !important;
          }
          [data-content-area] a {
            cursor: pointer !important;
          }
          [data-content-area] h1,
          [data-content-area] h2,
          [data-content-area] h3,
          [data-content-area] h4,
          [data-content-area] h5,
          [data-content-area] h6,
          [data-content-area] p,
          [data-content-area] li,
          [data-content-area] td,
          [data-content-area] th,
          [data-content-area] span,
          [data-content-area] div:not([class*="cursor"]) {
            cursor: text !important;
          }
        `}} />
        <div
          ref={contentRef}
          data-content-area
          className="max-w-none select-text relative z-10"
          style={{ 
            userSelect: 'text', 
            WebkitUserSelect: 'text', 
            MozUserSelect: 'text',
            msUserSelect: 'text',
            pointerEvents: 'auto',
            cursor: 'text',
            position: 'relative',
            zIndex: 10
          }}
          onSelectStart={(e) => {
            // Explicitly allow text selection
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            // Don't interfere with text selection
            // Only stop propagation for non-link elements to allow selection
            const target = (e.target as HTMLElement).closest('a');
            if (!target) {
              // For non-links, allow text selection by stopping propagation
              e.stopPropagation();
            }
          }}
          onMouseMove={(e) => {
            // Ensure cursor is visible on mouse move
            const target = e.target as HTMLElement;
            const element = target.closest('a, h1, h2, h3, h4, h5, h6, p, li, td, th, code, pre');
            if (element) {
              if (element.tagName === 'A') {
                (element as HTMLElement).style.cursor = 'pointer';
              } else {
                (element as HTMLElement).style.cursor = 'text';
              }
            }
          }}
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
