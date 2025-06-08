import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import SessionsPage from '../pages/SessionsPage';
import BookmarksPage from '../pages/BookmarksPage';
import CalendarPage from '../pages/CalendarPage';
import ProfilePage from '../pages/ProfilePage';
import CheckInPage from '../pages/CheckInPage';
import BingoPage from '../pages/BingoPage';
import BingoAdminPage from '../pages/BingoAdminPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import SustainabilityPage from '../pages/SustainabilityPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import { useAuth } from '../context/AuthContext';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login\" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login\" replace />;
  }
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Error boundary component for better error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please refresh the page and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for pages with error boundary
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

// Router configuration with improved error handling
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
          <a
            href="/"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Go Home
          </a>
        </div>
      </div>
    ),
    children: [
      {
        index: true,
        element: (
          <PageWrapper>
            <HomePage />
          </PageWrapper>
        ),
      },
      {
        path: 'login',
        element: (
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        ),
      },
      {
        path: 'signup',
        element: (
          <PageWrapper>
            <RegistrationPage />
          </PageWrapper>
        ),
      },
      {
        path: 'register', // Alternative path for signup
        element: <Navigate to="/signup" replace />,
      },
      {
        path: 'reset-password',
        element: (
          <PageWrapper>
            <ResetPasswordPage />
          </PageWrapper>
        ),
      },
      {
        path: 'verify-email',
        element: (
          <PageWrapper>
            <VerifyEmailPage />
          </PageWrapper>
        ),
      },
      {
        path: 'logout',
        element: <Navigate to="/" replace />,
      },
      {
        path: 'sessions',
        element: (
          <PageWrapper>
            <SessionsPage />
          </PageWrapper>
        ),
      },
      {
        path: 'calendar',
        element: (
          <ProtectedRoute>
            <PageWrapper>
              <CalendarPage />
            </PageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'bookmarks',
        element: (
          <ProtectedRoute>
            <PageWrapper>
              <BookmarksPage />
            </PageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <PageWrapper>
              <ProfilePage />
            </PageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        // IMPORTANT: Remove ProtectedRoute wrapper from check-in to allow QR code access
        path: 'check-in',
        element: (
          <PageWrapper>
            <CheckInPage />
          </PageWrapper>
        ),
      },
      {
        path: 'bingo',
        element: (
          <ProtectedRoute>
            <PageWrapper>
              <BingoPage />
            </PageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/bingo',
        element: (
          <AdminRoute>
            <PageWrapper>
              <BingoAdminPage />
            </PageWrapper>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <AdminRoute>
            <PageWrapper>
              <AdminDashboardPage />
            </PageWrapper>
          </AdminRoute>
        ),
      },
      {
        path: 'sustainability',
        element: (
          <PageWrapper>
            <SustainabilityPage />
          </PageWrapper>
        ),
      },
      {
        path: 'leaderboard',
        element: (
          <PageWrapper>
            <LeaderboardPage />
          </PageWrapper>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  future: {
    v7_skipActionErrorRevalidation: true,
  },
});

export default router;