import React from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import { BingoItem } from '../../types';
import { TOGGLE_BINGO_ITEM } from '../../graphql/mutations';
import { GET_BINGO_GAME } from '../../graphql/queries';

interface BingoCardProps {
  items: BingoItem[];
}

const BingoCard: React.FC<BingoCardProps> = ({ items }) => {
  const [toggleBingoItem, { loading }] = useMutation(TOGGLE_BINGO_ITEM, {
    refetchQueries: [{ query: GET_BINGO_GAME }],
    onError: (error) => {
      console.error('Error toggling bingo item:', error);
    }
  });
  
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

  const handleToggleItem = async (itemId: string) => {
    if (loading || itemId.startsWith('placeholder')) return;
    
    try {
      await toggleBingoItem({
        variables: { itemId }
      });
    } catch (error) {
      // Error is handled by onError callback
    }
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
        className="
          grid 
          grid-cols-4 
          gap-2 sm:gap-3 md:gap-4
          w-full 
          max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
          mx-auto 
          p-1 sm:p-2 md:p-4
          bg-white 
          rounded-xl 
          shadow-soft-lg
        "
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            className={`
              w-full h-full aspect-square 
              min-w-[56px] min-h-[56px] 
              sm:min-w-[72px] sm:min-h-[72px] 
              md:min-w-[96px] md:min-h-[96px]
              flex items-center justify-center 
              p-1 sm:p-2 md:p-3 
              rounded-lg text-center 
              text-xs sm:text-sm md:text-base 
              break-words whitespace-normal
              ${item.completed 
                ? 'bg-primary-100 border-2 border-primary-500 text-primary-800 shadow-md' 
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 shadow-sm'}
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${loading ? 'pointer-events-none' : ''}
            `}
            onClick={() => handleToggleItem(item.id)}
            variants={itemVariants}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            aria-pressed={item.completed}
            disabled={loading || item.id.startsWith('placeholder')}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="whitespace-normal">{item.text}</span>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default BingoCard;