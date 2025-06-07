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

// Cache for all bookmarks to avoid repeated API calls
let bookmarksCache: BookmarkData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized user bookmarks to avoid recalculation
  const userBookmarks = useMemo(() => {
    if (!user || !bookmarksCache) return [];
    return bookmarksCache.filter(bookmark => bookmark.userId === user.id);
  }, [user, bookmarksCache]);

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
      bookmarksCache = allBookmarks;
      cacheTimestamp = now;
      
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
      
      // Update cache immediately for instant UI feedback
      if (bookmarksCache) {
        bookmarksCache.push(newBookmark);
      }
      
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
      
      // Update cache immediately for instant UI feedback
      if (bookmarksCache) {
        bookmarksCache = bookmarksCache.filter(bookmark => bookmark.id !== bookmarkId);
      }
      
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
      setBookmarks([]);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

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
};