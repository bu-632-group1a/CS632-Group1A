import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useMutation, ApolloError } from '@apollo/client';
import { LOGIN, REGISTER, LOGOUT } from '../graphql/mutations';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  role: 'USER' | 'ADMIN';
  sustainabilityScore: number;
  badges: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  }[];
  checkedInEvents: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  tokenExpiry: number | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_state';
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh if token expires within 5 minutes

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { 
      accessToken: null, 
      refreshToken: null, 
      user: null, 
      tokenExpiry: null 
    };
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);
  const [logoutMutation] = useMutation(LOGOUT);

  // Decode JWT to get expiry time
  const decodeTokenExpiry = (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    if (!authState.tokenExpiry || !authState.accessToken) {
      return false;
    }

    const now = Date.now();
    const isExpired = now >= authState.tokenExpiry;
    
    if (isExpired) {
      console.log('🚨 Token has expired');
    }
    
    return isExpired;
  };

  const saveAuthState = (state: AuthState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setAuthState(state);
  };

  const handleGraphQLError = (error: ApolloError) => {
    if (error.graphQLErrors?.length > 0) {
      throw new Error(error.graphQLErrors[0].message);
    } else if (error.networkError) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  };

  // Force logout without calling backend (for when tokens are expired)
  const forceLogout = async () => {
    console.log('🚨 Force logout initiated due to token expiry');
    stopTokenRefreshTimer();
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({ accessToken: null, refreshToken: null, user: null, tokenExpiry: null });
    
    // Show user notification about automatic logout
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      console.log('🔄 Redirecting to login page due to expired session');
      // You could also show a toast notification here
      window.location.href = '/login';
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!authState.refreshToken) {
      console.log('🔄 No refresh token available for token refresh');
      return false;
    }

    try {
      console.log('🔄 Attempting to refresh access token...');
      
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation RefreshToken($refreshToken: String!) {
              refreshToken(refreshToken: $refreshToken) {
                accessToken
                refreshToken
                user {
                  id
                  firstName
                  lastName
                  fullName
                  email
                  profilePicture
                  role
                  createdAt
                  updatedAt
                }
              }
            }
          `,
          variables: {
            refreshToken: authState.refreshToken
          }
        }),
      });

      const data = await response.json();

      if (data.errors) {
        console.error('❌ Token refresh failed:', data.errors);
        
        // Check if refresh token is expired or invalid
        const isRefreshTokenExpired = data.errors.some((error: any) => 
          error.message.includes('expired') || 
          error.message.includes('invalid') ||
          error.message.includes('token')
        );
        
        if (isRefreshTokenExpired) {
          console.log('🚨 Refresh token expired or invalid - automatically signing out user');
          await forceLogout();
        }
        
        return false;
      }

      if (data.data?.refreshToken) {
        const { accessToken, refreshToken, user } = data.data.refreshToken;
        const tokenExpiry = decodeTokenExpiry(accessToken);
        
        const newAuthState = {
          accessToken,
          refreshToken,
          user,
          tokenExpiry
        };

        saveAuthState(newAuthState);
        console.log('✅ Access token refreshed successfully');
        console.log(`🕒 New token expires at: ${new Date(tokenExpiry || 0).toLocaleString()}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      console.log('🚨 Network error during token refresh - automatically signing out user');
      await forceLogout();
      return false;
    }
  };

  // Check if token needs refresh
  const shouldRefreshToken = (): boolean => {
    if (!authState.tokenExpiry || !authState.accessToken) {
      return false;
    }

    const now = Date.now();
    const timeUntilExpiry = authState.tokenExpiry - now;
    
    return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;
  };

  // Periodic token refresh check
  const startTokenRefreshTimer = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(async () => {
      if (!authState.accessToken || !authState.refreshToken) {
        console.log('🔄 No tokens available, stopping refresh timer');
        return;
      }

      console.log('🔄 Checking if token refresh is needed...');
      
      // First check if token is already expired
      if (isTokenExpired()) {
        console.log('🚨 Token is expired - attempting refresh or logout');
        const refreshSuccess = await refreshAccessToken();
        
        if (!refreshSuccess) {
          console.log('🚨 Failed to refresh expired token - signing out user');
          await forceLogout();
        }
        return;
      }
      
      // Then check if token needs proactive refresh
      if (shouldRefreshToken()) {
        console.log('🔄 Token refresh needed, refreshing now...');
        const refreshSuccess = await refreshAccessToken();
        
        if (!refreshSuccess) {
          console.log('🚨 Failed to refresh token proactively - signing out user');
          await forceLogout();
        }
      } else {
        const timeUntilExpiry = authState.tokenExpiry ? authState.tokenExpiry - Date.now() : 0;
        const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
        console.log(`✅ Token is still valid for ${minutesUntilExpiry} minutes`);
      }
    }, TOKEN_REFRESH_INTERVAL);

    console.log(`🔄 Token refresh timer started (checking every ${TOKEN_REFRESH_INTERVAL / 1000 / 60} minutes)`);
  };

  const stopTokenRefreshTimer = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.log('🔄 Token refresh timer stopped');
    }
  };

  // Start/stop timer based on authentication state
  useEffect(() => {
    if (authState.accessToken && authState.refreshToken) {
      startTokenRefreshTimer();
    } else {
      stopTokenRefreshTimer();
    }

    return () => stopTokenRefreshTimer();
  }, [authState.accessToken, authState.refreshToken]);

  // Initial token validation on app load - IMMEDIATE CHECK
  useEffect(() => {
    const checkTokenOnLoad = async () => {
      if (authState.accessToken && authState.tokenExpiry) {
        const now = Date.now();
        const timeUntilExpiry = authState.tokenExpiry - now;
        
        console.log(`🔄 App loaded with existing token`);
        console.log(`🕒 Token expires at: ${new Date(authState.tokenExpiry).toLocaleString()}`);
        console.log(`⏰ Time until expiry: ${Math.floor(timeUntilExpiry / (1000 * 60))} minutes`);

        // IMMEDIATE CHECK - if token is already expired, sign out immediately
        if (isTokenExpired()) {
          console.log('🚨 Token already expired on app load - signing out immediately');
          await forceLogout();
          return;
        }

        // If token expires soon, try to refresh
        if (shouldRefreshToken()) {
          console.log('🔄 Token expires soon, refreshing proactively...');
          const refreshSuccess = await refreshAccessToken();
          if (!refreshSuccess) {
            console.log('🚨 Failed to refresh token on app load - signing out user');
            await forceLogout();
          }
        }
      }
    };

    checkTokenOnLoad();
  }, []); // Only run once on mount

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      });

      if (!data?.login) {
        throw new Error('Invalid credentials');
      }

      const { user, accessToken, refreshToken } = data.login;
      const tokenExpiry = decodeTokenExpiry(accessToken);
      
      const newAuthState = { user, accessToken, refreshToken, tokenExpiry };
      saveAuthState(newAuthState);
      
      console.log('✅ Login successful');
      console.log(`🕒 Token expires at: ${new Date(tokenExpiry || 0).toLocaleString()}`);
    } catch (error) {
      handleGraphQLError(error as ApolloError);
    }
  };

  const register = async (input: RegisterInput) => {
    try {
      const { data } = await registerMutation({
        variables: { input }
      });

      if (!data?.register) {
        throw new Error('Registration failed');
      }

      const { user, accessToken, refreshToken } = data.register;
      const tokenExpiry = decodeTokenExpiry(accessToken);
      
      const newAuthState = { user, accessToken, refreshToken, tokenExpiry };
      saveAuthState(newAuthState);
      
      console.log('✅ Registration successful');
      console.log(`🕒 Token expires at: ${new Date(tokenExpiry || 0).toLocaleString()}`);
    } catch (error) {
      handleGraphQLError(error as ApolloError);
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Logout initiated by user');
      
      // Always clear local state first to ensure UI updates immediately
      stopTokenRefreshTimer();
      localStorage.removeItem(STORAGE_KEY);
      setAuthState({ accessToken: null, refreshToken: null, user: null, tokenExpiry: null });
      
      // Try to call backend logout, but don't block if it fails
      if (authState.refreshToken) {
        try {
          await logoutMutation({
            variables: { refreshToken: authState.refreshToken }
          });
          console.log('✅ Backend logout successful');
        } catch (error) {
          console.warn('⚠️ Backend logout failed, but local logout completed:', error);
        }
      }
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Local state is already cleared above, so logout is still effective
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: authState.user,
        isAuthenticated: !!authState.user && !!authState.accessToken && !isTokenExpired(),
        login,
        register,
        logout,
        loading: loginLoading || registerLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};