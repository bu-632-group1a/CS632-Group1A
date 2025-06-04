import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Check, Calendar } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600">You need to be signed in to view this page.</p>
        <a href="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">
          Go to login
        </a>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-gray-600">Manage your account and review your sustainability progress</p>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-xl shadow-soft overflow-hidden"
        variants={itemVariants}
      >
        <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-6">
            <div className="relative">
              <img 
                src={user.avatar || 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg'} 
                alt={user.name} 
                className="w-32 h-32 rounded-xl border-4 border-white shadow-md object-cover"
              />
              <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md text-primary-600 hover:text-primary-800">
                <User size={16} />
              </button>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="primary" icon={<Award size={14} />} animated>
              Level 3 Eco Warrior
            </Badge>
            <Badge variant="secondary" animated>
              Joined 2023
            </Badge>
            <Badge variant="success" animated>
              10+ Actions Completed
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 rounded-lg p-4 flex items-center">
              <div className="bg-primary-100 p-2 rounded-lg mr-3">
                <Award size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sustainability Score</p>
                <p className="text-lg font-bold text-primary-700">{user.sustainabilityScore} pts</p>
              </div>
            </div>
            
            <div className="bg-secondary-50 rounded-lg p-4 flex items-center">
              <div className="bg-secondary-100 p-2 rounded-lg mr-3">
                <Check size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Badges Earned</p>
                <p className="text-lg font-bold text-secondary-700">{user.badges.length}</p>
              </div>
            </div>
            
            <div className="bg-accent-50 rounded-lg p-4 flex items-center">
              <div className="bg-accent-100 p-2 rounded-lg mr-3">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sessions Attended</p>
                <p className="text-lg font-bold text-accent-700">{user.checkedInEvents.length}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Earned Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.badges.map((badge) => (
            <Card key={badge.id}>
              <CardContent className="p-4 text-center">
                <div className="bg-primary-100 mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3">
                  <Award size={32} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                <p className="text-xs text-gray-500">Earned on {badge.dateEarned}</p>
              </CardContent>
            </Card>
          ))}
          
          <Card>
            <CardContent className="p-4 text-center bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center h-full">
              <div className="text-gray-400 mb-2">
                <Award size={32} />
              </div>
              <p className="text-gray-600 font-medium">More badges to earn!</p>
              <p className="text-sm text-gray-500">Complete sustainability actions</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;