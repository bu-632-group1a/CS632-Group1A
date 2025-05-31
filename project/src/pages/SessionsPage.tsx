import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, MapPin, Users, Plus, X, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const SessionsPage: React.FC = () => {
  const { sessions, addSessionToAgenda, removeSessionFromAgenda, isSessionInAgenda } = useEvent();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique tags from all sessions
  const allTags = Array.from(
    new Set(sessions.flatMap(session => session.tags))
  ).sort();

  // Filter sessions based on search term and selected tags
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.speakerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => session.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = new Date(session.startTime).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, typeof sessions>);

  // Format date for display
  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="md:flex md:items-center md:justify-between"
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
            <Calendar className="h-8 w-8 mr-2 text-primary-600" />
            Conference Sessions
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Browse and manage your conference schedule
          </p>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {selectedTags.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {selectedTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Tags filter */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Filter by tags:</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="ml-1 h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Session list */}
      <div className="mt-8">
        {Object.entries(groupedSessions).map(([date, sessions]) => (
          <div key={date} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {new Date(date).toLocaleDateString(undefined, { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            <div className="space-y-4">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white shadow-sm rounded-lg border border-gray-200 p-6"
                >
                  <div className="sm:flex sm:items-start sm:justify-between">
                    <div className="sm:flex-1">
                      <Link
                        to={`/sessions/${session.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary-600"
                      >
                        {session.title}
                      </Link>
                      <div className="mt-2 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{session.location}</span>
                          </div>
                          {session.currentAttendees !== undefined && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>
                                {session.currentAttendees}
                                {session.maxAttendees && ` / ${session.maxAttendees}`} attending
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="mt-2">{session.description}</p>
                        <p className="mt-2 font-medium">Speaker: {session.speakerName}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {session.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {isAuthenticated && (
                      <div className="mt-4 sm:mt-0 sm:ml-6">
                        {isSessionInAgenda(session.id) ? (
                          <button
                            onClick={() => removeSessionFromAgenda(session.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <X className="h-5 w-5 mr-2" />
                            Remove from Agenda
                          </button>
                        ) : (
                          <button
                            onClick={() => addSessionToAgenda(session.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Add to Agenda
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find more sessions.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;