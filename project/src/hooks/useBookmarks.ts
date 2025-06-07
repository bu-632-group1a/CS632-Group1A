import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookmarkService } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';
import { Session } from '../types';

interface BookmarkData {
  id: number;
  code: string;
  description: string;
  userId: string;
}

// Global state for real-time updates across components
let globalBookmarks: BookmarkData[] = [];
let globalListeners: Set<() => void> = new Set();

// Cache for all bookmarks to avoid repeated API calls
let bookmarksCache: BookmarkData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Notify all components about bookmark changes
const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

// Update global state and notify listeners
const updateGlobalBookmarks = (newBookmarks: BookmarkData[]) => {
  globalBookmarks = newBookmarks;
  bookmarksCache = newBookmarks;
  cacheTimestamp = Date.now();
  notifyListeners();
};

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render when global state changes
  const triggerUpdate = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);

  // Subscribe to global bookmark changes
  useEffect(() => {
    globalListeners.add(triggerUpdate);
    return () => {
      globalListeners.delete(triggerUpdate);
    };
  }, [triggerUpdate]);

  // Memoized user bookmarks to avoid recalculation
  const userBookmarks = useMemo(() => {
    if (!user) return [];
    const currentBookmarks = bookmarksCache || globalBookmarks;
    return currentBookmarks.filter(bookmark => bookmark.userId === user.id);
  }, [user, forceUpdate, bookmarksCache]);

  // Memoized lookup map for O(1) bookmark checks
  const bookmarkLookup = useMemo(() => {
    const lookup = new Map<string, BookmarkData>();
    userBookmarks.forEach(bookmark => {
      lookup.set(bookmark.code, bookmark);
    });
    return lookup;
  }, [userBookmarks]);

  const fetchBookmarks = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    const now = Date.now();
    const isCacheValid = bookmarksCache && (now - cacheTimestamp) < CACHE_DURATION;
    
    // Use cache if valid and not forcing refresh
    if (isCacheValid && !forceRefresh) {
      setBookmarks(userBookmarks);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all bookmarks once and cache them
      const allBookmarks = await BookmarkService.getAllBookmarks();
      updateGlobalBookmarks(allBookmarks);
      
      // Filter for current user
      const filteredBookmarks = allBookmarks.filter(bookmark => bookmark.userId === user.id);
      setBookmarks(filteredBookmarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }, [user, userBookmarks]);

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
      
      // Update global state immediately for instant UI feedback
      const updatedBookmarks = [...(bookmarksCache || globalBookmarks), newBookmark];
      updateGlobalBookmarks(updatedBookmarks);
      
      // Update local state
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
      
      // Update global state immediately for instant UI feedback
      const updatedBookmarks = (bookmarksCache || globalBookmarks).filter(
        bookmark => bookmark.id !== bookmarkId
      );
      updateGlobalBookmarks(updatedBookmarks);
      
      // Update local state
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bookmark';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // O(1) lookup instead of O(n) array search
  const isSessionBookmarked = useCallback((sessionId: string) => {
    return bookmarkLookup.has(sessionId);
  }, [bookmarkLookup]);

  // O(1) lookup instead of O(n) array search
  const getBookmarkBySessionId = useCallback((sessionId: string) => {
    return bookmarkLookup.get(sessionId);
  }, [bookmarkLookup]);

  // Clear cache when user changes
  useEffect(() => {
    if (!user) {
      bookmarksCache = null;
      cacheTimestamp = 0;
      globalBookmarks = [];
      setBookmarks([]);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Update local bookmarks when global state changes
  useEffect(() => {
    setBookmarks(userBookmarks);
  }, [userBookmarks]);

  return {
    bookmarks: userBookmarks,
    loading,
    error,
    createBookmark,
    deleteBookmark,
    isSessionBookmarked,
    getBookmarkBySessionId,
    refetch: () => fetchBookmarks(true),
  };
};

// Export function to clear cache when needed
export const clearBookmarksCache = () => {
  bookmarksCache = null;
  cacheTimestamp = 0;
  globalBookmarks = [];
  notifyListeners();
};