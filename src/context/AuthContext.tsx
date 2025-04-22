import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

// Auth context interface
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'host' | 'participant' | 'admin') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is logged in on initial load
  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Initialize admin account if it doesn't exist
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = users.some((u: { email: string; role: string; }) => 
      u.email === 'reetdeb08@gmail.com' && u.role === 'admin'
    );
    
    if (!adminExists) {
      const adminUser = {
        id: 'admin-001',
        name: 'Administrator',
        email: 'reetdeb08@gmail.com',
        password: 'reetdeb08',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      users.push(adminUser);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Admin account created');
    }
    
    setIsLoading(false);
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // In a real app, you would make an API call here
      // For this demo, we'll just check if the user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find(
        (u: { email: string; password: string }) => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword as User);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Register function
  const register = async (name: string, email: string, password: string, role: 'host' | 'participant' | 'admin' = 'participant'): Promise<void> => {
    try {
      // In a real app, you would make an API call here
      // For this demo, we'll just store the user in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user with this email already exists
      const userExists = users.some((u: { email: string }) => u.email === email);
      
      if (userExists) {
        throw new Error('User with this email already exists');
      }
      
      // Create a new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Log the user in
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword as User);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const contextValue: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 