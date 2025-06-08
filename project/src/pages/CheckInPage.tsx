import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CheckCheck, BarChart2, Home, AlertCircle, Calendar, Clock, MapPin, User, QrCode } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import QRCodeModal from '../components/ui/QRCodeModal';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useCheckIns } from '../hooks/useCheckIns';

const CheckInPage: React.FC = () => {
  const { sessions } = useApp();
  const { user, isAuthenticated } = useAuth();
  const { 
    checkIns, 
    loading, 
    error, 
    createCheckIn, 
    deleteCheckIn, 
    isSessionCheckedIn, 
    getCheckInBySessionId 
  } = useCheckIns();
  
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [processingSession, setProcessingSession] = useState<string | null>(null);
  const [qrModalSession, setQrModalSession] = useState<string | null>(null);

  // Handle automatic check-in from QR code
  useEffect(() => {
    const sessionId = searchParams.get('session');
    const autoCheckIn = searchParams.get('auto');
    
    if (sessionId && autoCheckIn === 'true' && isAuthenticated) {
      const session = sessions.find(s => s.id === sessionId);
      if (session && !isSessionCheckedIn(sessionId)) {
        handleCheckIn(sessionId, true);
      }
    }
  }, [searchParams, isAuthenticated, sessions]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          You need to be signed in to check in to sessions and track your attendance.
        </p>
        <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">
          Go to login
        </Link>
      </div>
    );
  }

  const handleCheckIn = async (sessionId: string, isAutomatic = false) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setProcessingSession(sessionId);
    
    try {
      if (isSessionCheckedIn(sessionId)) {
        // Remove check-in
        const checkIn = getCheckInBySessionId(sessionId);
        if (checkIn) {
          await deleteCheckIn(checkIn.id);
        }
      } else {
        // Create check-in
        await createCheckIn(session);
        setSelectedSession(sessionId);
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
        }, isAutomatic ? 5000 : 3000);
      }
    } catch (error) {
      console.error('Error toggling check-in:', error);
    } finally {
      setProcessingSession(null);
    }
  };

  const handleShowQRCode = (sessionId: string) => {
    setQrModalSession(sessionId);
  };

  const checkedInCount = checkIns.length;
  const totalSessions = sessions.length;

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

  const selectedSessionData = qrModalSession ? sessions.find(s => s.id === qrModalSession) : null;

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

      {/* QR Code Modal */}
      {selectedSessionData && (
        <QRCodeModal
          isOpen={!!qrModalSession}
          onClose={() => setQrModalSession(null)}
          session={selectedSessionData}
        />
      )}
      
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="flex justify-between items-center"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Session Check-In</h1>
            <p className="text-gray-600">Check in to sessions you're attending to track your participation</p>
          </div>
          <Link to="/">
            <Button
              variant="ghost"
              icon={<Home size={20} />}
              className="text-gray-600 hover:text-gray-900"
            >
              Home
            </Button>
          </Link>
        </motion.div>

        {/* Progress Summary */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 p-2 rounded-full mr-4">
                  <BarChart2 size={24} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">Your Attendance Progress</h2>
                  <p className="text-gray-600">Track your conference participation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {checkedInCount}
                  </div>
                  <div className="text-sm text-gray-600">Sessions Attended</div>
                </div>
                <div className="bg-secondary-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-secondary-600 mb-1">
                    {totalSessions}
                  </div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="bg-accent-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent-600 mb-1">
                    {totalSessions > 0 ? Math.round((checkedInCount / totalSessions) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-primary-600 h-3 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalSessions > 0 ? (checkedInCount / totalSessions) * 100 : 0}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>{checkedInCount} checked in</span>
                <span>{totalSessions - checkedInCount} remaining</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Info */}
        <motion.div
          className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-6"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-white p-2 rounded-full mr-4">
              <BarChart2 size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Benefits of Checking In</h2>
              <p className="text-gray-700 mb-3">
                Track your conference participation and unlock achievements.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-primary-600" />
                  <span>Track your attendance across all sessions</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-primary-600" />
                  <span>Build your conference participation history</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-primary-600" />
                  <span>Get personalized session recommendations</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <QrCode size={16} className="mr-2 text-primary-600" />
                  <span>Generate QR codes for easy attendee check-in</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center text-red-700">
                  <AlertCircle size={20} className="mr-2" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Sessions List */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Available Sessions</h2>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-1" />
              <span>{sessions.length} sessions available</span>
            </div>
          </div>
          
          {loading && checkIns.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600">Loading your check-ins...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((session) => {
                const isCheckedIn = isSessionCheckedIn(session.id);
                const isProcessing = processingSession === session.id;
                const isSelected = selectedSession === session.id;
                
                return (
                  <motion.div 
                    key={session.id}
                    animate={isSelected ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Card interactive>
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
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-bold text-gray-900 flex-1 mr-4">
                                  {session.title}
                                </h3>
                                <Badge 
                                  variant={session.category === 'Keynote' ? 'primary' : 'secondary'} 
                                  size="sm"
                                >
                                  {session.category}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-2 text-primary-600" />
                                  <span>{session.time}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin size={14} className="mr-2 text-primary-600" />
                                  <span>{session.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <User size={14} className="mr-2 text-primary-600" />
                                  <span>{session.speaker}</span>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-4 line-clamp-2">
                                {session.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                {new Date(session.date).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* QR Code Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShowQRCode(session.id)}
                                  icon={<QrCode size={16} />}
                                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                >
                                  QR Code
                                </Button>

                                {/* Check-in Button */}
                                {isCheckedIn ? (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleCheckIn(session.id)}
                                    disabled={isProcessing}
                                    icon={isProcessing ? undefined : <CheckCheck size={18} />}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                  >
                                    {isProcessing ? (
                                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      'Checked In'
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    onClick={() => handleCheckIn(session.id)}
                                    disabled={isProcessing}
                                    icon={isProcessing ? undefined : <CheckCircle size={18} />}
                                  >
                                    {isProcessing ? (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      'Check In'
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CheckInPage;