import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Home, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import SessionCard from '../components/sessions/SessionCard';
import { SessionSkeleton } from '../components/ui/SkeletonLoader';
import { useApp } from '../context/AppContext';

const SessionsPage: React.FC = () => {
  const { sessions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Simulate loading
  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [categoryFilter, dayFilter]);

  const categories = ['all', ...new Set(sessions.map(session => session.category.toLowerCase()))];
  const days = [
    { value: 'all', label: 'All Days' },
    { value: '2025-06-13', label: 'Day 1 (June 13)' },
    { value: '2025-06-14', label: 'Day 2 (June 14)' }
  ];

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.speaker.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesCategory = categoryFilter === 'all' || session.category.toLowerCase() === categoryFilter;
    const matchesDay = dayFilter === 'all' || session.date === dayFilter;
    
    return matchesSearch && matchesCategory && matchesDay;
  });

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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sessions</h1>
          <p className="text-gray-600">Explore all the sessions at the Project Management in Practice Conference</p>
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
      
      <motion.div
        className="bg-white rounded-xl shadow-soft p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex-1">
            <Input
              placeholder="Search sessions, speakers, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
              fullWidth
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center">
                <Calendar size={18} className="mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Conference Day</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {days.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDayFilter(value)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                      ${dayFilter === value 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center">
                <Filter size={18} className="mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Category</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                      ${categoryFilter === category 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {loading ? (
        <SessionSkeleton />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <motion.div key={session.id} variants={itemVariants}>
                  <SessionCard session={session} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full text-center py-12"
                variants={itemVariants}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default SessionsPage;