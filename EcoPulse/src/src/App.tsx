import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SustainabilityProvider } from './contexts/SustainabilityContext';
import { EventProvider } from './contexts/EventContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AgendaPage from './pages/AgendaPage';
import SessionsPage from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import SustainabilityPage from './pages/SustainabilityPage';
import LeaderboardPage from './pages/LeaderboardPage';
import BingoPage from './pages/BingoPage';
import ScannerPage from './pages/ScannerPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <SustainabilityProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/agenda" element={
                  <ProtectedRoute>
                    <AgendaPage />
                  </ProtectedRoute>
                } />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/sessions/:id" element={<SessionDetailPage />} />
                <Route path="/sustainability" element={
                  <ProtectedRoute>
                    <SustainabilityPage />
                  </ProtectedRoute>
                } />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/bingo" element={
                  <ProtectedRoute>
                    <BingoPage />
                  </ProtectedRoute>
                } />
                <Route path="/scanner" element={
                  <ProtectedRoute>
                    <ScannerPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/*" element={
                  <ProtectedRoute isAdmin={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </SustainabilityProvider>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;