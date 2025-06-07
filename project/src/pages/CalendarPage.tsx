import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Home, AlertCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { ScheduleValidator } from '../utils/scheduleValidation';

const CalendarPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { sessions } = useApp();
  const { bookmarks, loading, error } = useBookmarks();
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const bookmarkedSessions = useMemo(() => {
    const bookmarkedSessionIds = bookmarks.map(bookmark => bookmark.code);
    return sessions.filter(session => bookmarkedSessionIds.includes(session.id));
  }, [sessions, bookmarks]);

  const sessionsByDay = useMemo(() => {
    const grouped = bookmarkedSessions.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = [];
      }
      acc[session.date].push(session);
      return acc;
    }, {} as Record<string, typeof bookmarkedSessions>);

    // Sort sessions within each day by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.time.split(' - ')[0];
        const timeB = b.time.split(' - ')[0];
        return timeA.localeCompare(timeB);
      });
    });

    return grouped;
  }, [bookmarkedSessions]);

  const conflicts = useMemo(() => {
    const conflictMap = new Map<string, string[]>();
    
    bookmarkedSessions.forEach(session => {
      const otherSessions = bookmarkedSessions.filter(s => s.id !== session.id);
      const validation = ScheduleValidator.validateScheduleConflict(session, otherSessions);
      
      if (validation.hasConflict) {
        conflictMap.set(session.id, validation.conflictingSessions.map(s => s.id));
      }
    });
    
    return conflictMap;
  }, [bookmarkedSessions]);

  const availableDays = Object.keys(sessionsByDay).sort();
  const filteredSessions = selectedDay === 'all' 
    ? sessionsByDay 
    : { [selectedDay]: sessionsByDay[selectedDay] || [] };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your calendar</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          You need to be signed in to view your personalized conference calendar.
        </p>
        <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">
          Go to login
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">Failed to load your calendar. Please try again later.</p>
        </div>
      </div>
    );
  }

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

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex justify-between items-center"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Calendar</h1>
          <p className="text-gray-600">Your personalized conference agenda</p>
        </div>
        <Link to="/">
          <Button
            variant="ghost"
            icon={<Home size={20} />}
            className="text-gray-600 hover:text-gray-900"
          >
            Home
          </Button>
        </Link>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {bookmarkedSessions.length}
                </div>
                <div className="text-sm text-gray-600">Bookmarked Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-600">
                  {availableDays.length}
                </div>
                <div className="text-sm text-gray-600">Conference Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {conflicts.size}
                </div>
                <div className="text-sm text-gray-600">Schedule Conflicts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Day Filter */}
      {availableDays.length > 1 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Filter size={18} className="mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Day</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDay('all')}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${selectedDay === 'all' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  All Days
                </button>
                {availableDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${selectedDay === day 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {new Date(day).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Schedule Conflicts Warning */}
      {conflicts.size > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <AlertCircle size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Schedule Conflicts Detected</h3>
                  <p className="text-sm text-gray-600">
                    You have {conflicts.size} session{conflicts.size > 1 ? 's' : ''} with timing conflicts. 
                    Review your schedule and consider removing conflicting bookmarks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <motion.div variants={itemVariants} className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your calendar...</p>
        </motion.div>
      ) : bookmarkedSessions.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No sessions bookmarked</h3>
              <p className="text-gray-600 mb-6">
                Start building your conference agenda by bookmarking sessions you're interested in.
              </p>
              <Link to="/sessions">
                <Button variant="primary">Browse Sessions</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div className="space-y-6" variants={containerVariants}>
          {Object.entries(filteredSessions).map(([date, daySessions]) => (
            <motion.div key={date} variants={itemVariants}>
              <Card>
                <CardHeader className="bg-primary-50">
                  <div className="flex items-center">
                    <Calendar size={24} className="text-primary-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {daySessions.length} session{daySessions.length > 1 ? 's' : ''} scheduled
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {daySessions.map((session, index) => {
                      const hasConflict = conflicts.has(session.id);
                      
                      return (
                        <motion.div
                          key={session.id}
                          className={`
                            p-4 border-l-4 transition-colors
                            ${hasConflict 
                              ? 'border-l-amber-500 bg-amber-50' 
                              : 'border-l-primary-500 bg-white hover:bg-gray-50'}
                            ${index < daySessions.length - 1 ? 'border-b border-gray-100' : ''}
                          `}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-gray-900">{session.title}</h3>
                                {hasConflict && (
                                  <Badge variant="warning" size="sm">
                                    Conflict
                                  </Badge>
                                )}
                                <Badge variant="primary" size="sm">
                                  {session.category}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {session.description}
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-2 text-primary-600" />
                                  <span>{session.time}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin size={14} className="mr-2 text-primary-600" />
                                  <span>{session.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <User size={14} className="mr-2 text-primary-600" />
                                  <span>{session.speaker}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CalendarPage;