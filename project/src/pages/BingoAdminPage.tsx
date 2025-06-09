import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Home, Shield, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import BingoAdminPanel from '../components/bingo/BingoAdminPanel';
import { useAuth } from '../context/AuthContext';

const BingoAdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated and is admin
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You need to be signed in to access the admin panel.</p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <Shield size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
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

      {/* Admin badge and buttons below headers, stacked on mobile */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 justify-start w-full mt-4">
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

      {/* Admin Panel */}
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