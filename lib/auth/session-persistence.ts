/**
 * Session persistence utilities to maintain authentication across page refreshes
 */

import { TokenStorage } from './token-storage';

export interface SessionData {
    isAuthenticated: boolean;
    lastActivity: number;
    userId?: string;
    username?: string;
}

export class SessionPersistence {
    private static readonly SESSION_KEY = 'auth-session';
    private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
    private static isClient = typeof window !== 'undefined';

    /**
     * Save session data
     */
    static saveSession(data: Partial<SessionData>): void {
        if (!this.isClient) return;

        try {
            const currentSession = this.getSession();
            const sessionData: SessionData = {
                ...currentSession,
                ...data,
                lastActivity: Date.now(),
            };

            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }

    /**
     * Get session data
     */
    static getSession(): SessionData {
        if (!this.isClient) {
            return { isAuthenticated: false, lastActivity: 0 };
        }

        try {
            const sessionStr = localStorage.getItem(this.SESSION_KEY);
            if (!sessionStr) {
                return { isAuthenticated: false, lastActivity: 0 };
            }

            const session: SessionData = JSON.parse(sessionStr);

            // Check if session has expired
            if (Date.now() - session.lastActivity > this.SESSION_TIMEOUT) {
                this.clearSession();
                return { isAuthenticated: false, lastActivity: 0 };
            }

            return session;
        } catch (error) {
            console.error('Failed to get session:', error);
            return { isAuthenticated: false, lastActivity: 0 };
        }
    }

    /**
     * Check if session is valid
     */
    static isSessionValid(): boolean {
        const session = this.getSession();
        const hasToken = TokenStorage.hasToken();

        // If no session exists but we have a token, consider it valid (fresh login)
        if (!session.isAuthenticated && hasToken) {
            return true;
        }

        return session.isAuthenticated && hasToken &&
            (Date.now() - session.lastActivity) < this.SESSION_TIMEOUT;
    }

    /**
     * Update last activity timestamp
     */
    static updateActivity(): void {
        if (!this.isClient) return;

        const session = this.getSession();
        if (session.isAuthenticated) {
            this.saveSession({ lastActivity: Date.now() });
        }
    }

    /**
     * Clear session data
     */
    static clearSession(): void {
        if (!this.isClient) return;

        try {
            localStorage.removeItem(this.SESSION_KEY);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }

    /**
     * Initialize session tracking
     */
    static initializeTracking(): void {
        if (!this.isClient) return;

        // Update activity on user interactions
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        const updateActivity = () => {
            this.updateActivity();
        };

        events.forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });

        // Update activity every 5 minutes
        setInterval(() => {
            if (this.isSessionValid()) {
                this.updateActivity();
            }
        }, 5 * 60 * 1000);
    }
}