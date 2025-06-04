import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Session, BingoItem, SustainabilityAction } from '../types';
import { mockSessions, mockBingoItems, mockSustainabilityActions, mockBookmarkedSessions } from '../data/mockData';

interface AppContextType {
  sessions: Session[];
  bingoItems: BingoItem[];
  sustainabilityActions: SustainabilityAction[];
  bookmarkedSessions: string[];
  toggleSessionBookmark: (sessionId: string) => void;
  toggleBingoItem: (itemId: string) => void;
  toggleSustainabilityAction: (actionId: string) => void;
  isSessionBookmarked: (sessionId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions] = useState<Session[]>(mockSessions);
  const [bingoItems, setBingoItems] = useState<BingoItem[]>(mockBingoItems);
  const [sustainabilityActions, setSustainabilityActions] = useState<SustainabilityAction[]>(mockSustainabilityActions);
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>(mockBookmarkedSessions);

  const toggleSessionBookmark = (sessionId: string) => {
    setBookmarkedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const toggleBingoItem = (itemId: string) => {
    setBingoItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const toggleSustainabilityAction = (actionId: string) => {
    setSustainabilityActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { 
              ...action, 
              completed: !action.completed,
              date: !action.completed ? new Date().toISOString().split('T')[0] : action.date
            } 
          : action
      )
    );
  };

  const isSessionBookmarked = (sessionId: string) => {
    return bookmarkedSessions.includes(sessionId);
  };

  return (
    <AppContext.Provider 
      value={{ 
        sessions, 
        bingoItems, 
        sustainabilityActions, 
        bookmarkedSessions,
        toggleSessionBookmark,
        toggleBingoItem,
        toggleSustainabilityAction,
        isSessionBookmarked
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};