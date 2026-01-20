/**
 * Smart Real-time Hook
 * Optimizes real-time updates based on user role and page visibility
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';

interface SmartRealtimeConfig {
    adminInterval?: number;
    userInterval?: number;
    enableForUsers?: boolean;
    pauseWhenHidden?: boolean;
}

export function useSmartRealtime(config: SmartRealtimeConfig = {}) {
    const {
        adminInterval = 60000, // 1 minute for admins
        userInterval = 300000,  // 5 minutes for regular users
        enableForUsers = false, // Disable for regular users by default
        pauseWhenHidden = true, // Pause when tab is hidden
    } = config;

    const { user } = useAuth();
    const [isEnabled, setIsEnabled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Determine if user should have real-time updates
    const shouldEnableRealtime = useCallback(() => {
        if (!user) return false;

        const isAdmin = user.role === 'super_user' || user.role === 'admin_user';
        return isAdmin || enableForUsers;
    }, [user, enableForUsers]);

    // Get appropriate interval based on user role
    const getInterval = useCallback(() => {
        if (!user) return 0;

        const isAdmin = user.role === 'super_user' || user.role === 'admin_user';
        return isAdmin ? adminInterval : userInterval;
    }, [user, adminInterval, userInterval]);

    // Handle page visibility changes
    useEffect(() => {
        if (!pauseWhenHidden) return;

        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [pauseWhenHidden]);

    // Load saved preference and apply smart defaults
    useEffect(() => {
        const savedPreference = localStorage.getItem('dashboard-realtime-enabled');
        const canEnableRealtime = shouldEnableRealtime();

        if (savedPreference !== null) {
            // Respect user's saved preference, but only if they're allowed to use real-time
            setIsEnabled(savedPreference === 'true' && canEnableRealtime);
        } else {
            // Default: enable for admins, disable for regular users
            setIsEnabled(canEnableRealtime && user?.role === 'super_user');
        }
    }, [user, shouldEnableRealtime]);

    // Save preference when changed
    const toggleRealtime = useCallback(() => {
        if (!shouldEnableRealtime()) return;

        const newValue = !isEnabled;
        setIsEnabled(newValue);
        localStorage.setItem('dashboard-realtime-enabled', newValue.toString());
    }, [isEnabled, shouldEnableRealtime]);

    // Calculate effective interval
    const effectiveInterval = isEnabled && isVisible ? getInterval() : 0;

    return {
        isEnabled,
        canToggle: shouldEnableRealtime(),
        toggleRealtime,
        interval: effectiveInterval,
        isVisible,
        userRole: user?.role,
    };
}