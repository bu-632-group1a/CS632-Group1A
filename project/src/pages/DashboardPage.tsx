import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvent } from '../contexts/EventContext';
import { useSustainability } from '../contexts/SustainabilityContext';
import { Calendar, Clock, MapPin, Leaf, Users, Award, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { userAgenda, sessions, checkedInSessions } = useEvent();
  const { userScore, impactData, userActions } = useSustainability();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Get upcoming sessions from user's agenda
  const upcomingAgendaSessions = userAgenda
    .filter(session => new Date(session.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Calculate completion percentage for bingo
  const bingoCompletionPercentage = user?.completedBingoSquares 
    ? (user.completedBingoSquares.length / 25) * 100 
    : 0;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        className="md:flex md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {greeting}, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to EcoPulse. Here's your conference overview.
          </p>
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sustainability Impact */}
        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Leaf className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Your Sustainability Score</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{userScore} points</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span className="sr-only">Increased by</span>
                      {userActions.length > 0 && `+${userActions[userActions.length - 1].points} from last action`}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Paper Saved</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{impactData.paperSaved} sheets</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Plastic Avoided</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{impactData.plasticAvoided} items</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">CO₂ Reduced</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{impactData.co2Reduced.toFixed(1)} kg</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Water Saved</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{impactData.waterSaved} L</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/sustainability" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                Log sustainability actions
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* My Agenda */}
        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600" />
              My Agenda
            </h3>
            <div className="mt-4 space-y-4">
              {upcomingAgendaSessions.length > 0 ? (
                upcomingAgendaSessions.map((session) => (
                  <div key={session.id} className="border-l-4 border-primary-400 pl-4 py-2">
                    <Link to={`/sessions/${session.id}`} className="block hover:text-primary-600">
                      <p className="text-sm font-medium text-gray-900">{session.title}</p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="mr-2">{formatDate(session.startTime)} - {formatDate(session.endTime)}</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{session.location}</span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming sessions in your agenda.</p>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/agenda" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                View full agenda
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Bingo Progress */}
        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary-600" />
              Bingo Challenge
            </h3>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-100">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primary-600">
                      {Math.round(bingoCompletionPercentage)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-100">
                  <div 
                    style={{ width: `${bingoCompletionPercentage}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                  ></div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  You've completed {user?.completedBingoSquares?.length || 0} out of 25 bingo squares.
                </p>
                {user?.completedBingoSquares && user.completedBingoSquares.length >= 5 && (
                  <div className="mt-2 p-2 bg-accent-100 rounded-md">
                    <p className="text-sm font-medium text-accent-800">
                      You've completed a row! Claim your prize at the info desk.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/bingo" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                Play Bingo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Sessions & Stats */}
        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2"
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              Conference Stats
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-gray-50 overflow-hidden shadow rounded-md px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{sessions.length}</dd>
              </div>
              <div className="bg-gray-50 overflow-hidden shadow rounded-md px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">In Your Agenda</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{userAgenda.length}</dd>
              </div>
              <div className="bg-gray-50 overflow-hidden shadow rounded-md px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Attended</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{checkedInSessions.length}</dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/sessions" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                View all sessions
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="bg-white overflow-hidden shadow rounded-lg"
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Link
                to="/scanner"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Scan QR Code
              </Link>
              <Link
                to="/sustainability"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Leaf className="h-5 w-5 mr-2" />
                Log Action
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
              >
                <Award className="h-5 w-5 mr-2" />
                Leaderboard
              </Link>
              <Link
                to="/sessions"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Browse Sessions
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;