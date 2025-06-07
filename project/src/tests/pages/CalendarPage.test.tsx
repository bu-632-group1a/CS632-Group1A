import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CalendarPage from '../../pages/CalendarPage';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';

// Mock the hooks
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'test-user', fullName: 'Test User' },
  }),
}));

jest.mock('../../hooks/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [
      { id: 1, code: '1', description: 'Session 1', userId: 'test-user' },
      { id: 2, code: '2', description: 'Session 2', userId: 'test-user' },
    ],
    loading: false,
    error: null,
    createBookmark: jest.fn(),
    deleteBookmark: jest.fn(),
    isSessionBookmarked: jest.fn(),
    getBookmarkBySessionId: jest.fn(),
    refetch: jest.fn(),
  }),
}));

jest.mock('../../context/AppContext', () => ({
  ...jest.requireActual('../../context/AppContext'),
  useApp: () => ({
    sessions: [
      {
        id: '1',
        title: 'Test Session 1',
        description: 'Test description 1',
        speaker: 'Speaker 1',
        time: '9:00 AM - 10:00 AM',
        location: 'Room 1',
        category: 'Test',
        date: '2025-06-13',
        type: 'presentation'
      },
      {
        id: '2',
        title: 'Test Session 2',
        description: 'Test description 2',
        speaker: 'Speaker 2',
        time: '10:00 AM - 11:00 AM',
        location: 'Room 2',
        category: 'Test',
        date: '2025-06-13',
        type: 'presentation'
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

describe('CalendarPage', () => {
  test('renders calendar page for authenticated user', async () => {
    renderWithProviders(<CalendarPage />);
    
    expect(screen.getByText('My Calendar')).toBeInTheDocument();
    expect(screen.getByText('Your personalized conference agenda')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Session 1')).toBeInTheDocument();
      expect(screen.getByText('Test Session 2')).toBeInTheDocument();
    });
  });

  test('shows summary stats', async () => {
    renderWithProviders(<CalendarPage />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Bookmarked Sessions count
      expect(screen.getByText('Bookmarked Sessions')).toBeInTheDocument();
      expect(screen.getByText('Conference Days')).toBeInTheDocument();
      expect(screen.getByText('Schedule Conflicts')).toBeInTheDocument();
    });
  });

  test('displays session details correctly', async () => {
    renderWithProviders(<CalendarPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Session 1')).toBeInTheDocument();
      expect(screen.getByText('Speaker 1')).toBeInTheDocument();
      expect(screen.getByText('9:00 AM - 10:00 AM')).toBeInTheDocument();
      expect(screen.getByText('Room 1')).toBeInTheDocument();
    });
  });

  test('shows empty state when no bookmarks', async () => {
    // Mock empty bookmarks
    jest.doMock('../../hooks/useBookmarks', () => ({
      useBookmarks: () => ({
        bookmarks: [],
        loading: false,
        error: null,
        createBookmark: jest.fn(),
        deleteBookmark: jest.fn(),
        isSessionBookmarked: jest.fn(),
        getBookmarkBySessionId: jest.fn(),
        refetch: jest.fn(),
      }),
    }));

    const { CalendarPage: EmptyCalendarPage } = await import('../../pages/CalendarPage');
    
    renderWithProviders(<EmptyCalendarPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No sessions bookmarked')).toBeInTheDocument();
      expect(screen.getByText('Browse Sessions')).toBeInTheDocument();
    });
  });
});