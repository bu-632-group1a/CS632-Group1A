import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import SessionsPage from '../pages/SessionsPage';
import BookmarksPage from '../pages/BookmarksPage';
import ProfilePage from '../pages/ProfilePage';
import CheckInPage from '../pages/CheckInPage';
import BingoPage from '../pages/BingoPage';
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

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <RegistrationPage />,
      },
      {
        path: 'logout',
        element: <Navigate to="/\" replace />,
      },
      {
        path: 'sessions',
        element: <SessionsPage />,
      },
      {
        path: 'bookmarks',
        element: (
          <ProtectedRoute>
            <BookmarksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'check-in',
        element: (
          <ProtectedRoute>
            <CheckInPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bingo',
        element: (
          <ProtectedRoute>
            <BingoPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'sustainability',
        element: (
          <ProtectedRoute>
            <SustainabilityPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'leaderboard',
        element: <LeaderboardPage />,
      },
      {
        path: '*',
        element: <Navigate to="/\" replace />,
      },
    ],
  },
]);

export default router;