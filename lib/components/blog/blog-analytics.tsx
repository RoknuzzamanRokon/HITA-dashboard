/**
 * Blog Analytics Component
 * Comprehensive analytics dashboard for blog performance
 */

"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Clock,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgReadTime: number;
    bounceRate: number;
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalComments: number;
  };
  trends: {
    viewsChange: number;
    visitorsChange: number;
    readTimeChange: number;
    bounceRateChange: number;
  };
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    readTime: number;
    publishDate: string;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
}

// Mock analytics data
const mockAnalytics: AnalyticsData = {
  overview: {
    totalViews: 15420,
    uniqueVisitors: 8750,
    avgReadTime: 4.2,
    bounceRate: 32.5,
    totalPosts: 24,
    publishedPosts: 18,
    draftPosts: 6,
    totalComments: 156,
  },
  trends: {
    viewsChange: 12.5,
    visitorsChange: 8.3,
    readTimeChange: -2.1,
    bounceRateChange: -5.2,
  },
  topPosts: [
    {
      id: "1",
      title: "Getting Started with Hotel API Integration",
      views: 2340,
      readTime: 8,
      publishDate: "2024-01-15",
    },
    {
      id: "2",
      title: "Best Practices for Hotel Data Caching",
      views: 1890,
      readTime: 6,
      publishDate: "2024-01-12",
    },
    {
      id: "3",
      title: "Advanced Security Implementation Guide",
      views: 1650,
      readTime: 12,
      publishDate: "2024-01-10",
    },
  ],
  trafficSources: [
    { source: "Organic Search", visitors: 4200, percentage: 48 },
    { source: "Direct", visitors: 2100, percentage: 24 },
    { source: "Social Media", visitors: 1400, percentage: 16 },
    { source: "Referral", visitors: 875, percentage: 10 },
    { source: "Email", visitors: 175, percentage: 2 },
  ],
};

interface BlogAnalyticsProps {
  data?: AnalyticsData;
  timeRange?: "7d" | "30d" | "90d" | "1y";
  onTimeRangeChange?: (range: string) => void;
}

export function BlogAnalytics({
  data = mockAnalytics,
  timeRange = "30d",
  onTimeRangeChange,
}: BlogAnalyticsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  };

  const TrendIcon = ({ value }: { value: number }) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.overview.totalViews)}
              </p>
              <div className="flex items-center mt-1">
                <TrendIcon value={data.trends.viewsChange} />
                <span
                  className={`text-sm ml-1 ${
                    data.trends.viewsChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercentage(data.trends.viewsChange)}
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Unique Visitors
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.overview.uniqueVisitors)}
              </p>
              <div className="flex items-center mt-1">
                <TrendIcon value={data.trends.visitorsChange} />
                <span
                  className={`text-sm ml-1 ${
                    data.trends.visitorsChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercentage(data.trends.visitorsChange)}
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg. Read Time
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.avgReadTime.toFixed(1)}m
              </p>
              <div className="flex items-center mt-1">
                <TrendIcon value={data.trends.readTimeChange} />
                <span
                  className={`text-sm ml-1 ${
                    data.trends.readTimeChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercentage(data.trends.readTimeChange)}
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comments</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalComments}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">
                  {data.overview.publishedPosts} published posts
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Posts */}
      <Card>
        <CardHeader
          title="Top Performing Posts"
          subtitle="Most viewed posts this period"
        />
        <CardContent>
          <div className="space-y-4">
            {data.topPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{post.title}</h4>
                    <p className="text-sm text-gray-500">
                      {post.readTime} min read •{" "}
                      {new Date(post.publishDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatNumber(post.views)}
                  </p>
                  <p className="text-sm text-gray-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader
          title="Traffic Sources"
          subtitle="Where your visitors come from"
        />
        <CardContent>
          <div className="space-y-4">
            {data.trafficSources.map((source) => (
              <div
                key={source.source}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    {source.source}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {source.percentage}%
                  </span>
                  <span className="text-sm text-gray-500 w-16 text-right">
                    {formatNumber(source.visitors)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Content Stats" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-medium">{data.overview.totalPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Published</span>
                <span className="font-medium text-green-600">
                  {data.overview.publishedPosts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Drafts</span>
                <span className="font-medium text-yellow-600">
                  {data.overview.draftPosts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bounce Rate</span>
                <span className="font-medium">{data.overview.bounceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Engagement Metrics" />
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {data.overview.avgReadTime.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  Average Read Time (minutes)
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(
                    data.overview.totalComments /
                      data.overview.publishedPosts || 0
                  ).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Comments per Post</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
