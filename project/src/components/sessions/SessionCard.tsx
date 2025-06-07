import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, User, Bookmark, BookmarkCheck, AlertTriangle } from 'lucide-react';
import Card, { CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Session } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useBookmarks } from '../../hooks/useBookmarks';
import { ScheduleValidator } from '../../utils/scheduleValidation';

interface SessionCardProps {
  session: Session;
}

const SessionCard: React.FC<SessionCardProps> = memo(({ session }) => {
  const { sessions } = useApp();
  const { isAuthenticated } = useAuth();
  const { 
    isSessionBookmarked, 
    createBookmark, 
    deleteBookmark, 
    getBookmarkBySessionId,
    bookmarks,
    loading 
  } = useBookmarks();
  
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflictingSessions, setConflictingSessions] = useState<Session[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize bookmark status to avoid recalculation
  const bookmarked = React.useMemo(() => 
    isSessionBookmarked(session.id), 
    [isSessionBookmarked, session.id]
  );

  const handleBookmarkToggle = React.useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      return;
    }

    setIsProcessing(true);

    try {
      if (bookmarked) {
        // Remove bookmark
        const bookmark = getBookmarkBySessionId(session.id);
        if (bookmark) {
          await deleteBookmark(bookmark.id);
        }
        setShowConflictWarning(false);
      } else {
        // Check for conflicts before adding bookmark
        const bookmarkedSessionIds = bookmarks.map(b => b.code);
        const bookmarkedSessions = sessions.filter(s => bookmarkedSessionIds.includes(s.id));
        
        const validation = ScheduleValidator.validateScheduleConflict(session, bookmarkedSessions);
        
        if (validation.hasConflict) {
          setConflictingSessions(validation.conflictingSessions);
          setShowConflictWarning(true);
          setIsProcessing(false);
          return;
        }

        // No conflicts, proceed with bookmark
        await createBookmark(session);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    isAuthenticated, 
    bookmarked, 
    session, 
    getBookmarkBySessionId, 
    deleteBookmark, 
    bookmarks, 
    sessions, 
    createBookmark
  ]);

  const handleForceBookmark = React.useCallback(async () => {
    setIsProcessing(true);
    try {
      await createBookmark(session);
      setShowConflictWarning(false);
    } catch (error) {
      console.error('Error force booking session:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [createBookmark, session]);

  const getCategoryColor = React.useCallback((category: string): string => {
    const categories: Record<string, string> = {
      'Energy': 'primary',
      'Urban': 'secondary',
      'Lifestyle': 'success',
      'Business': 'info',
      'Food': 'warning',
      'Technology': 'danger',
      'Opening': 'primary',
      'Keynote': 'primary',
      'Panel': 'secondary',
      'Break': 'warning',
      'Presentation': 'info',
      'Workshop': 'success',
      'Networking': 'secondary',
      'Closing': 'primary'
    };
    
    return categories[category] || 'default';
  }, []);

  return (
    <>
      <Card interactive className="h-full">
        <div className="relative">
          <img 
            src={session.imageUrl || 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg'} 
            alt={session.title} 
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          {isAuthenticated && (
            <motion.button
              className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md disabled:opacity-50"
              onClick={handleBookmarkToggle}
              disabled={loading || isProcessing}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              ) : bookmarked ? (
                <BookmarkCheck size={20} className="text-primary-600" />
              ) : (
                <Bookmark size={20} className="text-gray-500" />
              )}
            </motion.button>
          )}
          <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent">
            <Badge 
              variant={getCategoryColor(session.category) as any} 
              size="md"
              animated
            >
              {session.category}
            </Badge>
          </div>
        </div>
        
        <CardContent>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{session.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {session.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <User size={16} className="mr-2 text-primary-600" />
              <span>{session.speaker}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-2 text-primary-600" />
              <span>{session.time}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={16} className="mr-2 text-primary-600" />
              <span>{session.location}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50">
          <motion.button
            className="w-full py-2 text-center text-primary-600 font-medium hover:text-primary-800 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Details
          </motion.button>
        </CardFooter>
      </Card>

      {/* Conflict Warning Modal */}
      <AnimatePresence>
        {showConflictWarning && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConflictWarning(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <AlertTriangle size={24} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Schedule Conflict</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                {ScheduleValidator.formatConflictMessage(conflictingSessions)}
              </p>
              
              {conflictingSessions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Conflicting sessions:</h4>
                  <ul className="space-y-1">
                    {conflictingSessions.map((conflictSession) => (
                      <li key={conflictSession.id} className="text-sm text-gray-600">
                        • {conflictSession.title} ({conflictSession.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-6">
                Would you like to bookmark this session anyway?
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConflictWarning(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleForceBookmark}
                  isLoading={isProcessing}
                  className="flex-1"
                >
                  Bookmark Anyway
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

SessionCard.displayName = 'SessionCard';

export default SessionCard;