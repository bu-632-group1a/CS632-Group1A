import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { accessToken: null, refreshToken: null, user: null };
  });

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);
  const [logoutMutation] = useMutation(LOGOUT);

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
      saveAuthState({ user, accessToken, refreshToken });
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
      saveAuthState({ user, accessToken, refreshToken });
    } catch (error) {
      handleGraphQLError(error as ApolloError);
    }
  };

  const logout = async () => {
    try {
      if (authState.refreshToken) {
        await logoutMutation({
          variables: { refreshToken: authState.refreshToken }
        });
      }
      localStorage.removeItem(STORAGE_KEY);
      setAuthState({ accessToken: null, refreshToken: null, user: null });
    } catch (error) {
      handleGraphQLError(error as ApolloError);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: authState.user,
        isAuthenticated: !!authState.user,
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