import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Medal, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import LeaderboardItem from '../components/leaderboard/LeaderboardItem';
import Button from '../components/ui/Button';
import { GET_LEADERBOARD, ME } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';

const LeaderboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: userData } = useQuery(ME, {
    skip: !isAuthenticated // Only execute query when user is authenticated
  });
  const currentUser = userData?.me;
  
  // Use the user ID from JWT token instead of name
  const userId = currentUser?.id || user?.id;
  
  const { data, loading, error } = useQuery(GET_LEADERBOARD, {
    variables: {
      userId: userId
    },
    pollInterval: 30000 // Poll every 30 seconds
  });

  const leaderboard = data?.leaderboard || [];
  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  // Enhanced leaderboard entries with display names
const enhancedLeaderboard = leaderboard;

  const enhancedTopThree = enhancedLeaderboard.slice(0, 3);
  const enhancedRestOfLeaderboard = enhancedLeaderboard.slice(3);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">Failed to load leaderboard data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sustainability Leaderboard</h1>
          <p className="text-gray-600">See who's making the biggest impact at the event</p>
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
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="bg-primary-100 p-2 rounded-full mr-4">
            <Trophy size={24} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Top Performers</h2>
            <p className="text-gray-600">The attendees with the highest sustainability scores</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {enhancedTopThree.map((entry, index) => {
            const rank = index + 1;
            const bgColor = rank === 1 ? 'bg-yellow-50' : rank === 2 ? 'bg-gray-50' : 'bg-amber-50';
            const borderColor = rank === 1 ? 'border-yellow-100' : rank === 2 ? 'border-gray-100' : 'border-amber-100';
            const medalColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-amber-600';
            
            // Display name logic: prefer name, fallback to formatted userId
            const displayName = entry.fullName || `${entry.userId}`;
            console.log(`Entry: ${JSON.stringify(entry)}`);
            return (
              <motion.div 
                key={entry.userId}
                className={`${bgColor} border ${borderColor} rounded-xl p-6 text-center relative`}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Medal 
                  size={48} 
                  className={`${medalColor} absolute top-4 right-4`}
                />
                
                <div className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center border border-gray-200 shadow-sm">
                  <span className="text-sm font-bold">{rank}</span>
                </div>
                
                <div className="relative mb-4">
                  <img 
                    src={entry.profilePicture || 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg'} 
                    alt={displayName}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                  />
                </div>
                
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {displayName}
                </div>
                
                <div className="text-primary-600 font-semibold mb-2">
                  {entry.totalImpact.toFixed(0)} pts
                </div>
                
                <div className="text-sm text-gray-600">
                  {entry.totalActions} actions
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <div>
        <div className="flex items-center mb-4">
          <Users size={20} className="text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">All Participants</h2>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            {enhancedRestOfLeaderboard.map((entry) => (
              <LeaderboardItem 
                key={entry.userId} 
                entry={entry}
                isCurrentUser={userId ? entry.userId === userId : false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;