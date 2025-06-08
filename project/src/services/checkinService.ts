interface CheckInRequest {
  code: string;
  description: string;
  userId: string;
}

interface CheckInResponse {
  id: number;
  code: string;
  description: string;
  userId: string;
}

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : 'https://cs632-session-manager.onrender.com/api';

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

// Request queue to batch multiple requests
interface QueuedRequest {
  endpoint: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private readonly batchDelay = 50; // 50ms delay to batch requests

  async add<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ endpoint, options, resolve, reject });
      this.scheduleProcess();
    });
  }

  private scheduleProcess() {
    if (this.processing) return;
    
    this.processing = true;
    setTimeout(() => {
      this.processQueue();
    }, this.batchDelay);
  }

  private async processQueue() {
    const requests = [...this.queue];
    this.queue = [];
    this.processing = false;

    // Process requests in parallel for better performance
    await Promise.allSettled(
      requests.map(async ({ endpoint, options, resolve, reject }) => {
        try {
          const result = await this.makeDirectRequest(endpoint, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
    );
  }

  private async makeDirectRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // Add Authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to perform this action.');
        } else if (response.status === 404) {
          throw new Error('Resource not found.');
        } else if (response.status === 409) {
          throw new Error('Check-in already exists for this session.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Handle empty responses (like DELETE operations)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        return {} as T; // Return empty object for non-JSON responses
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
}

const requestQueue = new RequestQueue();

export class CheckInService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return requestQueue.add<T>(endpoint, options);
  }

  static async createCheckIn(checkIn: CheckInRequest): Promise<CheckInResponse> {
    try {
      return await this.makeRequest<CheckInResponse>('/checkins', {
        method: 'POST',
        body: JSON.stringify(checkIn),
      });
    } catch (error) {
      console.error('Failed to create check-in:', error);
      throw error;
    }
  }

  static async getAllCheckIns(): Promise<CheckInResponse[]> {
    try {
      return await this.makeRequest<CheckInResponse[]>('/checkins');
    } catch (error) {
      console.error('Failed to fetch check-ins:', error);
      throw error;
    }
  }

  static async updateCheckIn(id: number, checkIn: Partial<CheckInRequest>): Promise<CheckInResponse> {
    try {
      return await this.makeRequest<CheckInResponse>(`/checkins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(checkIn),
      });
    } catch (error) {
      console.error(`Failed to update check-in ${id}:`, error);
      throw error;
    }
  }

  static async deleteCheckIn(id: number): Promise<void> {
    try {
      await this.makeRequest<void>(`/checkins/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete check-in ${id}:`, error);
      throw error;
    }
  }

  static async getUserCheckIns(userId: string): Promise<CheckInResponse[]> {
    try {
      // Since the API now requires authentication, we can fetch all check-ins
      // and the server should filter them based on the authenticated user
      const allCheckIns = await this.getAllCheckIns();
      return allCheckIns.filter(checkIn => checkIn.userId === userId);
    } catch (error) {
      console.error(`Failed to fetch check-ins for user ${userId}:`, error);
      throw error;
    }
  }

  // Check if user is checked in to a specific session
  static async isCheckedIn(sessionId: string, userId: string): Promise<boolean> {
    try {
      const userCheckIns = await this.getUserCheckIns(userId);
      return userCheckIns.some(checkIn => checkIn.code === sessionId);
    } catch (error) {
      console.error('Failed to check check-in status:', error);
      return false;
    }
  }

  // Get check-in by session ID
  static async getCheckInBySessionId(sessionId: string, userId: string): Promise<CheckInResponse | null> {
    try {
      const userCheckIns = await this.getUserCheckIns(userId);
      return userCheckIns.find(checkIn => checkIn.code === sessionId) || null;
    } catch (error) {
      console.error('Failed to get check-in by session ID:', error);
      return null;
    }
  }

  // Health check method to verify API connectivity
  static async healthCheck(): Promise<boolean> {
    try {
      await this.getAllCheckIns();
      return true;
    } catch (error) {
      console.warn('Check-in service health check failed:', error);
      return false;
    }
  }
}