import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ entry, isCurrentUser }) => {
  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-700';
    }
  };

  const getTrophyColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-400';
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className={`
        p-4 rounded-lg mb-3 flex items-center
        ${isCurrentUser ? 'bg-primary-50 border border-primary-200' : 'bg-white shadow-soft'}
      `}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 w-10 mr-4 text-center">
        {entry.rank <= 3 ? (
          <Trophy className={getTrophyColor(entry.rank)} size={24} />
        ) : (
          <span className={`font-bold text-lg ${getRankColor(entry.rank)}`}>
            {entry.rank}
          </span>
        )}
      </div>
      
      <div className="flex-shrink-0 mr-4">
        <img 
          src={entry.avatar || 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg'} 
          alt={entry.name} 
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
        />
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{entry.name}</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-primary-500 h-2 rounded-full" 
              style={{ width: `${Math.min(100, (entry.score / 2000) * 100)}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-primary-700">{entry.score} pts</span>
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="flex-shrink-0 ml-2">
          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
            You
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default LeaderboardItem;