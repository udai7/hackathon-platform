import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";
import api from "../services/api";

// Auth context interface
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "host" | "participant" | "admin"
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// JWT token utilities
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const isTokenExpired = (token: string) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Session management
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  const REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour before expiry

  // Check session validity
  const checkSession = () => {
    const token = sessionStorage.getItem("authToken");
    const sessionExpiry = sessionStorage.getItem("sessionExpiry");

    if (!token || !sessionExpiry) {
      return false;
    }

    if (isTokenExpired(token) || Date.now() > parseInt(sessionExpiry)) {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("sessionExpiry");
      sessionStorage.removeItem("user");
      return false;
    }

    return true;
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem(
          "sessionExpiry",
          (Date.now() + SESSION_TIMEOUT).toString()
        );
        setUser(data.user);
      } else {
        throw new Error("Session refresh failed");
      }
    } catch (error) {
      console.error("Session refresh error:", error);
      logout();
    }
  };

  // Auto-refresh session
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionExpiry = localStorage.getItem("sessionExpiry");
      if (sessionExpiry && user) {
        const timeUntilExpiry = parseInt(sessionExpiry) - Date.now();
        if (timeUntilExpiry < REFRESH_THRESHOLD && timeUntilExpiry > 0) {
          refreshSession();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  // Check if user is logged in on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      if (checkSession()) {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }

      // admin seeding moved to server-side reset script

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // No client-side token generation; server issues tokens

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { token, user: u } = res.data;
      if (token) {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem(
          "sessionExpiry",
          (Date.now() + SESSION_TIMEOUT).toString()
        );
        sessionStorage.setItem("user", JSON.stringify(u));
        setUser(u);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      setIsLoading(true);
      // For Google OAuth, delegate to backend if implemented.
      // Here we assume a backend endpoint /auth/google exists (not yet implemented).
      const res = await api.post("/auth/google", { credential });
      const { token, user: u } = res.data;
      if (token) {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem(
          "sessionExpiry",
          (Date.now() + SESSION_TIMEOUT).toString()
        );
        sessionStorage.setItem("user", JSON.stringify(u));
        setUser(u);
      } else {
        throw new Error("Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "host" | "participant" | "admin"
  ) => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const { token, user: u } = res.data;
      if (token) {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem(
          "sessionExpiry",
          (Date.now() + SESSION_TIMEOUT).toString()
        );
        sessionStorage.setItem("user", JSON.stringify(u));
        setUser(u);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Call backend to clear refresh token cookie
    api.post("/auth/logout").catch(() => {});
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("sessionExpiry");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    isLoading,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
