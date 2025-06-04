import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Medal } from 'lucide-react';
import LeaderboardItem from '../components/leaderboard/LeaderboardItem';
import { mockLeaderboard } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const LeaderboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  const topThree = mockLeaderboard.slice(0, 3);
  const restOfLeaderboard = mockLeaderboard.slice(3);

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
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Sustainability Leaderboard</h1>
        <p className="text-gray-600">See who's making the biggest impact at the event</p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {topThree.map((entry, index) => {
              const rank = index + 1;
              let bgColor = 'bg-white';
              let textColor = 'text-gray-900';
              let borderColor = 'border-gray-100';
              let medalColor = 'text-gray-400';
              
              if (rank === 1) {
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-200';
                medalColor = 'text-yellow-500';
              } else if (rank === 2) {
                bgColor = 'bg-gray-50';
                borderColor = 'border-gray-200';
                medalColor = 'text-gray-400';
              } else if (rank === 3) {
                bgColor = 'bg-amber-50';
                borderColor = 'border-amber-200';
                medalColor = 'text-amber-600';
              }
              
              return (
                <motion.div 
                  key={entry.id}
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`${bgColor} border ${borderColor} rounded-lg p-4 text-center flex flex-col items-center`}
                >
                  <div className={`${medalColor} mb-2`}>
                    <Medal size={32} />
                  </div>
                  
                  <div className="relative mb-3">
                    <div className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-gray-200 shadow-sm">
                      <span className="text-xs font-bold">{rank}</span>
                    </div>
                    <img 
                      src={entry.avatar || 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg'} 
                      alt={entry.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  </div>
                  
                  <h3 className={`font-bold ${textColor} text-lg mb-1`}>{entry.name}</h3>
                  <p className="text-primary-600 font-semibold">{entry.score} pts</p>
                  
                  {isAuthenticated && user && entry.id === user.id && (
                    <span className="mt-2 bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="flex items-center mb-4">
          <Users size={20} className="text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">All Participants</h2>
        </div>
        
        <div>
          {restOfLeaderboard.map(entry => (
            <LeaderboardItem 
              key={entry.id} 
              entry={entry} 
              isCurrentUser={isAuthenticated && user ? entry.id === user.id : false}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeaderboardPage;