import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import SessionCard from '../components/sessions/SessionCard';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';

const BookmarksPage: React.FC = () => {
  const { sessions } = useApp();
  const { isAuthenticated } = useAuth();
  const { bookmarks, loading } = useBookmarks();
  
  // Get bookmarked sessions based on current bookmark state
  const bookmarkedSessions = React.useMemo(() => {
    if (!bookmarks.length || !sessions.length) return [];
    
    const bookmarkedSessionIds = new Set(bookmarks.map(bookmark => bookmark.code));
    return sessions.filter(session => bookmarkedSessionIds.has(session.id));
  }, [sessions, bookmarks]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!isAuthenticated) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Bookmark size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view bookmarks</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          You need to be signed in to bookmark sessions and view your saved content.
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Bookmarked Sessions</h1>
          <p className="text-gray-600">Loading your bookmarks...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-soft h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Bookmarked Sessions</h1>
        <p className="text-gray-600">
          {bookmarkedSessions.length > 0
            ? `You have ${bookmarkedSessions.length} bookmarked session${bookmarkedSessions.length > 1 ? 's' : ''}`
            : 'You haven\'t bookmarked any sessions yet'}
        </p>
      </motion.div>
      
      {bookmarkedSessions.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={bookmarkedSessions.length} // Force re-render when count changes
        >
          {bookmarkedSessions.map((session) => (
            <motion.div key={session.id} variants={itemVariants}>
              <SessionCard session={session} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="text-center py-12 bg-white rounded-xl shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Bookmark size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No bookmarks yet</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Bookmark sessions you're interested in to quickly access them later.
          </p>
          <a href="/sessions" className="text-primary-600 hover:text-primary-800 font-medium">
            Browse sessions
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default BookmarksPage;