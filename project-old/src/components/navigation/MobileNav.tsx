import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LogIn, Calendar, BarChart2, UserPlus,
  Bookmark, Leaf, Layout, CheckSquare, BookOpen, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { label: 'Home', icon: <Home size={20} />, path: '/' },
    { label: 'Sign In', icon: <LogIn size={20} />, path: '/login' },
    { label: 'Sign Up', icon: <UserPlus size={20} />, path: '/signup' },
    { label: 'View Scheduled Sessions', icon: <Calendar size={20} />, path: '/sessions' },
    { label: 'View Sustainability Leaderboard', icon: <BarChart2 size={20} />, path: '/leaderboard' },
    { label: 'Add Session Bookmarks', icon: <Bookmark size={20} />, path: '/bookmarks' },
    { label: 'Track Sustainability Actions', icon: <Leaf size={20} />, path: '/sustainability' },
    { label: 'Manage User Profile', icon: <Layout size={20} />, path: '/profile' },
    { label: 'Session Check-In', icon: <CheckSquare size={20} />, path: '/check-in' },
    { label: 'Event Bingo Card', icon: <BookOpen size={20} />, path: '/bingo' },
  ];

  const fabVariants = {
    open: { rotate: 180, backgroundColor: '#ef4444' },
    closed: { rotate: 0, backgroundColor: '#16a34a' },
  };

  const menuVariants = {
    open: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    },
    closed: { 
      opacity: 0, 
      y: 20,
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    open: { y: 0, opacity: 1 },
    closed: { y: 20, opacity: 0 }
  };

  return (
    <>
      {/* FAB Navigation Button */}
      <motion.button
        className="fixed z-50 bottom-6 right-6 p-4 rounded-full shadow-lg text-white flex items-center justify-center"
        onClick={toggleMenu}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={fabVariants}
        aria-label="Navigation menu"
        aria-expanded={isOpen}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeMenu();
            }}
          >
            <motion.div
              className="w-full bg-white rounded-t-2xl p-6 pb-20 max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <motion.nav variants={menuVariants} initial="closed" animate="open">
                <ul className="space-y-3">
                  {navItems.map((item) => (
                    <motion.li key={item.path} variants={itemVariants}>
                      <NavLink
                        to={item.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `flex items-center p-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-100 text-primary-700'
                              : 'hover:bg-gray-100'
                          }`
                        }
                      >
                        <span className="mr-3 text-primary-600">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;