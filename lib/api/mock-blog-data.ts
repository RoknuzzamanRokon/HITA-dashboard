/**
 * Mock blog data for development
 * Shared between public blog page and dashboard blog management
 */

import { BlogPost, BlogCategory, BlogTag, BlogAnalytics } from './blog';

export const mockBlogCategories: BlogCategory[] = [
    {
        id: "1",
        name: "Tutorial",
        slug: "tutorial",
        description: "Step-by-step guides and tutorials",
        post_count: 5,
        created_at: "2024-01-01T00:00:00Z",
    },
    {
        id: "2",
        name: "Performance",
        slug: "performance",
        description: "Performance optimization tips and techniques",
        post_count: 3,
        created_at: "2024-01-02T00:00:00Z",
    },
    {
        id: "3",
        name: "Security",
        slug: "security",
        description: "Security best practices and implementation guides",
        post_count: 4,
        created_at: "2024-01-03T00:00:00Z",
    },
    {
        id: "4",
        name: "Development",
        slug: "development",
        description: "Development tips and advanced techniques",
        post_count: 6,
        created_at: "2024-01-04T00:00:00Z",
    },
];

export const mockBlogTags: BlogTag[] = [
    { id: "1", name: "API", slug: "api", post_count: 8, created_at: "2024-01-01T00:00:00Z" },
    { id: "2", name: "Integration", slug: "integration", post_count: 6, created_at: "2024-01-01T00:00:00Z" },
    { id: "3", name: "Getting Started", slug: "getting-started", post_count: 4, created_at: "2024-01-01T00:00:00Z" },
    { id: "4", name: "Caching", slug: "caching", post_count: 4, created_at: "2024-01-01T00:00:00Z" },
    { id: "5", name: "Performance", slug: "performance", post_count: 5, created_at: "2024-01-01T00:00:00Z" },
    { id: "6", name: "Optimization", slug: "optimization", post_count: 3, created_at: "2024-01-01T00:00:00Z" },
    { id: "7", name: "Security", slug: "security", post_count: 7, created_at: "2024-01-01T00:00:00Z" },
    { id: "8", name: "Authentication", slug: "authentication", post_count: 3, created_at: "2024-01-01T00:00:00Z" },
    { id: "9", name: "Best Practices", slug: "best-practices", post_count: 5, created_at: "2024-01-01T00:00:00Z" },
    { id: "10", name: "Search", slug: "search", post_count: 2, created_at: "2024-01-01T00:00:00Z" },
    { id: "11", name: "Filtering", slug: "filtering", post_count: 2, created_at: "2024-01-01T00:00:00Z" },
    { id: "12", name: "Advanced", slug: "advanced", post_count: 3, created_at: "2024-01-01T00:00:00Z" },
];

