import React from 'react';
import { motion } from 'framer-motion';
import { BingoItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface BingoCardProps {
  items: BingoItem[];
}

const BingoCard: React.FC<BingoCardProps> = ({ items }) => {
  const { toggleBingoItem } = useApp();
  
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  // Calculate if we have a bingo (horizontal, vertical, or diagonal)
  const hasBingo = () => {
    if (items.length !== 16) return false;
    
    // Check rows
    for (let i = 0; i < 4; i++) {
      if (
        items[i * 4].completed &&
        items[i * 4 + 1].completed &&
        items[i * 4 + 2].completed &&
        items[i * 4 + 3].completed
      ) {
        return true;
      }
    }
    
    // Check columns
    for (let i = 0; i < 4; i++) {
      if (
        items[i].completed &&
        items[i + 4].completed &&
        items[i + 8].completed &&
        items[i + 12].completed
      ) {
        return true;
      }
    }
    
    // Check diagonals
    if (
      items[0].completed &&
      items[5].completed &&
      items[10].completed &&
      items[15].completed
    ) {
      return true;
    }
    
    if (
      items[3].completed &&
      items[6].completed &&
      items[9].completed &&
      items[12].completed
    ) {
      return true;
    }
    
    return false;
  };

  const bingoAchieved = hasBingo();

  return (
    <div className="relative">
      {bingoAchieved && (
        <motion.div 
          className="absolute -top-6 left-0 right-0 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <span className="inline-block bg-primary-600 text-white font-bold py-2 px-4 rounded-full shadow-lg">
            BINGO!
          </span>
        </motion.div>
      )}
      
      <motion.div 
        className="grid grid-cols-4 gap-3 p-3 bg-white rounded-xl shadow-soft-lg"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item) => (
          <motion.button
            key={item.id}
            className={`
              aspect-square flex items-center justify-center p-2 rounded-lg text-center text-sm
              ${item.completed 
                ? 'bg-primary-100 border-2 border-primary-500 text-primary-800' 
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'}
              transition-colors
            `}
            onClick={() => toggleBingoItem(item.id)}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={item.completed}
          >
            <span className="line-clamp-4">{item.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default BingoCard;