import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';

// Mock the hooks
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));

jest.mock('../../context/AppContext', () => ({
  ...jest.requireActual('../../context/AppContext'),
  useApp: () => ({
    sessions: [
      {
        id: '1',
        title: 'Test Session',
        description: 'Test description',
        speaker: 'Test Speaker',
        time: '10:00 AM',
        location: 'Room 1',
        category: 'Energy',
      },
    ],
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          {ui}
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  test('renders the hero section', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('EcoConnect Conference 2025')).toBeInTheDocument();
    expect(screen.getByText(/Join us for a transformative experience/)).toBeInTheDocument();
    expect(screen.getByText('View Schedule')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  test('renders featured sessions section', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Featured Sessions')).toBeInTheDocument();
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  test('renders about the event section', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('About the Event')).toBeInTheDocument();
    expect(screen.getByText('Event Details')).toBeInTheDocument();
    expect(screen.getByText('Register Now')).toBeInTheDocument();
  });
});