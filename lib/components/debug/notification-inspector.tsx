"use client";

import React from "react";
import { BackendNotification } from "@/lib/api/notifications";

interface NotificationInspectorProps {
  notification: BackendNotification;
  onClose: () => void;
}

export function NotificationInspector({
  notification,
  onClose,
}: NotificationInspectorProps) {
  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const analyzeTimestamps = () => {
    const now = new Date();
    const createdAt = new Date(notification.created_at);
    const sentAt = notification.meta_data?.sent_at
      ? new Date(notification.meta_data.sent_at)
      : null;
    const changeTime = notification.meta_data?.change_time
      ? new Date(notification.meta_data.change_time)
      : null;

    return {
      now: now.toISOString(),
      created_at: {
        raw: notification.created_at,
        parsed: createdAt.toISOString(),
        minutesAgo: Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60),
        ),
      },
      sent_at: sentAt
        ? {
            raw: notification.meta_data.sent_at,
            parsed: sentAt.toISOString(),
            minutesAgo: Math.floor(
              (now.getTime() - sentAt.getTime()) / (1000 * 60),
            ),
          }
        : null,
      change_time: changeTime
        ? {
            raw: notification.meta_data.change_time,
            parsed: changeTime.toISOString(),
            minutesAgo: Math.floor(
              (now.getTime() - changeTime.getTime()) / (1000 * 60),
            ),
          }
        : null,
    };
  };

  const timestamps = analyzeTimestamps();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Notification Inspector</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <div>
                <strong>ID:</strong> {notification.id}
              </div>
              <div>
                <strong>Title:</strong> {notification.title}
              </div>
              <div>
                <strong>Status:</strong> {notification.status}
              </div>
              <div>
                <strong>Type:</strong> {notification.type}
              </div>
              <div>
                <strong>Priority:</strong> {notification.priority}
              </div>
            </div>
          </div>

          {/* Timestamp Analysis */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Timestamp Analysis</h3>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <div>
                <strong>Current Time:</strong> {timestamps.now}
              </div>
              <div className="mt-2">
                <strong>created_at:</strong>
                <div className="ml-4">
                  <div>Raw: {timestamps.created_at.raw}</div>
                  <div>Parsed: {timestamps.created_at.parsed}</div>
                  <div>Minutes ago: {timestamps.created_at.minutesAgo}</div>
                </div>
              </div>
              {timestamps.sent_at && (
                <div className="mt-2">
                  <strong>sent_at:</strong>
                  <div className="ml-4">
                    <div>Raw: {timestamps.sent_at.raw}</div>
                    <div>Parsed: {timestamps.sent_at.parsed}</div>
                    <div>Minutes ago: {timestamps.sent_at.minutesAgo}</div>
                  </div>
                </div>
              )}
              {timestamps.change_time && (
                <div className="mt-2">
                  <strong>change_time:</strong>
                  <div className="ml-4">
                    <div>Raw: {timestamps.change_time.raw}</div>
                    <div>Parsed: {timestamps.change_time.parsed}</div>
                    <div>Minutes ago: {timestamps.change_time.minutesAgo}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meta Data */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Meta Data</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {formatJson(notification.meta_data)}
            </pre>
          </div>

          {/* Full Notification Object */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Full Notification Object
            </h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
              {formatJson(notification)}
            </pre>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
            <div className="bg-yellow-50 p-3 rounded text-sm">
              {!notification.meta_data?.sent_at && (
                <div className="text-orange-600">
                  ⚠️ No sent_at timestamp found in meta_data. Using created_at
                  instead.
                </div>
              )}
              {timestamps.sent_at &&
                Math.abs(
                  timestamps.created_at.minutesAgo -
                    timestamps.sent_at.minutesAgo,
                ) > 5 && (
                  <div className="text-red-600">
                    🚨 Large discrepancy between created_at and sent_at
                    timestamps!
                  </div>
                )}
              <div className="mt-2">
                <strong>Expected display:</strong>
                {timestamps.sent_at ? (
                  <span>
                    {" "}
                    {timestamps.sent_at.minutesAgo < 1
                      ? "Just now"
                      : timestamps.sent_at.minutesAgo < 60
                        ? `${timestamps.sent_at.minutesAgo}m ago`
                        : `${Math.floor(timestamps.sent_at.minutesAgo / 60)}h ago`}
                  </span>
                ) : (
                  <span>
                    {" "}
                    {timestamps.created_at.minutesAgo < 1
                      ? "Just now"
                      : timestamps.created_at.minutesAgo < 60
                        ? `${timestamps.created_at.minutesAgo}m ago`
                        : `${Math.floor(timestamps.created_at.minutesAgo / 60)}h ago`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
