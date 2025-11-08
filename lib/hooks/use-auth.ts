/**
 * Authentication hooks for various use cases
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import type { UserRole } from '@/lib/types/auth';

/**
 * Hook for protected routes - redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Mark initial load as complete after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoadComplete(true);
        }, 1000); // Give 1 second for auth to initialize

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        console.log("🔒 useRequireAuth - Auth state:", {
            isAuthenticated,
            isLoading,
            hasUser: !!user,
            initialLoadComplete,
            hasRedirected
        });

        // Check if we have any tokens in storage
        const hasToken = localStorage.getItem('admin_auth_token') || sessionStorage.getItem('admin_auth_token');

        // Only redirect if:
        // 1. Not loading
        // 2. Not authenticated 
        // 3. Haven't redirected yet
        // 4. Initial load is complete (to prevent premature redirects)
        // 5. No token in storage (definitely not authenticated)
        if (!isLoading &&
            !isAuthenticated &&
            !hasRedirected &&
            initialLoadComplete &&
            !hasToken) {

            console.log("🚪 No token found, redirecting to login");
            setHasRedirected(true);

            const currentPath = window.location.pathname;
            const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
            router.push(loginUrl);
        } else if (!isLoading && !isAuthenticated && hasToken) {
            console.log("⚠️ Token exists but not authenticated, waiting for auth to resolve...");
        }
    }, [isAuthenticated, isLoading, user, router, redirectTo, hasRedirected, initialLoadComplete]);

    return { isAuthenticated, isLoading };
}

/**
 * Hook for role-based access control
 */
export function useRequireRole(
    requiredRoles: UserRole | UserRole[],
    redirectTo: string = '/unauthorized'
) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!user) {
            setHasAccess(false);
            return;
        }

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        const userHasRole = roles.includes(user.role);

        if (!userHasRole) {
            router.push(redirectTo);
            setHasAccess(false);
        } else {
            setHasAccess(true);
        }
    }, [user, isAuthenticated, isLoading, requiredRoles, router, redirectTo]);

    return { hasAccess, isLoading, user };
}

/**
 * Hook to check if user has specific role(s)
 */
export function useHasRole(roles: UserRole | UserRole[]): boolean {
    const { user } = useAuth();

    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
}

/**
 * Hook for login form state management
 */
export function useLoginForm() {
    const { login, isLoading, error } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState<{
        username?: string;
        password?: string;
        general?: string;
    }>({});

    /**
     * Handle form input changes
     */
    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    /**
     * Validate form data
     */
    const validateForm = (): boolean => {
        const errors: typeof formErrors = {};

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        }

        if (!formData.password.trim()) {
            errors.password = 'Password is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
        e.preventDefault();

        if (!validateForm()) {
            return false;
        }

        const result = await login(formData);

        if (!result.success && result.error) {
            setFormErrors({ general: result.error });
            return false;
        }

        return result.success;
    };

    /**
     * Reset form
     */
    const resetForm = () => {
        setFormData({ username: '', password: '' });
        setFormErrors({});
    };

    return {
        formData,
        formErrors,
        isLoading,
        error,
        handleChange,
        handleSubmit,
        resetForm,
    };
}

/**
 * Hook for logout functionality
 */
export function useLogout() {
    const { logout, isLoading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return { handleLogout, isLoading };
}