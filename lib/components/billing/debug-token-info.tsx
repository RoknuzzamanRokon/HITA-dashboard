"use client";

import React, { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { TokenStorage } from "@/lib/auth/token-storage";

export function DebugTokenInfo() {
  const [tokenInfo, setTokenInfo] = useState<{
    hasToken: boolean;
    tokenPreview: string;
  } | null>(null);

  useEffect(() => {
    const token = TokenStorage.getToken();
    setTokenInfo({
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "No token",
    });
  }, []);

  if (!tokenInfo) return null;

  return (
    <div className="mb-4 p-4 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-md">
      <div className="flex items-center space-x-2">
        {tokenInfo.hasToken ? (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        )}
        <Shield className="w-5 h-5 text-[rgb(var(--text-tertiary))]" />
        <div>
          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
            Authentication Status:{" "}
            {tokenInfo.hasToken ? "✓ Token Found" : "✗ No Token"}
          </p>
          <p className="text-xs text-[rgb(var(--text-secondary))] font-mono">
            {tokenInfo.tokenPreview}
          </p>
        </div>
      </div>
    </div>
  );
}
