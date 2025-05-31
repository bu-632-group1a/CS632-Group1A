import React, { useState } from 'react';
import { useEvent } from '../contexts/EventContext';
import { Calendar, Clock, MapPin, Users, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const AgendaPage: React.FC = () => {
  const { userAgenda, sessions, removeSessionFromAgenda, isCheckedInToSession } = useEvent();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Sort sessions by start time
  const sortedAgenda = [...userAgenda].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Filter sessions based on current time
  const now = new Date();
  const filteredAgenda = sortedAgenda.filter(session => {
    const sessionStart = new Date(session.startTime);
    if (filter === 'upcoming') {
      return sessionStart > now;
    } else if (filter === 'past') {
      return sessionStart <= now;
    }
    return true;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Group sessions by date
  const groupedSessions = filteredAgenda.reduce((groups, session) => {
    const date = new Date(session.startTime).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, typeof userAgenda>);

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
            My Agenda
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Manage your personalized conference schedule
          </p>
        </div>
      </motion.div>

      <div className="mt-4 sm:mt-8">
        {/* Filter tabs */}
        <div className="sm:hidden">
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All Sessions</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {['all', 'upcoming', 'past'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as typeof filter)}
                className={`${
                  filter === tab
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Session list */}
        <div className="mt-6">
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.title}
                        </h3>
                        <div className="mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{formatDate(session.startTime)}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{session.location}</span>
                            </div>
                            {session.currentAttendees !== undefined && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{session.currentAttendees} attending</span>
                              </div>
                            )}
                          </div>
                          <p className="mt-2">{session.description}</p>
                          <p className="mt-2 font-medium">
                            Speaker: {session.speakerName}
                          </p>
                        </div>
                        {isCheckedInToSession(session.id) && (
                          <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Checked In
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeSessionFromAgenda(session.id)}
                        className="ml-4 text-gray-400 hover:text-red-500"
                        title="Remove from agenda"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {filteredAgenda.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all'
                  ? "You haven't added any sessions to your agenda yet."
                  : filter === 'upcoming'
                  ? "You don't have any upcoming sessions."
                  : "You don't have any past sessions."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = '/sessions'}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Browse Sessions
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;