import React, { useState } from 'react';
import { Trophy, Medal, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
}

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'score'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mock leaderboard data - in a real app, this would come from an API
  const mockLeaderboard: LeaderboardEntry[] = [
    { userId: 'user1', userName: 'Emma Thompson', score: 2150, rank: 1 },
    { userId: 'user2', userName: 'Daniel Kim', score: 1890, rank: 2 },
    { userId: 'user3', userName: 'Sophia Martinez', score: 1760, rank: 3 },
    { userId: 'user4', userName: 'Noah Johnson', score: 1550, rank: 4 },
    { userId: 'user5', userName: 'Olivia Williams', score: 1420, rank: 5 },
    { userId: 'user6', userName: 'Liam Brown', score: 1320, rank: 6 },
    { userId: 'user7', userName: 'Ava Davis', score: 1180, rank: 7 },
    { userId: 'user8', userName: 'William Miller', score: 980, rank: 8 },
    { userId: 'user9', userName: 'Isabella Wilson', score: 850, rank: 9 },
    { userId: 'user10', userName: 'James Anderson', score: 720, rank: 10 },
  ];

  // Sort leaderboard data
  const sortedLeaderboard = [...mockLeaderboard].sort((a, b) => {
    if (sortBy === 'rank') {
      return sortDirection === 'asc' ? a.rank - b.rank : b.rank - a.rank;
    } else if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.userName.localeCompare(b.userName)
        : b.userName.localeCompare(a.userName);
    } else {
      return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
    }
  });

  // Find current user's rank
  const userRank = mockLeaderboard.find(entry => entry.userId === user?.id)?.rank || '-';

  const handleSort = (column: 'rank' | 'name' | 'score') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: 'rank' | 'name' | 'score' }) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
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
            <Trophy className="h-8 w-8 mr-2 text-primary-600" />
            Sustainability Leaderboard
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            See how you rank among other conference attendees
          </p>
        </div>
      </motion.div>

      {/* User's Current Rank */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 bg-white rounded-lg shadow p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <Medal className="h-5 w-5 mr-2 text-primary-600" />
          Your Current Rank
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-primary-50 rounded-lg p-5">
            <div className="text-sm text-primary-600 font-medium">Rank</div>
            <div className="mt-1 text-3xl font-semibold text-primary-900">#{userRank}</div>
          </div>
          <div className="bg-primary-50 rounded-lg p-5">
            <div className="text-sm text-primary-600 font-medium">Score</div>
            <div className="mt-1 text-3xl font-semibold text-primary-900">
              {user?.sustainabilityScore || 0}
            </div>
          </div>
          <div className="bg-primary-50 rounded-lg p-5">
            <div className="text-sm text-primary-600 font-medium">Total Participants</div>
            <div className="mt-1 text-3xl font-semibold text-primary-900">
              {mockLeaderboard.length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Timeframe Filter */}
      <div className="mt-8 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            Top Performers
          </h2>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-4">
            {(['all', 'week', 'month'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setTimeframe(option)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  timeframe === option
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option === 'all' ? 'All Time' : option === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-4 bg-white rounded-lg shadow overflow-hidden"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center">
                  Rank
                  <SortIcon column="rank" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <SortIcon column="name" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center">
                  Score
                  <SortIcon column="score" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLeaderboard.map((entry, index) => (
              <motion.tr
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={entry.userId === user?.id ? 'bg-primary-50' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {entry.rank <= 3 ? (
                      <Trophy
                        className={`h-5 w-5 mr-2 ${
                          entry.rank === 1
                            ? 'text-yellow-400'
                            : entry.rank === 2
                            ? 'text-gray-400'
                            : 'text-amber-600'
                        }`}
                      />
                    ) : (
                      <span className="w-7">{entry.rank}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.userName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.score} points</div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Legend */}
      <div className="mt-4 text-sm text-gray-500">
        <p>* Rankings are updated in real-time as participants log sustainability actions</p>
      </div>
    </div>
  );
};

export default LeaderboardPage;