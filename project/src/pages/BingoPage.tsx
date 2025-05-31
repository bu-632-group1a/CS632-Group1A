import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSustainability } from '../contexts/SustainabilityContext';
import { Award, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { BingoSquare } from '../types';
import Confetti from 'react-confetti';

const BingoPage: React.FC = () => {
  const { user } = useAuth();
  const { logAction } = useSustainability();
  const [board, setBoard] = useState<BingoSquare[]>([]);
  const [selectedSquares, setSelectedSquares] = useState<string[]>(user?.completedBingoSquares || []);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Sample bingo squares for demo
  const bingoSquares: BingoSquare[] = [
    { id: '1', text: 'Use reusable water bottle', category: 'sustainability', points: 10 },
    { id: '2', text: 'Attend keynote speech', category: 'learning', points: 15 },
    { id: '3', text: 'Network with 3 new people', category: 'networking', points: 20 },
    { id: '4', text: 'Share on social media', category: 'fun', points: 5 },
    { id: '5', text: 'Use digital materials only', category: 'sustainability', points: 10 },
    { id: '6', text: 'Join a workshop', category: 'learning', points: 15 },
    { id: '7', text: 'Recycle properly', category: 'sustainability', points: 10 },
    { id: '8', text: 'Take a selfie at booth', category: 'fun', points: 5 },
    { id: '9', text: 'Ask a speaker a question', category: 'learning', points: 10 },
    { id: '10', text: 'Use public transport', category: 'sustainability', points: 20 },
    { id: '11', text: 'Join lunch discussion', category: 'networking', points: 15 },
    { id: '12', text: 'Visit 5 exhibitors', category: 'networking', points: 20 },
    { id: '13', text: 'Choose vegetarian meal', category: 'sustainability', points: 15 },
    { id: '14', text: 'Attend panel discussion', category: 'learning', points: 15 },
    { id: '15', text: 'Share conference tips', category: 'networking', points: 10 },
    { id: '16', text: 'Use stairs not elevator', category: 'sustainability', points: 5 },
    { id: '17', text: 'Join evening social', category: 'fun', points: 15 },
    { id: '18', text: 'Download conference app', category: 'learning', points: 5 },
    { id: '19', text: 'Exchange business cards', category: 'networking', points: 10 },
    { id: '20', text: 'Participate in survey', category: 'fun', points: 5 },
    { id: '21', text: 'Turn off unused devices', category: 'sustainability', points: 5 },
    { id: '22', text: 'Join breakout session', category: 'learning', points: 10 },
    { id: '23', text: 'Connect on LinkedIn', category: 'networking', points: 5 },
    { id: '24', text: 'Share conference photo', category: 'fun', points: 5 },
    { id: '25', text: 'Complete feedback form', category: 'learning', points: 10 },
  ];

  useEffect(() => {
    // Initialize board with shuffled squares
    const shuffled = [...bingoSquares].sort(() => Math.random() - 0.5);
    setBoard(shuffled);

    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSquareClick = async (square: BingoSquare) => {
    if (selectedSquares.includes(square.id)) {
      return;
    }

    const newSelectedSquares = [...selectedSquares, square.id];
    setSelectedSquares(newSelectedSquares);

    // Log sustainability action if applicable
    if (square.category === 'sustainability') {
      await logAction('digital_materials', `Completed bingo square: ${square.text}`);
    }

    // Check for bingo
    checkForBingo(newSelectedSquares);
  };

  const checkForBingo = (squares: string[]) => {
    const size = 5;
    const board = Array(size).fill(null).map(() => Array(size).fill(false));

    // Fill the board with selected squares
    squares.forEach(id => {
      const index = bingoSquares.findIndex(square => square.id === id);
      const row = Math.floor(index / size);
      const col = index % size;
      board[row][col] = true;
    });

    // Check rows
    for (let i = 0; i < size; i++) {
      if (board[i].every(cell => cell)) {
        celebrateBingo();
        return;
      }
    }

    // Check columns
    for (let i = 0; i < size; i++) {
      if (board.every(row => row[i])) {
        celebrateBingo();
        return;
      }
    }

    // Check diagonals
    if (board.every((row, i) => row[i]) || 
        board.every((row, i) => row[size - 1 - i])) {
      celebrateBingo();
      return;
    }
  };

  const celebrateBingo = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const resetBoard = () => {
    const shuffled = [...bingoSquares].sort(() => Math.random() - 0.5);
    setBoard(shuffled);
    setSelectedSquares([]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sustainability':
        return 'bg-primary-100 text-primary-800';
      case 'learning':
        return 'bg-blue-100 text-blue-800';
      case 'networking':
        return 'bg-purple-100 text-purple-800';
      case 'fun':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
            <Award className="h-8 w-8 mr-2 text-primary-600" />
            Sustainability Bingo
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Complete activities to earn points and win prizes
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={resetBoard}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            New Board
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {board.map((square, index) => (
          <motion.div
            key={square.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            onClick={() => handleSquareClick(square)}
            className={`relative aspect-square rounded-lg border-2 ${
              selectedSquares.includes(square.id)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300 bg-white'
            } p-4 cursor-pointer transition-colors duration-200 flex flex-col justify-between`}
          >
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getCategoryColor(square.category)
              }`}>
                {square.category}
              </span>
              <p className="mt-2 text-sm text-gray-900">{square.text}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium text-primary-600">
                {square.points} pts
              </span>
              {selectedSquares.includes(square.id) && (
                <CheckCircle className="h-5 w-5 text-primary-500" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">How to Play</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Complete activities to mark squares on your bingo board. Get 5 in a row (horizontally, vertically, or diagonally) to win!</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="border rounded-md p-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getCategoryColor('sustainability')
              }`}>
                Sustainability
              </span>
              <p className="mt-1 text-sm text-gray-500">Eco-friendly actions</p>
            </div>
            <div className="border rounded-md p-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getCategoryColor('learning')
              }`}>
                Learning
              </span>
              <p className="mt-1 text-sm text-gray-500">Educational activities</p>
            </div>
            <div className="border rounded-md p-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getCategoryColor('networking')
              }`}>
                Networking
              </span>
              <p className="mt-1 text-sm text-gray-500">Connect with others</p>
            </div>
            <div className="border rounded-md p-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getCategoryColor('fun')
              }`}>
                Fun
              </span>
              <p className="mt-1 text-sm text-gray-500">Enjoyable moments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BingoPage;