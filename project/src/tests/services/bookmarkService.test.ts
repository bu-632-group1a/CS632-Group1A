import { BookmarkService } from '../../services/bookmarkService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    DEV: false, // Test as production environment
  },
  writable: true,
});

describe('BookmarkService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('createBookmark', () => {
    it('should create a bookmark successfully', async () => {
      const mockBookmark = {
        id: 1,
        code: 'session-1',
        description: 'Test Session - 10:00 AM',
        userId: 'user-1'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookmark,
      });

      const result = await BookmarkService.createBookmark({
        code: 'session-1',
        description: 'Test Session - 10:00 AM',
        userId: 'user-1'
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://cs632-session-manager.onrender.com/api/bookmarks',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: 'session-1',
            description: 'Test Session - 10:00 AM',
            userId: 'user-1'
          }),
        }
      );

      expect(result).toEqual(mockBookmark);
    });

    it('should throw error when request fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        BookmarkService.createBookmark({
          code: 'session-1',
          description: 'Test Session',
          userId: 'user-1'
        })
      ).rejects.toThrow('HTTP error! status: 400');
    });
  });

  describe('getAllBookmarks', () => {
    it('should fetch all bookmarks successfully', async () => {
      const mockBookmarks = [
        { id: 1, code: 'session-1', description: 'Session 1', userId: 'user-1' },
        { id: 2, code: 'session-2', description: 'Session 2', userId: 'user-2' },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookmarks,
      });

      const result = await BookmarkService.getAllBookmarks();

      expect(fetch).toHaveBeenCalledWith(
        'https://cs632-session-manager.onrender.com/api/bookmarks',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockBookmarks);
    });
  });

  describe('deleteBookmark', () => {
    it('should delete bookmark successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await BookmarkService.deleteBookmark(1);

      expect(fetch).toHaveBeenCalledWith(
        'https://cs632-session-manager.onrender.com/api/bookmarks/1',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('getUserBookmarks', () => {
    it('should filter bookmarks by user ID', async () => {
      const mockBookmarks = [
        { id: 1, code: 'session-1', description: 'Session 1', userId: 'user-1' },
        { id: 2, code: 'session-2', description: 'Session 2', userId: 'user-2' },
        { id: 3, code: 'session-3', description: 'Session 3', userId: 'user-1' },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookmarks,
      });

      const result = await BookmarkService.getUserBookmarks('user-1');

      expect(result).toEqual([
        { id: 1, code: 'session-1', description: 'Session 1', userId: 'user-1' },
        { id: 3, code: 'session-3', description: 'Session 3', userId: 'user-1' },
      ]);
    });
  });
});