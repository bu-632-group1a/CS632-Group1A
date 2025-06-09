import { mockSessions } from '../data/mockData'; // Add this import at the top if not present
interface AdminBookmark {
  id: number;
  code: string;
  description: string;
  userId: string;
}

interface AdminCheckIn {
  id: number;
  code: string;
  description: string;
  userId: string;
}

interface AdminSession {
  id: number;
  userId: string;
  name: string;
}

interface UserAnalytics {
  userId: string;
  fullName?: string;
  bookmarksCount: number;
  checkInsCount: number;
  bookmarkedSessions: AdminBookmark[];
  attendedSessions: AdminCheckIn[];
  engagementRate: number; // checkIns / bookmarks
}

interface DashboardStats {
  totalBookmarks: number;
  totalCheckIns: number;
  totalSessions: number;
  totalUsers: number;
  averageBookmarksPerUser: number;
  averageCheckInsPerUser: number;
  overallEngagementRate: number;
  topSessions: Array<{
    sessionCode: string;
    sessionName: string;
    bookmarksCount: number;
    checkInsCount: number;
  }>;
}

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : 'https://cs632-session-manager.onrender.com/api';

const SESSIONS_BASE_URL = import.meta.env.DEV 
  ? '/sessions' 
  : 'https://cs632-session-manager.onrender.com/sessions';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const authState = localStorage.getItem('auth_state');
    if (!authState) return null;
    
    const parsed = JSON.parse(authState);
    return parsed.accessToken || null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

class AdminServiceClass {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        headers,
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        return {} as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
        throw error;
      }
      
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // Update these methods to use the new admin endpoints
  async getAllBookmarks(): Promise<AdminBookmark[]> {
    try {
      // Use the admin endpoint for all bookmarks
      return await this.makeRequest<AdminBookmark[]>(`${API_BASE_URL}/bookmarks/admin`);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      throw error;
    }
  }

  async getAllCheckIns(): Promise<AdminCheckIn[]> {
    try {
      // Use the admin endpoint for all check-ins
      return await this.makeRequest<AdminCheckIn[]>(`${API_BASE_URL}/checkins/admin`);
    } catch (error) {
      console.error('Failed to fetch check-ins:', error);
      throw error;
    }
  }

async getAllSessions(): Promise<AdminSession[]> {
  // Return mock session data instead of making an API call
  return Promise.resolve(mockSessions);
}

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [bookmarks, checkIns, sessions] = await Promise.all([
        this.getAllBookmarks(),
        this.getAllCheckIns(),
        this.getAllSessions()
      ]);

      // Get unique users
      const allUserIds = new Set([
        ...bookmarks.map(b => b.userId),
        ...checkIns.map(c => c.userId)
      ]);

      // Calculate session popularity
      const sessionStats = new Map<string, { name: string; bookmarks: number; checkIns: number }>();
      
      // Initialize with session names
      sessions.forEach(session => {
        sessionStats.set(session.id.toString(), {
          name: session.name,
          bookmarks: 0,
          checkIns: 0
        });
      });

      // Count bookmarks per session
      bookmarks.forEach(bookmark => {
        const stats = sessionStats.get(bookmark.code);
        if (stats) {
          stats.bookmarks++;
        }
      });

      // Count check-ins per session
      checkIns.forEach(checkIn => {
        const stats = sessionStats.get(checkIn.code);
        if (stats) {
          stats.checkIns++;
        }
      });

      // Get top sessions
      const topSessions = Array.from(sessionStats.entries())
        .map(([code, stats]) => ({
          sessionCode: code,
          sessionName: stats.name,
          bookmarksCount: stats.bookmarks,
          checkInsCount: stats.checkIns
        }))
        .sort((a, b) => (b.bookmarksCount + b.checkInsCount) - (a.bookmarksCount + a.checkInsCount))
        .slice(0, 10);

      return {
        totalBookmarks: bookmarks.length,
        totalCheckIns: checkIns.length,
        totalSessions: sessions.length,
        totalUsers: allUserIds.size,
        averageBookmarksPerUser: allUserIds.size > 0 ? bookmarks.length / allUserIds.size : 0,
        averageCheckInsPerUser: allUserIds.size > 0 ? checkIns.length / allUserIds.size : 0,
        overallEngagementRate: bookmarks.length > 0 ? (checkIns.length / bookmarks.length) * 100 : 0,
        topSessions
      };
    } catch (error) {
      console.error('Failed to calculate dashboard stats:', error);
      throw error;
    }
  }

  async getUserAnalytics(userIdFilter?: string): Promise<UserAnalytics[]> {
    try {
      const [bookmarks, checkIns] = await Promise.all([
        this.getAllBookmarks(),
        this.getAllCheckIns()
      ]);

      // Group by user
      const userMap = new Map<string, UserAnalytics>();

      // Process bookmarks
      bookmarks.forEach(bookmark => {
        if (userIdFilter && bookmark.userId !== userIdFilter) return;
        
        if (!userMap.has(bookmark.userId)) {
          userMap.set(bookmark.userId, {
            userId: bookmark.userId,
            bookmarksCount: 0,
            checkInsCount: 0,
            bookmarkedSessions: [],
            attendedSessions: [],
            engagementRate: 0
          });
        }
        
        const user = userMap.get(bookmark.userId)!;
        user.bookmarksCount++;
        user.bookmarkedSessions.push(bookmark);
      });

      // Process check-ins
      checkIns.forEach(checkIn => {
        if (userIdFilter && checkIn.userId !== userIdFilter) return;
        
        if (!userMap.has(checkIn.userId)) {
          userMap.set(checkIn.userId, {
            userId: checkIn.userId,
            bookmarksCount: 0,
            checkInsCount: 0,
            bookmarkedSessions: [],
            attendedSessions: [],
            engagementRate: 0
          });
        }
        
        const user = userMap.get(checkIn.userId)!;
        user.checkInsCount++;
        user.attendedSessions.push(checkIn);
      });

      // Calculate engagement rates
      userMap.forEach(user => {
        user.engagementRate = user.bookmarksCount > 0 
          ? (user.checkInsCount / user.bookmarksCount) * 100 
          : 0;
      });

      return Array.from(userMap.values())
        .sort((a, b) => (b.bookmarksCount + b.checkInsCount) - (a.bookmarksCount + a.checkInsCount));
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await Promise.all([
        this.getAllBookmarks(),
        this.getAllCheckIns(),
        this.getAllSessions()
      ]);
      return true;
    } catch (error) {
      console.warn('Admin service health check failed:', error);
      return false;
    }
  }
}

export const AdminService = new AdminServiceClass();
export type { AdminBookmark, AdminCheckIn, AdminSession, UserAnalytics, DashboardStats };