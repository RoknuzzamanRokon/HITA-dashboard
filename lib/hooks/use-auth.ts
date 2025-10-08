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

    useEffect(() => {
        console.log("🔒 useRequireAuth - Auth state:", { isAuthenticated, isLoading, hasUser: !!user });

        if (!isLoading && !isAuthenticated) {
            console.log("🚪 Redirecting to login - not authenticated");
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, user, router, redirectTo]);

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