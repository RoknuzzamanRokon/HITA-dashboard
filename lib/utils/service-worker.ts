/**
 * Service Worker Registration and Management
 * Handles registration, updates, and cache management
 */

"use client";

// Service worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('🚫 Service Worker not supported');
        return null;
    }

    try {
        console.log('🔧 Registering Service Worker...');

        const registration = await navigator.serviceWorker.register('/sw-cache.js', {
            scope: '/',
        });

        console.log('✅ Service Worker registered successfully:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
                console.log('🔄 Service Worker update found');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🆕 New Service Worker available');
                        // Optionally notify user about update
                        notifyUserAboutUpdate();
                    }
                });
            }
        });

        return registration;
    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        return null;
    }
}

// Unregister service worker
export async function unregisterServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            const result = await registration.unregister();
            console.log('🗑️ Service Worker unregistered:', result);
            return result;
        }
        return false;
    } catch (error) {
        console.error('❌ Service Worker unregistration failed:', error);
        return false;
    }
}

// Clear all caches
export async function clearAllCaches(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        // Clear service worker caches
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.active) {
                registration.active.postMessage({ type: 'CLEAR_CACHE' });
                console.log('🗑️ Requested Service Worker to clear caches');
            }
        }

        // Clear browser caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('🗑️ Cleared browser caches:', cacheNames);
        }
    } catch (error) {
        console.error('❌ Failed to clear caches:', error);
    }
}

// Clear user-specific caches
export async function clearUserCaches(userId: string): Promise<void> {
    if (typeof window === 'undefined' || !userId) return;

    try {
        // Clear service worker user caches
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.active) {
                registration.active.postMessage({
                    type: 'CLEAR_USER_CACHE',
                    payload: { userId }
                });
                console.log('🗑️ Requested Service Worker to clear user caches for:', userId);
            }
        }

        // Clear localStorage user caches
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`cache_${userId}_`)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        if (keysToRemove.length > 0) {
            console.log('🗑️ Cleared localStorage user caches:', keysToRemove.length);
        }
    } catch (error) {
        console.error('❌ Failed to clear user caches:', error);
    }
}

// Get cache status
export async function getCacheStatus(): Promise<any> {
    if (typeof window === 'undefined') return null;

    try {
        return new Promise((resolve) => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (registration && registration.active) {
                        const messageChannel = new MessageChannel();

                        messageChannel.port1.onmessage = (event) => {
                            if (event.data.type === 'CACHE_STATUS') {
                                resolve(event.data.payload);
                            }
                        };

                        registration.active.postMessage(
                            { type: 'GET_CACHE_STATUS' },
                            [messageChannel.port2]
                        );
                    } else {
                        resolve(null);
                    }
                });
            } else {
                resolve(null);
            }
        });
    } catch (error) {
        console.error('❌ Failed to get cache status:', error);
        return null;
    }
}

// Notify user about service worker update
function notifyUserAboutUpdate(): void {
    // You can customize this notification
    if (confirm('A new version is available. Reload to update?')) {
        window.location.reload();
    }
}

// Check if service worker is supported and active
export function isServiceWorkerSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

// Check if service worker is active
export async function isServiceWorkerActive(): Promise<boolean> {
    if (!isServiceWorkerSupported()) return false;

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!(registration && registration.active);
    } catch (error) {
        return false;
    }
}

// Prefetch critical pages
export async function prefetchCriticalPages(pages: string[]): Promise<void> {
    if (!isServiceWorkerSupported()) return;

    try {
        const cache = await caches.open('dashboard-cache-v1');

        const prefetchPromises = pages.map(async (page) => {
            try {
                const response = await fetch(page);
                if (response.ok) {
                    await cache.put(page, response);
                    console.log('📄 Prefetched page:', page);
                }
            } catch (error) {
                console.warn('⚠️ Failed to prefetch page:', page, error);
            }
        });

        await Promise.all(prefetchPromises);
        console.log('✅ Critical pages prefetched');
    } catch (error) {
        console.error('❌ Failed to prefetch critical pages:', error);
    }
}

// Initialize service worker with cache warming
export async function initializeServiceWorkerWithCaching(): Promise<void> {
    const registration = await registerServiceWorker();

    if (registration) {
        // Prefetch critical pages after registration
        setTimeout(() => {
            prefetchCriticalPages([
                '/dashboard',
                '/dashboard/users',
            ]);
        }, 2000); // Wait 2 seconds to avoid blocking initial load
    }
}