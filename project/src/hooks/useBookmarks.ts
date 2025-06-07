import { useState, useEffect, useCallback } from 'react';
import { BookmarkService } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';
import { Session } from '../types';

interface BookmarkData {
  id: number;
  code: string;
  description: string;
  userId: string;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userBookmarks = await BookmarkService.getUserBookmarks(user.id);
      setBookmarks(userBookmarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createBookmark = useCallback(async (session: Session) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newBookmark = await BookmarkService.createBookmark({
        code: session.id,
        description: `${session.title} - ${session.time}`,
        userId: user.id,
      });
      
      setBookmarks(prev => [...prev, newBookmark]);
      return newBookmark;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bookmark';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteBookmark = useCallback(async (bookmarkId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await BookmarkService.deleteBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bookmark';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const isSessionBookmarked = useCallback((sessionId: string) => {
    return bookmarks.some(bookmark => bookmark.code === sessionId);
  }, [bookmarks]);

  const getBookmarkBySessionId = useCallback((sessionId: string) => {
    return bookmarks.find(bookmark => bookmark.code === sessionId);
  }, [bookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    createBookmark,
    deleteBookmark,
    isSessionBookmarked,
    getBookmarkBySessionId,
    refetch: fetchBookmarks,
  };
};