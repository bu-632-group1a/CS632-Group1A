import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Badge, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import SessionCard from '../components/sessions/SessionCard';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { sessions } = useApp();
  
  const featuredSessions = sessions.slice(0, 2);

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
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.section 
        className="relative rounded-2xl bg-gradient-to-br from-primary-700 to-secondary-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative p-8 lg:p-12 text-white">
          <motion.h1 
            className="text-3xl lg:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Project Management in Practice 2025
          </motion.h1>
          <motion.p 
            className="text-lg lg:text-xl max-w-2xl mb-6 text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Join us for a transformative experience dedicated to exploring the intersection of AI and project management.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-x-4"
          >
            <Link to="/sessions">
              <Button 
                size="lg" 
                variant="outline"
                icon={<Calendar size={20} />}
                className="border-white text-white hover:bg-white/20"
              >
                View Schedule
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/20"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Welcome Back Section (for authenticated users) */}
      {isAuthenticated && user && (
        <motion.section 
          className="bg-white rounded-xl shadow-soft p-6"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center space-x-4 mb-4">
            <img 
              src={user.avatar || 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg'} 
              alt={user.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}!</h2>
              <p className="text-gray-600">Your conference journey continues.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-primary-50 rounded-lg p-4 flex items-center">
              <div className="bg-primary-100 p-2 rounded-lg mr-3">
                <Badge size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Points Earned</p>
                <p className="text-lg font-bold text-primary-700">{user.sustainabilityScore} pts</p>
              </div>
            </div>
            
            <div className="bg-secondary-50 rounded-lg p-4 flex items-center">
              <div className="bg-secondary-100 p-2 rounded-lg mr-3">
                <Award size={20} className="text-secondary-700" />
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
          
          <div className="flex justify-end">
            <Link to="/profile">
              <Button 
                variant="ghost" 
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                View Profile
              </Button>
            </Link>
          </div>
        </motion.section>
      )}
      
      {/* Featured Sessions */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h2 
            className="text-2xl font-bold text-gray-900"
            variants={itemVariants}
          >
            Featured Sessions
          </motion.h2>
          <motion.div variants={itemVariants}>
            <Link to="/sessions">
              <Button 
                variant="ghost" 
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                View All
              </Button>
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredSessions.map((session) => (
            <motion.div key={session.id} variants={itemVariants}>
              <SessionCard session={session} />
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      {/* About the Event */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div 
          className="lg:col-span-2"
          variants={itemVariants}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
              <p className="text-gray-600 mb-4">
                The Project Management in Practice Conference brings together industry experts, practitioners, and thought leaders to explore the evolving landscape of project management.
              </p>
              <p className="text-gray-600 mb-4">
                This year's focus is on the intersection of AI and project management, featuring keynote speeches, panel discussions, and hands-on workshops across two days of engaging content.
              </p>
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Event Highlights:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>Expert speakers from PMI and industry leaders</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>Interactive panel discussions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>Vendor demonstrations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>Networking opportunities</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-lg mr-3">
                    <Calendar size={20} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Date & Time</p>
                    <p className="text-gray-600">June 13-14, 2025</p>
                    <p className="text-gray-600">9:00 AM - 5:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-lg mr-3">
                    <Users size={20} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">665 Commonwealth Ave</p>
                    <p className="text-gray-600">Boston, MA 02215</p>
                  </div>
                </div>
                
                <a 
                  href="https://www.eventbrite.com/e/19th-annual-project-management-in-practice-conference-boston-usa-2025-tickets-1001420223847?aff=oddtdtcreator"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="lg"
                    className="mt-4"
                  >
                    Register Now
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default HomePage;