/**
 * Authentication Context for global authentication state management
 */

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { AuthService } from "@/lib/api/auth";
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
    credentials: LoginCredentials
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

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state
   */
  const initializeAuth = async () => {
    try {
      console.log("🔄 Initializing auth state...");
      dispatch({ type: "SET_LOADING", payload: true });

      // Check if user is authenticated
      if (AuthService.isAuthenticated()) {
        console.log("✅ Token found, fetching user profile...");
        const token = AuthService.getToken();
        dispatch({ type: "SET_TOKEN", payload: token });

        // Fetch current user
        const userResponse = await AuthService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          console.log(
            "✅ User profile loaded successfully:",
            userResponse.data
          );
          dispatch({ type: "SET_USER", payload: userResponse.data });
        } else {
          console.warn(
            "❌ Failed to fetch user profile, clearing tokens:",
            userResponse.error
          );
          // Token might be invalid, clear it
          await AuthService.logout();
          dispatch({ type: "LOGOUT" });
        }
      } else {
        console.log("❌ No token found, user not authenticated");
        dispatch({ type: "LOGOUT" });
      }
    } catch (error) {
      console.error("❌ Auth initialization failed:", error);
      // Clear tokens on any error
      await AuthService.logout();
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
      console.log("🔄 Auth initialization completed");
    }
  };

  /**
   * Login user
   */
  const login = async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      setError(null);

      console.log("🔐 Starting login process...");
      const response = await AuthService.login(credentials);
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
            userResponse.error
          );
          user = AuthService.createFallbackUser(
            credentials.username,
            response.data.access_token
          );
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
        console.log("✅ Login process completed successfully");
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
    try {
      console.log("🚪 Starting logout process...");
      dispatch({ type: "SET_LOADING", payload: true });

      // Clear tokens from storage
      await AuthService.logout();

      // Update state
      dispatch({ type: "LOGOUT" });
      setError(null);

      console.log("✅ Logout completed successfully");

      // Force redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Still logout locally even if API call fails
      dispatch({ type: "LOGOUT" });
      setError(null);

      // Force redirect even on error
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      if (!state.isAuthenticated) return;

      const userResponse = await AuthService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        dispatch({ type: "SET_USER", payload: userResponse.data });
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
