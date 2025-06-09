import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Settings, Home, RefreshCw, ChevronDown, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import BingoCard from '../components/bingo/BingoCard';
import BingoAdminPanel from '../components/bingo/BingoAdminPanel';
import { GET_BINGO_ITEMS, GET_BINGO_GAME, ME } from '../graphql/queries';
import { RESET_BINGO_GAME } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';

// Mock game types for the dropdown
const GAME_TYPES = [
  { id: 'default', name: 'Default Sustainability Bingo', description: 'Standard sustainability activities' },
  { id: 'conference', name: 'Conference Activities', description: 'Conference-specific activities' },
  { id: 'networking', name: 'Networking Bingo', description: 'Social and networking activities' },
  { id: 'learning', name: 'Learning Objectives', description: 'Educational goals and achievements' }
];

const BingoPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const [selectedGameType, setSelectedGameType] = useState('default');
  const [showGameSelector, setShowGameSelector] = useState(false);
  
  const { data: userData } = useQuery(ME, {
    skip: !isAuthenticated
  });
  
  const { data: bingoItemsData, loading: itemsLoading, error: itemsError } = useQuery(GET_BINGO_ITEMS, {
    errorPolicy: 'all'
  });
  
  const { data: bingoGameData, loading: gameLoading, error: gameError, refetch: refetchGame } = useQuery(GET_BINGO_GAME, {
    skip: !isAuthenticated,
    errorPolicy: 'all'
  });

  const [resetBingoGame, { loading: resetting }] = useMutation(RESET_BINGO_GAME, {
    refetchQueries: [{ query: GET_BINGO_GAME }],
    onCompleted: () => {
      console.log('Bingo game reset successfully');
    },
    onError: (error) => {
      console.error('Error resetting bingo game:', error);
    }
  });

  const user = userData?.me;
  const isAdmin = user?.role === 'ADMIN';
  
  // FIX: Create a mutable copy of the bingoItems array
  const bingoItems = React.useMemo(() => {
    if (!bingoItemsData?.bingoItems) return [];
    return [...bingoItemsData.bingoItems];
  }, [bingoItemsData?.bingoItems]);
  
  const bingoGame = bingoGameData?.bingoGame;

  // Get selected game info
  const selectedGame = GAME_TYPES.find(game => game.id === selectedGameType) || GAME_TYPES[0];

  // Transform GraphQL data to match existing BingoCard component interface
  const transformedItems = React.useMemo(() => {
    if (!bingoItems.length) {
      // Create placeholder items for the default game
      const placeholderItems = [
        'Attend a keynote speech',
        'Visit the innovation showcase', 
        'Network with 3 new people',
        'Ask a question during Q&A',
        'Attend a panel discussion',
        'Take public transit to the event',
        'Share on social media',
        'Visit all vendor demos',
        'Use a reusable water bottle',
        'Join the sustainability tour',
        'Exchange contact info',
        'Participate in a workshop',
        'Take session notes',
        'Learn about AI in PM',
        'Meet a keynote speaker',
        'Visit the heat exchange area'
      ];

      return placeholderItems.map((text, index) => ({
        id: `placeholder-${index}`,
        text,
        completed: false
      }));
    }
    
    // Create a 4x4 grid (16 items) sorted by position
    // FIX: Sort the already-copied array safely
    const sortedItems = bingoItems
      .filter(item => item.isActive)
      .sort((a, b) => a.position - b.position)
      .slice(0, 16);
    
    // Fill remaining positions if needed
    while (sortedItems.length < 16) {
      sortedItems.push({
        id: `placeholder-${sortedItems.length}`,
        text: 'Coming Soon...',
        position: sortedItems.length,
        category: 'GENERAL',
        points: 0,
        isActive: false,
        createdBy: '',
        createdAt: '',
        updatedAt: ''
      });
    }
    
    return sortedItems.map(item => ({
      id: item.id,
      text: item.text,
      completed: bingoGame?.completedItems?.some(completed => completed.item.id === item.id) || false
    }));
  }, [bingoItems, bingoGame]);

  // Calculate completion percentage
  const completedItems = transformedItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedItems / transformedItems.length) * 100);

  // Calculate bingo achievements
  const bingosAchieved = bingoGame?.bingosAchieved?.length || 0;
  const totalPoints = bingoGame?.totalPoints || 0;
  const isGameCompleted = bingoGame?.isCompleted || false;

  const handleResetGame = async () => {
    if (window.confirm('Are you sure you want to reset your bingo game? This will clear all your progress.')) {
      try {
        await resetBingoGame();
      } catch (error) {
        // Error is handled by onError callback
      }
    }
  };

  const handleGameTypeChange = (gameType: string) => {
    setSelectedGameType(gameType);
    setShowGameSelector(false);
    // In a real implementation, this would trigger a refetch with the new game type
    console.log('Switching to game type:', gameType);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Award size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600">You need to be signed in to play Sustainability Bingo.</p>
        <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">
          Go to login
        </Link>
      </div>
    );
  }

  if (itemsError && gameError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-700">Failed to load bingo data. Please try again later.</p>
          {gameError && (
            <p className="text-red-600 text-sm mt-2">
              Game Error: {gameError.message}
            </p>
          )}
        </div>
        <Button onClick={() => refetchGame()} icon={<RefreshCw size={20} />}>
          Retry
        </Button>
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
      {/* Title and subtitle */}
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

      {/* Button group below title/subtitle */}
      <div className="flex flex-row flex-wrap items-center gap-2 justify-start md:justify-start w-full">
        {isAdmin && (
          <Button
            variant={showAdminPanel ? "primary" : "outline"}
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            icon={<Settings size={20} />}
          >
            {showAdminPanel ? 'Hide Admin' : 'Admin Panel'}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleResetGame}
          isLoading={resetting}
          icon={<RefreshCw size={20} />}
          className="text-gray-600 hover:text-gray-900"
        >
          Reset Game
        </Button>
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

      {/* Game Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <Gamepad2 size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Game Type</h3>
                  <p className="text-sm text-gray-600">Choose your bingo game variant</p>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowGameSelector(!showGameSelector)}
                  className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{selectedGame.name}</div>
                    <div className="text-xs text-gray-500">{selectedGame.description}</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${showGameSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {showGameSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    {GAME_TYPES.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleGameTypeChange(game.id)}
                        className={`
                          w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg
                          ${selectedGameType === game.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''}
                        `}
                      >
                        <div className="font-medium text-gray-900">{game.name}</div>
                        <div className="text-sm text-gray-600">{game.description}</div>
                        {selectedGameType === game.id && (
                          <div className="text-xs text-primary-600 mt-1">Currently selected</div>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Panel */}
      {isAdmin && showAdminPanel && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BingoAdminPanel />
        </motion.div>
      )}
      
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
                  <span className="text-sm text-gray-600">{completedItems} of {transformedItems.length} completed</span>
                  <span className="text-sm font-medium text-primary-600">{completionPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {completedItems}
                </div>
                <div className="text-sm text-gray-600">Items Completed</div>
              </div>
              <div className="bg-secondary-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-secondary-600 mb-1">
                  {bingosAchieved}
                </div>
                <div className="text-sm text-gray-600">Bingos Achieved</div>
              </div>
              <div className="bg-accent-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent-600 mb-1">
                  {totalPoints}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {isGameCompleted ? 'YES' : 'NO'}
                </div>
                <div className="text-sm text-gray-600">Game Complete</div>
              </div>
            </div>

            {/* Game Status */}
            {isGameCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Award size={20} className="text-green-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-green-900">Congratulations!</h3>
                    <p className="text-green-800 text-sm">
                      You've completed your bingo card! You earned {totalPoints} points and achieved {bingosAchieved} bingo{bingosAchieved !== 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Game Started Info */}
            {bingoGame?.gameStartedAt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Award size={20} className="text-blue-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-blue-900">Game Started</h3>
                    <p className="text-blue-800 text-sm">
                      Started on {new Date(bingoGame.gameStartedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {bingoGame.gameCompletedAt && (
                        <span> • Completed on {new Date(bingoGame.gameCompletedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">How to Play</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Complete activities during the event to mark squares</li>
                <li>• Get 4 in a row (horizontal, vertical, or diagonal) to achieve BINGO</li>
                <li>• Each BINGO earns you bonus sustainability points</li>
                <li>• Try to complete all squares for maximum points!</li>
                <li>• Your progress is automatically saved</li>
                <li>• Switch between different game types using the selector above</li>
              </ul>
            </div>
            
            {itemsLoading || gameLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
              </div>
            ) : (
              <BingoCard items={transformedItems} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BingoPage;