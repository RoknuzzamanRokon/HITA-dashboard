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
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
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
      dispatch({ type: "SET_LOADING", payload: true });

      // Check if user is authenticated
      if (AuthService.isAuthenticated()) {
        const token = AuthService.getToken();
        dispatch({ type: "SET_TOKEN", payload: token });

        // Fetch current user
        const userResponse = await AuthService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          dispatch({ type: "SET_USER", payload: userResponse.data });
        } else {
          // Token might be invalid, clear it
          await AuthService.logout();
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "LOGOUT" });
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
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

      const response = await AuthService.login(credentials);

      if (response.success && response.data) {
        // Fetch user profile after successful login
        const userResponse = await AuthService.getCurrentUser();

        if (userResponse.success && userResponse.data) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: userResponse.data,
              token: response.data.access_token,
            },
          });
          return { success: true };
        } else {
          const errorMessage =
            userResponse.error?.message || "Failed to fetch user profile";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
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
      dispatch({ type: "SET_LOADING", payload: true });
      await AuthService.logout();
      dispatch({ type: "LOGOUT" });
      setError(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Still logout locally even if API call fails
      dispatch({ type: "LOGOUT" });
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
  return context;
}
