interface BookmarkRequest {
  code: string;
  description: string;
  userId: string;
}

interface BookmarkResponse {
  id: number;
  code: string;
  description: string;
  userId: string;
}

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : 'https://cs632-session-manager.onrender.com/api';

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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

const requestQueue = new RequestQueue();

export class BookmarkService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return requestQueue.add<T>(endpoint, options);
  }

  static async createBookmark(bookmark: BookmarkRequest): Promise<BookmarkResponse> {
    return this.makeRequest<BookmarkResponse>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(bookmark),
    });
  }

  static async getAllBookmarks(): Promise<BookmarkResponse[]> {
    return this.makeRequest<BookmarkResponse[]>('/bookmarks');
  }

  static async getBookmark(id: number): Promise<BookmarkResponse> {
    return this.makeRequest<BookmarkResponse>(`/bookmarks/${id}`);
  }

  static async deleteBookmark(id: number): Promise<void> {
    await this.makeRequest<void>(`/bookmarks/${id}`, {
      method: 'DELETE',
    });
  }

  static async getUserBookmarks(userId: string): Promise<BookmarkResponse[]> {
    const allBookmarks = await this.getAllBookmarks();
    return allBookmarks.filter(bookmark => bookmark.userId === userId);
  }

  // Batch operations for better performance
  static async createMultipleBookmarks(bookmarks: BookmarkRequest[]): Promise<BookmarkResponse[]> {
    const promises = bookmarks.map(bookmark => this.createBookmark(bookmark));
    return Promise.all(promises);
  }

  static async deleteMultipleBookmarks(ids: number[]): Promise<void> {
    const promises = ids.map(id => this.deleteBookmark(id));
    await Promise.all(promises);
  }
}