export const mockBlogPosts: BlogPost[] = [
    {
        id: "1",
        title: "Getting Started with Hotel API Integration",
        slug: "getting-started-hotel-api",
        content: `# Getting Started with Hotel API Integration

Welcome to our comprehensive guide on integrating the Hotel API into your application. This tutorial will walk you through the essential steps to get up and running quickly.

## Prerequisites

Before you begin, make sure you have:
- A valid API key
- Basic knowledge of REST APIs
- Your preferred programming language setup

## Step 1: Authentication

First, you'll need to authenticate your requests using your API key:

\`\`\`javascript
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};
\`\`\`

## Step 2: Making Your First Request

Let's start with a simple hotel search:

\`\`\`javascript
const response = await fetch('https://api.hotelapi.com/v1/hotels/search', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    destination: 'New York',
    checkin: '2024-03-01',
    checkout: '2024-03-03',
    adults: 2
  })
});
\`\`\`

## Next Steps

Once you've successfully made your first request, you can explore more advanced features like filtering, sorting, and detailed hotel information retrieval.`,
        excerpt: "Learn how to integrate our Hotel API into your application with this comprehensive step-by-step guide.",
        author: "Sarah Johnson",
        category: mockBlogCategories[0], // Tutorial
        tags: [mockBlogTags[0], mockBlogTags[1], mockBlogTags[2]], // API, Integration, Getting Started
        status: "published",
        view_count: 1250,
        read_time: 8,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        published_at: "2024-01-15T10:00:00Z",
        meta_title: "Getting Started with Hotel API Integration - Complete Guide",
        meta_description: "Learn how to integrate our Hotel API into your application with this comprehensive step-by-step guide. Perfect for developers getting started.",
    },
    {
        id: "2",
        title: "Best Practices for Hotel Data Caching",
        slug: "hotel-data-caching-practices",
        content: `# Best Practices for Hotel Data Caching

Caching is crucial for building performant hotel booking applications. This guide covers the essential strategies you need to know.

## Why Caching Matters

Hotel data can be expensive to fetch and process. Proper caching can:
- Reduce API costs
- Improve response times
- Enhance user experience
- Reduce server load

## Cache Strategy Types

### 1. Time-based Caching
Cache hotel availability for short periods (5-15 minutes) as prices change frequently.

### 2. Static Data Caching
Hotel information like amenities, photos, and descriptions can be cached for longer periods (24-48 hours).

### 3. User-specific Caching
Cache search results and user preferences to provide faster subsequent searches.

## Implementation Examples

\`\`\`javascript
// Redis caching example
const cacheKey = \`hotel_search_\${destination}_\${checkin}_\${checkout}\`;
const cachedResult = await redis.get(cacheKey);

if (cachedResult) {
  return JSON.parse(cachedResult);
}

const freshData = await fetchHotelData();
await redis.setex(cacheKey, 900, JSON.stringify(freshData)); // 15 minutes
return freshData;
\`\`\`

## Cache Invalidation

Remember to implement proper cache invalidation strategies to ensure data freshness.`,
        excerpt: "Optimize your application performance with smart caching strategies for hotel data.",
        author: "Mike Chen",
        category: mockBlogCategories[1], // Performance
        tags: [mockBlogTags[3], mockBlogTags[4], mockBlogTags[5]], // Caching, Performance, Optimization
        status: "published",
        view_count: 890,
        read_time: 6,
        created_at: "2024-01-12T14:30:00Z",
        updated_at: "2024-01-12T14:30:00Z",
        published_at: "2024-01-12T14:30:00Z",
        meta_title: "Hotel Data Caching Best Practices - Performance Guide",
        meta_description: "Learn smart caching strategies for hotel data to optimize your application performance and reduce API costs.",
    },
    {
        id: "3",
        title: "Securing Your Hotel API Implementation",
        slug: "securing-hotel-api-implementation",
        content: `# Securing Your Hotel API Implementation

Security is paramount when handling hotel booking data. This guide covers essential security practices for your implementation.

## API Key Security

### Never Expose API Keys
- Store API keys in environment variables
- Use server-side proxy for client applications
- Implement key rotation policies

### Rate Limiting
Implement proper rate limiting to prevent abuse:

\`\`\`javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
\`\`\`

## Data Validation

Always validate and sanitize input data:

\`\`\`javascript
const { body, validationResult } = require('express-validator');

const validateSearchRequest = [
  body('destination').isLength({ min: 2 }).trim().escape(),
  body('checkin').isISO8601().toDate(),
  body('checkout').isISO8601().toDate(),
  body('adults').isInt({ min: 1, max: 10 })
];
\`\`\`

## HTTPS and Encryption

- Always use HTTPS for API communications
- Encrypt sensitive data at rest
- Implement proper session management

## Monitoring and Logging

Set up comprehensive logging and monitoring to detect suspicious activities.`,
        excerpt: "Essential security practices to protect your hotel booking platform and user data.",
        author: "Emma Davis",
        category: mockBlogCategories[2], // Security
        tags: [mockBlogTags[6], mockBlogTags[7], mockBlogTags[8]], // Security, Authentication, Best Practices
        status: "published",
        view_count: 1120,
        read_time: 10,
        created_at: "2024-01-10T09:15:00Z",
        updated_at: "2024-01-10T09:15:00Z",
        published_at: "2024-01-10T09:15:00Z",
        meta_title: "Securing Your Hotel API Implementation - Security Guide",
        meta_description: "Learn essential security practices to protect your hotel booking platform and user data from threats.",
    },
    {
        id: "4",
        title: "Advanced Search and Filtering Techniques",
        slug: "advanced-search-filtering-techniques",
        content: `# Advanced Search and Filtering Techniques

Take your hotel search functionality to the next level with these advanced techniques and optimizations.

## Complex Query Building

### Multi-criteria Filtering
Build sophisticated search queries that combine multiple criteria:

\`\`\`javascript
const searchParams = {
  destination: 'Paris',
  checkin: '2024-03-15',
  checkout: '2024-03-18',
  adults: 2,
  children: 1,
  filters: {
    priceRange: { min: 100, max: 300 },
    starRating: [4, 5],
    amenities: ['wifi', 'pool', 'gym'],
    propertyTypes: ['hotel', 'resort'],
    guestRating: { min: 8.0 }
  }
};
\`\`\`

### Geographic Search
Implement location-based search with radius and coordinates:

\`\`\`javascript
const geoSearch = {
  coordinates: { lat: 48.8566, lng: 2.3522 },
  radius: 5, // kilometers
  destination: 'Paris City Center'
};
\`\`\`

## Search Optimization

### Faceted Search
Implement faceted search to help users refine results:

\`\`\`javascript
const facets = {
  priceRanges: [
    { range: '0-100', count: 45 },
    { range: '100-200', count: 123 },
    { range: '200-300', count: 67 }
  ],
  starRatings: [
    { rating: 5, count: 23 },
    { rating: 4, count: 89 },
    { rating: 3, count: 156 }
  ]
};
\`\`\`

### Auto-complete and Suggestions
Enhance user experience with smart suggestions:

\`\`\`javascript
const suggestions = await getDestinationSuggestions('par');
// Returns: ['Paris, France', 'Parma, Italy', 'Paradise, Nevada']
\`\`\`

## Performance Considerations

- Use pagination for large result sets
- Implement search result caching
- Consider using search engines like Elasticsearch for complex queries
- Optimize database indexes for common search patterns`,
        excerpt: "Master complex hotel search queries and filtering options to provide better user experiences.",
        author: "David Wilson",
        category: mockBlogCategories[3], // Development
        tags: [mockBlogTags[9], mockBlogTags[10], mockBlogTags[11]], // Search, Filtering, Advanced
        status: "published",
        view_count: 756,
        read_time: 12,
        created_at: "2024-01-08T16:45:00Z",
        updated_at: "2024-01-08T16:45:00Z",
        published_at: "2024-01-08T16:45:00Z",
        meta_title: "Advanced Hotel Search and Filtering Techniques",
        meta_description: "Master complex hotel search queries and filtering options to provide better user experiences with advanced techniques.",
    },
];

export const mockBlogAnalytics: BlogAnalytics = {
    total_posts: mockBlogPosts.length,
    total_views: mockBlogPosts.reduce((sum, post) => sum + post.view_count, 0),
    total_subscribers: 1250,
    popular_posts: mockBlogPosts.slice(0, 3),
    popular_categories: mockBlogCategories.slice(0, 3),
    recent_activity: [
        {
            id: "1",
            type: "post_published",
            title: "New post published: Getting Started with Hotel API Integration",
            timestamp: "2024-01-15T10:00:00Z",
        },
        {
            id: "2",
            type: "high_traffic",
            title: "Best Practices for Hotel Data Caching received 100+ views",
            timestamp: "2024-01-14T15:30:00Z",
        },
    ],
};