import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Home, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import BingoAdminPanel from '../components/bingo/BingoAdminPanel';
import { useAuth } from '../context/AuthContext';

const BingoAdminPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-1"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Bingo Administration
          </motion.h1>
          <motion.p 
            className="text-gray-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Manage bingo items, view statistics, and monitor player progress
          </motion.p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-primary-50 px-3 py-2 rounded-lg">
            <Shield size={16} className="text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-800">
              Admin: {user?.fullName}
            </span>
          </div>
          <Link to="/bingo">
            <Button
              variant="outline"
              icon={<Settings size={20} />}
              className="text-gray-600 hover:text-gray-900"
            >
              Player View
            </Button>
          </Link>
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BingoAdminPanel />
      </motion.div>
    </motion.div>
  );
};

export default BingoAdminPage;