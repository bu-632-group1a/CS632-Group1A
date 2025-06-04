import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import BingoCard from '../components/bingo/BingoCard';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const BingoPage: React.FC = () => {
  const { bingoItems } = useApp();
  const { isAuthenticated } = useAuth();
  
  // Calculate completion percentage
  const completedItems = bingoItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedItems / bingoItems.length) * 100);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600">You need to be signed in to play Sustainability Bingo.</p>
        <a href="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <motion.h1 
          className="text-3xl font-bold text-gray-900 mb-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Sustainability Bingo
        </motion.h1>
        <motion.p 
          className="text-gray-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Complete activities to get a BINGO and earn bonus points!
        </motion.p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <div className="bg-primary-100 p-2 rounded-full mr-4">
                <Award size={24} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">Your Progress</h2>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <motion.div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  ></motion.div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">{completedItems} of {bingoItems.length} completed</span>
                  <span className="text-sm font-medium text-primary-600">{completionPercentage}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">How to Play</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Complete activities during the event to mark squares</li>
                <li>Get 4 in a row (horizontal, vertical, or diagonal) to achieve BINGO</li>
                <li>Each BINGO earns you 200 bonus sustainability points</li>
                <li>Try to complete all squares for maximum points!</li>
              </ul>
            </div>
            
            <BingoCard items={bingoItems} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BingoPage;