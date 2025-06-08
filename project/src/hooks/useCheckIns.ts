import { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckInService } from '../services/checkinService';
import { useAuth } from '../context/AuthContext';
import { Session } from '../types';

interface CheckInData {
  id: number;
  code: string;
  description: string;
  userId: string;
}

// Global state for real-time updates across components
let globalCheckIns: CheckInData[] = [];
let globalListeners: Set<() => void> = new Set();

// Cache for all check-ins to avoid repeated API calls
let checkInsCache: CheckInData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Notify all components about check-in changes
const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

// Update global state and notify listeners
const updateGlobalCheckIns = (newCheckIns: CheckInData[]) => {
  globalCheckIns = newCheckIns;
  checkInsCache = newCheckIns;
  cacheTimestamp = Date.now();
  notifyListeners();
};

export const useCheckIns = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render when global state changes
  const triggerUpdate = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);

  // Subscribe to global check-in changes
  useEffect(() => {
    globalListeners.add(triggerUpdate);
    return () => {
      globalListeners.delete(triggerUpdate);
    };
  }, [triggerUpdate]);

  // Memoized user check-ins to avoid recalculation
  const userCheckIns = useMemo(() => {
    if (!user) return [];
    const currentCheckIns = checkInsCache || globalCheckIns;
    return currentCheckIns.filter(checkIn => checkIn.userId === user.id);
  }, [user, forceUpdate, checkInsCache]);

  // Memoized lookup map for O(1) check-in checks
  const checkInLookup = useMemo(() => {
    const lookup = new Map<string, CheckInData>();
    userCheckIns.forEach(checkIn => {
      lookup.set(checkIn.code, checkIn);
    });
    return lookup;
  }, [userCheckIns]);

  const fetchCheckIns = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    const now = Date.now();
    const isCacheValid = checkInsCache && (now - cacheTimestamp) < CACHE_DURATION;
    
    // Use cache if valid and not forcing refresh
    if (isCacheValid && !forceRefresh) {
      setCheckIns(userCheckIns);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all check-ins once and cache them
      const allCheckIns = await CheckInService.getAllCheckIns();
      updateGlobalCheckIns(allCheckIns);
      
      // Filter for current user
      const filteredCheckIns = allCheckIns.filter(checkIn => checkIn.userId === user.id);
      setCheckIns(filteredCheckIns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch check-ins');
    } finally {
      setLoading(false);
    }
  }, [user, userCheckIns]);

  const createCheckIn = useCallback(async (session: Session) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newCheckIn = await CheckInService.createCheckIn({
        code: session.id,
        description: `${session.title} - ${session.time}`,
        userId: user.id,
      });
      
      // Update global state immediately for instant UI feedback
      const updatedCheckIns = [...(checkInsCache || globalCheckIns), newCheckIn];
      updateGlobalCheckIns(updatedCheckIns);
      
      // Update local state
      setCheckIns(prev => [...prev, newCheckIn]);
      return newCheckIn;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteCheckIn = useCallback(async (checkInId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await CheckInService.deleteCheckIn(checkInId);
      
      // Update global state immediately for instant UI feedback
      const updatedCheckIns = (checkInsCache || globalCheckIns).filter(
        checkIn => checkIn.id !== checkInId
      );
      updateGlobalCheckIns(updatedCheckIns);
      
      // Update local state
      setCheckIns(prev => prev.filter(checkIn => checkIn.id !== checkInId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove check-in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // O(1) lookup instead of O(n) array search
  const isSessionCheckedIn = useCallback((sessionId: string) => {
    return checkInLookup.has(sessionId);
  }, [checkInLookup]);

  // O(1) lookup instead of O(n) array search
  const getCheckInBySessionId = useCallback((sessionId: string) => {
    return checkInLookup.get(sessionId);
  }, [checkInLookup]);

  // Clear cache when user changes
  useEffect(() => {
    if (!user) {
      checkInsCache = null;
      cacheTimestamp = 0;
      globalCheckIns = [];
      setCheckIns([]);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  // Update local check-ins when global state changes
  useEffect(() => {
    setCheckIns(userCheckIns);
  }, [userCheckIns]);

  return {
    checkIns: userCheckIns,
    loading,
    error,
    createCheckIn,
    deleteCheckIn,
    isSessionCheckedIn,
    getCheckInBySessionId,
    refetch: () => fetchCheckIns(true),
  };
};

// Export function to clear cache when needed
export const clearCheckInsCache = () => {
  checkInsCache = null;
  cacheTimestamp = 0;
  globalCheckIns = [];
  notifyListeners();
};