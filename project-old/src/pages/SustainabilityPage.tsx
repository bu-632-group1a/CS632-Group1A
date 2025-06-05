import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowUp, Filter } from 'lucide-react';
import ActionCard from '../components/sustainability/ActionCard';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const SustainabilityPage: React.FC = () => {
  const { sustainabilityActions } = useApp();
  const { isAuthenticated, user } = useAuth();
  const [filter, setFilter] = useState('all');
  
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600">You need to be signed in to track sustainability actions.</p>
        <a href="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">
          Go to login
        </a>
      </div>
    );
  }

  // Filter actions based on selected category
  const filteredActions = sustainabilityActions.filter(
    action => filter === 'all' || action.category === filter
  );

  // Calculate total points
  const totalPointsPossible = sustainabilityActions.reduce(
    (sum, action) => sum + action.points, 
    0
  );
  
  const earnedPoints = sustainabilityActions
    .filter(action => action.completed)
    .reduce((sum, action) => sum + action.points, 0);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Sustainability Tracker</h1>
        <p className="text-gray-600">Track your eco-friendly actions during the event</p>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-6 text-white shadow-soft"
        variants={itemVariants}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <p className="text-white/80 mb-1">Your Sustainability Score</p>
            <div className="flex items-center">
              <h2 className="text-3xl font-bold">{user?.sustainabilityScore || 0}</h2>
              <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-sm flex items-center">
                <ArrowUp size={14} className="mr-1" />
                {earnedPoints} pts earned
              </span>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-sm text-white/80 mb-1">Event Progress</p>
            <div className="w-full bg-black/10 rounded-full h-2.5 mb-1">
              <motion.div 
                className="bg-white h-2.5 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (earnedPoints / totalPointsPossible) * 100)}%` }}
                transition={{ duration: 0.8 }}
              ></motion.div>
            </div>
            <p className="text-sm">{earnedPoints} / {totalPointsPossible} points</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div className="space-y-4" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Sustainability Actions</h2>
          
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="transport">Transport</option>
              <option value="waste">Waste</option>
              <option value="food">Food</option>
              <option value="energy">Energy</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredActions.length > 0 ? (
            filteredActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-xl shadow-soft">
              <Leaf size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No actions found for this category</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SustainabilityPage;