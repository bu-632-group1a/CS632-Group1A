import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import { BingoItem } from '../../types';
import { TOGGLE_BINGO_ITEM } from '../../graphql/mutations';
import { GET_BINGO_GAME } from '../../graphql/queries';

interface BingoBoardEntry {
  item: BingoItem;
  position: number;
  completed: boolean;
}

interface BingoCardProps {
  board: BingoBoardEntry[];
  onBingoAchieved?: () => void;
  onGameComplete?: () => void;
}

const BingoCard: React.FC<BingoCardProps> = ({ board, onBingoAchieved, onGameComplete }) => {
  const [hasWon, setHasWon] = useState(false);
  const [toggleBingoItem, { loading }] = useMutation(TOGGLE_BINGO_ITEM, {
    refetchQueries: [{ query: GET_BINGO_GAME }],
    onError: (error) => {
      console.error('Error toggling bingo item:', error);
    }
  });

  // Sort board by position
  const sortedBoard = [...board].sort((a, b) => a.position - b.position);

  const hasBingo = (): boolean => {
    if (sortedBoard.length !== 16) return false;
    // Check rows, columns, diagonals
    for (let i = 0; i < 4; i++) {
      if (
        sortedBoard[i * 4].completed &&
        sortedBoard[i * 4 + 1].completed &&
        sortedBoard[i * 4 + 2].completed &&
        sortedBoard[i * 4 + 3].completed
      ) return true;
      if (
        sortedBoard[i].completed &&
        sortedBoard[i + 4].completed &&
        sortedBoard[i + 8].completed &&
        sortedBoard[i + 12].completed
      ) return true;
    }
    if (
      sortedBoard[0].completed &&
      sortedBoard[5].completed &&
      sortedBoard[10].completed &&
      sortedBoard[15].completed
    ) return true;
    if (
      sortedBoard[3].completed &&
      sortedBoard[6].completed &&
      sortedBoard[9].completed &&
      sortedBoard[12].completed
    ) return true;
    return false;
  };

  useEffect(() => {
    if (!hasWon && hasBingo()) {
      setHasWon(true);
      onBingoAchieved?.();
      onGameComplete?.();
    }
  }, [board, hasWon]);

  const handleToggleItem = async (itemId: string) => {
    if (loading || itemId.startsWith('placeholder')) return;
    try {
      await toggleBingoItem({ variables: { itemId } });
    } catch (_) {
      // Error already handled in onError
    }
  };

  return (
    <div className="relative">
      {hasWon && (
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
          max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl
          mx-auto 
          p-1 sm:p-2 md:p-4
          bg-white 
          rounded-xl 
          shadow-soft-lg
        "
        initial="hidden"
        animate="visible"
      >
        {sortedBoard.map((entry) => (
          <motion.button
            key={entry.item.id}
            className={`
              w-[56px] h-[80px]
              sm:w-[80px] sm:h-[100px]
              md:w-[120px] md:h-[140px]
              lg:w-[160px] lg:h-[180px]
              flex items-center justify-center
              p-2 sm:p-3 md:p-4
              rounded-lg text-center
              text-[6px] sm:text-xs md:text-base lg:text-lg
              break-words whitespace-normal
              overflow-hidden
              ${entry.completed 
                ? 'bg-primary-100 border-2 border-primary-500 text-primary-800 shadow-md' 
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 shadow-sm'}
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${loading ? 'pointer-events-none' : ''}
            `}
            onClick={() => handleToggleItem(entry.item.id)}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            aria-pressed={entry.completed}
            disabled={loading || entry.item.id.startsWith('placeholder')}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="whitespace-normal break-words line-clamp-4">{entry.item.text}</span>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default BingoCard;
