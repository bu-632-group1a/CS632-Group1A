import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, SpeakerInfo, Comment } from '../types';
import { useAuth } from './AuthContext';
import { 
  getSessions, 
  getSession, 
  getSessionComments, 
  addSessionComment, 
  getUserAgenda, 
  addToAgenda, 
  removeFromAgenda,
  checkInToSession
} from '../services/eventService';

interface EventContextType {
  sessions: Session[];
  userAgenda: Session[];
  checkedInSessions: string[];
  speakerInfo: Record<string, SpeakerInfo>;
  sessionComments: Record<string, Comment[]>;
  isLoading: boolean;
  error: string | null;
  fetchSession: (sessionId: string) => Promise<Session>;
  fetchSessionComments: (sessionId: string) => Promise<Comment[]>;
  addComment: (sessionId: string, content: string) => Promise<void>;
  addSessionToAgenda: (sessionId: string) => Promise<void>;
  removeSessionFromAgenda: (sessionId: string) => Promise<void>;
  isSessionInAgenda: (sessionId: string) => boolean;
  isCheckedInToSession: (sessionId: string) => boolean;
  checkInSession: (sessionId: string, qrCode: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userAgenda, setUserAgenda] = useState<Session[]>([]);
  const [checkedInSessions, setCheckedInSessions] = useState<string[]>([]);
  const [speakerInfo, setSpeakerInfo] = useState<Record<string, SpeakerInfo>>({});
  const [sessionComments, setSessionComments] = useState<Record<string, Comment[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions when component mounts
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const sessionData = await getSessions();
        setSessions(sessionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Load user's agenda when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserAgenda();
    } else {
      setUserAgenda([]);
      setCheckedInSessions([]);
    }
  }, [isAuthenticated, user]);

  const loadUserAgenda = async () => {
    setIsLoading(true);
    try {
      const agendaData = await getUserAgenda();
      
      // Map agenda session IDs to full session objects
      const agendaSessions = agendaData.sessionIds.map(id => 
        sessions.find(session => session.id === id)
      ).filter(Boolean) as Session[];
      
      setUserAgenda(agendaSessions);
      setCheckedInSessions(agendaData.checkedInSessionIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user agenda');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSession = async (sessionId: string): Promise<Session> => {
    setIsLoading(true);
    try {
      const session = await getSession(sessionId);
      return session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionComments = async (sessionId: string): Promise<Comment[]> => {
    setIsLoading(true);
    try {
      const comments = await getSessionComments(sessionId);
      setSessionComments(prev => ({
        ...prev,
        [sessionId]: comments
      }));
      return comments;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session comments');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (sessionId: string, content: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to add comments');
      return;
    }

    setIsLoading(true);
    try {
      const newComment = await addSessionComment(sessionId, content);
      setSessionComments(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), newComment]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addSessionToAgenda = async (sessionId: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to add sessions to your agenda');
      return;
    }

    setIsLoading(true);
    try {
      await addToAgenda(sessionId);
      const sessionToAdd = sessions.find(s => s.id === sessionId);
      if (sessionToAdd) {
        setUserAgenda(prev => [...prev, sessionToAdd]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add session to agenda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeSessionFromAgenda = async (sessionId: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to remove sessions from your agenda');
      return;
    }

    setIsLoading(true);
    try {
      await removeFromAgenda(sessionId);
      setUserAgenda(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove session from agenda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isSessionInAgenda = (sessionId: string): boolean => {
    return userAgenda.some(session => session.id === sessionId);
  };

  const isCheckedInToSession = (sessionId: string): boolean => {
    return checkedInSessions.includes(sessionId);
  };

  const checkInSession = async (sessionId: string, qrCode: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to check in to sessions');
      return;
    }

    setIsLoading(true);
    try {
      await checkInToSession(sessionId, qrCode);
      setCheckedInSessions(prev => [...prev, sessionId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in to session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EventContext.Provider
      value={{
        sessions,
        userAgenda,
        checkedInSessions,
        speakerInfo,
        sessionComments,
        isLoading,
        error,
        fetchSession,
        fetchSessionComments,
        addComment,
        addSessionToAgenda,
        removeSessionFromAgenda,
        isSessionInAgenda,
        isCheckedInToSession,
        checkInSession
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};