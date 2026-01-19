/**
 * Authentication Context for global authentication state management
 */

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { AuthService } from "@/lib/api/auth";
import { SessionPersistence } from "@/lib/auth/session-persistence";
import type { User, AuthState, LoginCredentials } from "@/lib/types/auth";

// Auth actions
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_TOKEN"; payload: string | null }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_ERROR"; payload: string | null };

// Auth context type
interface AuthContextType extends AuthState {
  login: (
    credentials: LoginCredentials,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case "SET_TOKEN":
      return {
        ...state,
        token: action.payload,
        isAuthenticated: !!action.payload,
      };
    case "LOGIN_SUCCESS":
      console.log("🔄 AUTH REDUCER: LOGIN_SUCCESS", action.payload);
      const newState = {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
      console.log("🔄 AUTH REDUCER: New state", newState);
      return newState;
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Cache for refreshUser to prevent duplicate calls
  const refreshUserCache = useRef({ lastRefreshTime: 0 });

  // Cache initialization flag
  const cacheInitialized = useRef(false);

  // Initialize authentication state on mount
  useEffect(() => {
    // Initialize session tracking
    SessionPersistence.initializeTracking();
    initializeAuth();
  }, []);

  // Add visibility change listener to re-authenticate when tab becomes visible
  useEffect(() => {
    let lastRefreshTime = 0;
    const REFRESH_COOLDOWN = 30000; // 30 seconds cooldown

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && state.isAuthenticated) {
        const now = Date.now();

        // Only refresh if enough time has passed since last refresh
        if (now - lastRefreshTime > REFRESH_COOLDOWN) {
          console.log(
            "🔄 Tab became visible, refreshing user data (throttled)",
          );
          SessionPersistence.updateActivity();
          refreshUser();
          lastRefreshTime = now;
        } else {
          console.log(
            "🚫 Skipping user refresh - too recent (within 30s cooldown)",
          );
          // Just update activity without API call
          SessionPersistence.updateActivity();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isAuthenticated]);

  /**
   * Initialize authentication state
   */
  const initializeAuth = async () => {
    try {
      console.log("🔄 Initializing auth state...");
      dispatch({ type: "SET_LOADING", payload: true });

      // Quick check if user is authenticated
      const hasToken = AuthService.isAuthenticated();

      if (!hasToken) {
        console.log("❌ No valid token found, user not authenticated");
        dispatch({ type: "LOGOUT" });
        SessionPersistence.clearSession();
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      console.log("✅ Token found, setting up user session...");
      const token = AuthService.getToken();
      dispatch({ type: "SET_TOKEN", payload: token });

      // Try to fetch current user, but don't fail if it doesn't work
      try {
        const userResponse = await AuthService.getCurrentUser();

        if (userResponse.success && userResponse.data) {
          console.log(
            "✅ User profile loaded successfully:",
            userResponse.data,
          );
          dispatch({ type: "SET_USER", payload: userResponse.data });

          // Update session with user data
          SessionPersistence.saveSession({
            isAuthenticated: true,
            userId: userResponse.data.id,
            username: userResponse.data.username,
          });
        } else {
          console.warn("⚠️ User profile fetch failed, using fallback user");
          // Create a fallback user to keep session active
          const session = SessionPersistence.getSession();
          const fallbackUser = AuthService.createFallbackUser(
            session.username || "user",
            token || "",
          );
          dispatch({ type: "SET_USER", payload: fallbackUser });

          // Still save session data
          SessionPersistence.saveSession({
            isAuthenticated: true,
            userId: fallbackUser.id,
            username: fallbackUser.username,
          });
        }
      } catch (userError) {
        console.warn("⚠️ User fetch error, using fallback:", userError);
        // Always create a fallback user if we have a token
        const session = SessionPersistence.getSession();
        const fallbackUser = AuthService.createFallbackUser(
          session.username || "user",
          token || "",
        );
        dispatch({ type: "SET_USER", payload: fallbackUser });

        SessionPersistence.saveSession({
          isAuthenticated: true,
          userId: fallbackUser.id,
          username: fallbackUser.username,
        });
      }
    } catch (error) {
      console.error("❌ Auth initialization failed:", error);

      // Always try to maintain session if we have a token
      const token = AuthService.getToken();
      if (token) {
        console.log(
          "⚠️ Keeping user session active despite initialization error",
        );
        const session = SessionPersistence.getSession();
        const fallbackUser = AuthService.createFallbackUser(
          session.username || "user",
          token,
        );
        dispatch({ type: "SET_USER", payload: fallbackUser });

        SessionPersistence.saveSession({
          isAuthenticated: true,
          userId: fallbackUser.id,
          username: fallbackUser.username,
        });
      } else {
        console.log("❌ No token available, logging out");
        dispatch({ type: "LOGOUT" });
        SessionPersistence.clearSession();
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
      console.log("🔄 Auth initialization completed");
    }
  };

  /**
   * Login user
   * @param credentials - Login credentials (username and password)
   * @param rememberMe - If true, tokens are stored in localStorage (persistent). If false, stored in sessionStorage (session-only)
   */
  const login = async (
    credentials: LoginCredentials,
    rememberMe: boolean = true,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      setError(null);

      console.log("🔐 Starting login process...", { rememberMe });
      const response = await AuthService.login(credentials, rememberMe);
      console.log("🔐 Login response:", response);

      if (response.success && response.data) {
        console.log("✅ Login successful, fetching user profile...");
        // Try to fetch user profile after successful login
        const userResponse = await AuthService.getCurrentUser();
        console.log("👤 User profile response:", userResponse);

        let user;
        if (userResponse.success && userResponse.data) {
          console.log("✅ User profile fetched successfully");
          user = userResponse.data;
        } else {
          // If user profile fetch fails, create a basic user object from the token
          console.warn(
            "⚠️ Failed to fetch user profile, using fallback user data:",
            userResponse.error,
          );
          console.log("🔄 Creating fallback user to ensure login succeeds...");
          user = AuthService.createFallbackUser(
            credentials.username,
            response.data.access_token,
          );
          console.log("✅ Fallback user created:", user);
        }
        console.log("👤 Final user object:", user);

        console.log("🚀 Dispatching LOGIN_SUCCESS...");
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: user,
            token: response.data.access_token,
          },
        });

        // Save session data
        SessionPersistence.saveSession({
          isAuthenticated: true,
          userId: user.id,
          username: user.username,
        });

        // Initialize cache system for the user
        console.log("🚀 Initializing cache system after login...");
        try {
          // Set current user ID for cache management
          localStorage.setItem("current-cache-user-id", user.id);

          // Mark cache as needing initialization
          cacheInitialized.current = false;

          console.log("✅ Cache system marked for initialization");
        } catch (cacheError) {
          console.warn("⚠️ Cache initialization setup failed:", cacheError);
        }

        console.log("✅ Login process completed successfully");
        console.log("🔍 Final auth state after login:", {
          isAuthenticated: true,
          user: user,
          token: response.data.access_token,
        });

        return { success: true };
      } else {
        const errorMessage = response.error?.message || "Login failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    if (isLoggingOut) {
      console.log("🔄 Logout already in progress, skipping...");
      return;
    }

    try {
      console.log("🚪 AuthContext: Starting logout process...");
      setIsLoggingOut(true);

      // Clear tokens from storage first (immediate local logout)
      console.log("🧹 AuthContext: Clearing tokens and session...");
      SessionPersistence.clearSession();

      // Clear cache for the user
      if (state.user) {
        try {
          console.log("🧹 AuthContext: Clearing user cache...");

          // Clear all cache entries for this user
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`cache_${state.user.id}_`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          // Remove current user ID
          localStorage.removeItem("current-cache-user-id");

          console.log("✅ AuthContext: User cache cleared");
        } catch (cacheError) {
          console.warn("⚠️ AuthContext: Failed to clear cache:", cacheError);
        }
      }

      // Update state immediately
      console.log("🔄 AuthContext: Updating state...");
      dispatch({ type: "LOGOUT" });
      setError(null);

      // Call logout API in background (don't wait for it)
      AuthService.logout().catch((error) => {
        console.warn("⚠️ Logout API call failed (continuing anyway):", error);
      });

      console.log("✅ AuthContext: Local logout completed successfully");

      // Force redirect to login page immediately
      if (typeof window !== "undefined") {
        console.log("🔄 AuthContext: Redirecting to login...");
        // Use replace to prevent back button issues and add a small delay to ensure state is updated
        setTimeout(() => {
          window.location.replace("/login");
        }, 100);
      }
    } catch (error) {
      console.error("❌ AuthContext: Logout failed:", error);
      // Still logout locally even if everything fails
      dispatch({ type: "LOGOUT" });
      setError(null);
      SessionPersistence.clearSession();

      // Force redirect even on error
      if (typeof window !== "undefined") {
        console.log(
          "🔄 AuthContext: Force redirecting to login after error...",
        );
        setTimeout(() => {
          window.location.replace("/login");
        }, 100);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Refresh user data with caching to prevent duplicate API calls
   */
  const refreshUser = async (): Promise<void> => {
    const now = Date.now();
    const REFRESH_COOLDOWN = 10000; // 10 seconds cooldown for refreshUser

    // Prevent duplicate calls within cooldown period
    if (now - refreshUserCache.current.lastRefreshTime < REFRESH_COOLDOWN) {
      console.log("🚫 Skipping refreshUser - too recent (within 10s cooldown)");
      return;
    }

    try {
      if (!state.isAuthenticated) return;

      console.log("🔄 Refreshing user data...");
      refreshUserCache.current.lastRefreshTime = now;

      const userResponse = await AuthService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        dispatch({ type: "SET_USER", payload: userResponse.data });
        console.log("✅ User data refreshed successfully");
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    error,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Debug logging
  React.useEffect(() => {
    console.log("🔍 useAuth state:", {
      isAuthenticated: context.isAuthenticated,
      isLoading: context.isLoading,
      user: context.user,
      hasToken: !!context.token,
    });
  }, [context.isAuthenticated, context.isLoading, context.user, context.token]);

  return context;
}
