'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setUserEmail: (email: string) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  token: null,
  userEmail: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  setToken: () => {},
  setUserEmail: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [userEmail, setUserEmailState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('pinterest_token');
      const storedEmail = localStorage.getItem('pinterest_user_email');
      
      if (storedToken) {
        setTokenState(storedToken);
        setIsAuthenticated(true);
      }
      
      if (storedEmail) {
        setUserEmailState(storedEmail);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Login function to set token and email
  const login = (newToken: string, email: string) => {
    try {
      // Store in state
      setTokenState(newToken);
      setUserEmailState(email);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('pinterest_token', newToken);
      localStorage.setItem('pinterest_user_email', email);
      
      console.log('Logged in with token (first 10 chars):', newToken.substring(0, 10) + '...');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Logout function to clear token and email
  const logout = () => {
    try {
      // Clear state
      setTokenState(null);
      setUserEmailState(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('pinterest_token');
      localStorage.removeItem('pinterest_user_email');
      
      console.log('Logged out');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Set token function
  const setToken = (newToken: string) => {
    try {
      // Store in state
      setTokenState(newToken);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('pinterest_token', newToken);
      
      console.log('Token updated (first 10 chars):', newToken.substring(0, 10) + '...');
    } catch (error) {
      console.error('Error setting token:', error);
    }
  };

  // Set user email function
  const setUserEmail = (email: string) => {
    try {
      // Store in state
      setUserEmailState(email);
      
      // Store in localStorage
      localStorage.setItem('pinterest_user_email', email);
      
      console.log('Email updated:', email);
    } catch (error) {
      console.error('Error setting email:', error);
    }
  };

  // Only render children after initialization to prevent hydration issues
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        userEmail,
        isAuthenticated,
        login,
        logout,
        setToken,
        setUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
