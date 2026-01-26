/**
 * Frontend Cache Management Utility
 * Provides functions to clear various types of frontend cache
 */

export class CacheManager {
    /**
     * Clear all localStorage data except authentication tokens
     */
    static clearLocalStorage(): void {
        try {
            // Get all keys first
            const keys = Object.keys(localStorage);

            // Filter out authentication-related keys
            const authKeys = keys.filter(key =>
                key.includes('token') ||
                key.includes('auth') ||
                key.includes('user') ||
                key.includes('session') ||
                key.includes('login')
            );

            // Clear all keys except auth keys
            keys.forEach(key => {
                if (!authKeys.includes(key)) {
                    localStorage.removeItem(key);
                }
            });

            console.log('✅ LocalStorage cleared (auth tokens preserved)');
        } catch (error) {
            console.error('❌ Failed to clear localStorage:', error);
        }
    }

    /**
     * Clear all sessionStorage data except authentication tokens
     */
    static clearSessionStorage(): void {
        try {
            // Get all keys first
            const keys = Object.keys(sessionStorage);

            // Filter out authentication-related keys
            const authKeys = keys.filter(key =>
                key.includes('token') ||
                key.includes('auth') ||
                key.includes('user') ||
                key.includes('session') ||
                key.includes('login')
            );

            // Clear all keys except auth keys
            keys.forEach(key => {
                if (!authKeys.includes(key)) {
                    sessionStorage.removeItem(key);
                }
            });

            console.log('✅ SessionStorage cleared (auth tokens preserved)');
        } catch (error) {
            console.error('❌ Failed to clear sessionStorage:', error);
        }
    }

    /**
     * Clear browser cache (service worker cache)
     */
    static async clearServiceWorkerCache(): Promise<void> {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('✅ Service Worker cache cleared');
            }
        } catch (error) {
            console.error('❌ Failed to clear service worker cache:', error);
        }
    }

    /**
     * Clear IndexedDB data
     */
    static async clearIndexedDB(): Promise<void> {
        try {
            if ('indexedDB' in window) {
                // Get all databases (this is a newer API, may not be available in all browsers)
                if ('databases' in indexedDB) {
                    const databases = await indexedDB.databases();
                    await Promise.all(
                        databases.map(db => {
                            if (db.name) {
                                return new Promise<void>((resolve, reject) => {
                                    const deleteReq = indexedDB.deleteDatabase(db.name!);
                                    deleteReq.onsuccess = () => resolve();
                                    deleteReq.onerror = () => reject(deleteReq.error);
                                });
                            }
                        })
                    );
                }
                console.log('✅ IndexedDB cleared');
            }
        } catch (error) {
            console.error('❌ Failed to clear IndexedDB:', error);
        }
    }

    /**
     * Clear cookies for the current domain except authentication cookies
     */
    static clearCookies(): void {
        try {
            document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                const cookieName = name.trim().toLowerCase();

                // Skip authentication-related cookies
                if (cookieName.includes('token') ||
                    cookieName.includes('auth') ||
                    cookieName.includes('user') ||
                    cookieName.includes('session') ||
                    cookieName.includes('login')) {
                    return; // Skip this cookie
                }

                // Clear non-auth cookies
                document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
            });
            console.log('✅ Cookies cleared (auth cookies preserved)');
        } catch (error) {
            console.error('❌ Failed to clear cookies:', error);
        }
    }

    /**
     * Clear React Query cache (if using React Query)
     */
    static clearReactQueryCache(): void {
        try {
            // This will be handled by the component that uses this utility
            // by calling queryClient.clear() or queryClient.invalidateQueries()
            console.log('✅ React Query cache clear requested');
        } catch (error) {
            console.error('❌ Failed to clear React Query cache:', error);
        }
    }

    /**
     * Clear Next.js router cache
     */
    static clearNextJsCache(): void {
        try {
            // Clear Next.js prefetch cache
            if (typeof window !== 'undefined' && window.history) {
                // Clear browser history state
                window.history.replaceState({}, '', window.location.pathname);
            }
            console.log('✅ Next.js cache clear requested');
        } catch (error) {
            console.error('❌ Failed to clear Next.js cache:', error);
        }
    }

    /**
     * Clear all frontend caches except authentication data
     */
    static async clearAllCache(): Promise<void> {
        console.log('🧹 Starting cache clear (preserving auth)...');

        const startTime = performance.now();

        try {
            // Clear all storage types (except auth data)
            this.clearLocalStorage();
            this.clearSessionStorage();
            this.clearCookies();

            // Clear async caches
            await Promise.all([
                this.clearServiceWorkerCache(),
                this.clearIndexedDB(),
            ]);

            // Clear framework-specific caches
            this.clearReactQueryCache();
            this.clearNextJsCache();

            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);

            console.log(`✅ Cache cleared successfully in ${duration}ms (auth preserved)`);

            // Show success notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Cache Cleared', {
                    body: 'Frontend cache cleared (login preserved)',
                    icon: '/favicon.ico'
                });
            }

        } catch (error) {
            console.error('❌ Error during cache clearing:', error);
            throw error;
        }
    }

    /**
     * Get cache size information
     */
    static async getCacheInfo(): Promise<{
        localStorage: number;
        sessionStorage: number;
        cookies: number;
        serviceWorker: number;
    }> {
        const info = {
            localStorage: 0,
            sessionStorage: 0,
            cookies: 0,
            serviceWorker: 0,
        };

        try {
            // Calculate localStorage size
            let localStorageSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    localStorageSize += localStorage[key].length + key.length;
                }
            }
            info.localStorage = localStorageSize;

            // Calculate sessionStorage size
            let sessionStorageSize = 0;
            for (let key in sessionStorage) {
                if (sessionStorage.hasOwnProperty(key)) {
                    sessionStorageSize += sessionStorage[key].length + key.length;
                }
            }
            info.sessionStorage = sessionStorageSize;

            // Calculate cookies size
            info.cookies = document.cookie.length;

            // Calculate service worker cache size (approximate)
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                let totalSize = 0;
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    totalSize += requests.length * 1000; // Rough estimate
                }
                info.serviceWorker = totalSize;
            }

        } catch (error) {
            console.error('❌ Failed to get cache info:', error);
        }

        return info;
    }

    /**
     * Format bytes to human readable format
     */
    static formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}