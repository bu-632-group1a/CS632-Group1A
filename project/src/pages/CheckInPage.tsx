import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CheckCheck, BarChart2 } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const CheckInPage: React.FC = () => {
  const { sessions } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [checkedIn, setCheckedIn] = useState<string[]>(user?.checkedInEvents || []);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600">You need to be signed in to check in to sessions.</p>
        <a href="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">
          Go to login
        </a>
      </div>
    );
  }

  const handleCheckIn = (sessionId: string) => {
    if (!checkedIn.includes(sessionId)) {
      setSelectedSession(sessionId);
      setCheckedIn([...checkedIn, sessionId]);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

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
    <div className="relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-0 left-0 right-0 p-4 flex justify-center z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div className="bg-green-100 text-green-800 px-6 py-4 rounded-lg shadow-lg flex items-center">
              <CheckCheck size={24} className="mr-3" />
              <span className="font-medium">Successfully checked in!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Check In</h1>
          <p className="text-gray-600">Check in to sessions you're attending to earn points</p>
        </motion.div>
        
        <motion.div
          className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-6"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-white p-2 rounded-full mr-4">
              <BarChart2 size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Earn Sustainability Points</h2>
              <p className="text-gray-700">
                Check in to sessions and complete actions to earn points and climb the leaderboard.
              </p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-primary-600" />
                  <span>Earn 25 points for each session you attend</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-primary-600" />
                  <span>Unlock badges for attending multiple sessions</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-primary-600" />
                  <span>Track your progress on the leaderboard</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Sessions</h2>
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => {
              const isCheckedIn = checkedIn.includes(session.id);
              const isSelected = selectedSession === session.id;
              
              return (
                <motion.div 
                  key={session.id}
                  animate={isSelected ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 h-40 sm:h-auto">
                          <img 
                            src={session.imageUrl || 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg'} 
                            alt={session.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 sm:p-6 flex flex-col">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{session.title}</h3>
                            <div className="flex flex-wrap text-sm text-gray-600 mb-2">
                              <span className="mr-4">{session.time}</span>
                              <span>{session.location}</span>
                            </div>
                            <p className="text-gray-700 mb-4 line-clamp-2">
                              {session.description}
                            </p>
                          </div>
                          
                          <div>
                            {isCheckedIn ? (
                              <Button
                                variant="outline"
                                disabled
                                icon={<CheckCheck size={18} />}
                                className="text-green-600 border-green-600"
                              >
                                Checked In
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                onClick={() => handleCheckIn(session.id)}
                                icon={<CheckCircle size={18} />}
                              >
                                Check In
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CheckInPage;