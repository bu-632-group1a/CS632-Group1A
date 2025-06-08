import React, { createContext, useContext, ReactNode } from 'react';
import { Session } from '../types';
import { mockSessions } from '../data/mockData';

interface AppContextType {
  sessions: Session[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Remove bingo and sustainability actions from context since they're now handled by GraphQL
  const sessions = mockSessions;

  return (
    <AppContext.Provider 
      value={{ 
        sessions
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