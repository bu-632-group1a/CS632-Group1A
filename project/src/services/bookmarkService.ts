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

export class BookmarkService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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
}