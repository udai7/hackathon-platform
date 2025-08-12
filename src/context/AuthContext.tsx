import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";

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
    const token = localStorage.getItem("authToken");
    const sessionExpiry = localStorage.getItem("sessionExpiry");

    if (!token || !sessionExpiry) {
      return false;
    }

    if (isTokenExpired(token) || Date.now() > parseInt(sessionExpiry)) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("sessionExpiry");
      localStorage.removeItem("user");
      return false;
    }

    return true;
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const token = localStorage.getItem("authToken");
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
        localStorage.setItem("authToken", data.token);
        localStorage.setItem(
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
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }

      // Initialize admin account if it doesn't exist
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const adminExists = users.some(
        (u: { email: string; role: string }) =>
          u.email === "reetdeb08@gmail.com" && u.role === "admin"
      );

      if (!adminExists) {
        const adminUser = {
          id: "admin-001",
          name: "Administrator",
          email: "reetdeb08@gmail.com",
          password: "reetdeb08",
          role: "admin",
          createdAt: new Date().toISOString(),
        };

        users.push(adminUser);
        localStorage.setItem("users", JSON.stringify(users));
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Generate JWT token (client-side simulation)
  const generateToken = (user: User) => {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    // This is a simplified JWT generation for demo purposes
    // In production, this should be done server-side
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      const userWithoutPassword = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
        avatar: foundUser.avatar,
        provider: foundUser.provider || "local",
      };

      // Generate session
      const token = generateToken(userWithoutPassword);
      const sessionExpiry = Date.now() + SESSION_TIMEOUT;

      localStorage.setItem("authToken", token);
      localStorage.setItem("sessionExpiry", sessionExpiry.toString());
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      setUser(userWithoutPassword);
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

      // Decode Google JWT credential
      const googleUser = decodeJWT(credential);
      if (!googleUser) {
        throw new Error("Invalid Google credential");
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      let foundUser = users.find((u: any) => u.email === googleUser.email);

      if (!foundUser) {
        // Create new user from Google account
        foundUser = {
          id: `google-${Date.now()}`,
          name: googleUser.name,
          email: googleUser.email,
          role: "participant", // Default role for Google users
          createdAt: new Date().toISOString(),
          avatar: googleUser.picture,
          provider: "google",
        };

        users.push(foundUser);
        localStorage.setItem("users", JSON.stringify(users));
      } else {
        // Update existing user with Google info
        foundUser.avatar = googleUser.picture;
        foundUser.provider = "google";
        localStorage.setItem("users", JSON.stringify(users));
      }

      const userWithoutPassword = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
        avatar: foundUser.avatar,
        provider: (foundUser.provider as "local" | "google") || "local",
      };

      // Generate session
      const token = generateToken(userWithoutPassword);
      const sessionExpiry = Date.now() + SESSION_TIMEOUT;

      localStorage.setItem("authToken", token);
      localStorage.setItem("sessionExpiry", sessionExpiry.toString());
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      setUser(userWithoutPassword);
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

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const users = JSON.parse(localStorage.getItem("users") || "[]");

      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString(),
        provider: "local",
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      const userWithoutPassword = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        provider: newUser.provider as "local" | "google",
      };

      // Generate session
      const token = generateToken(userWithoutPassword);
      const sessionExpiry = Date.now() + SESSION_TIMEOUT;

      localStorage.setItem("authToken", token);
      localStorage.setItem("sessionExpiry", sessionExpiry.toString());
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      setUser(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("sessionExpiry");
    localStorage.removeItem("user");
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
