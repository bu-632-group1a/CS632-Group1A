import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, BarChart2, Bookmark, Leaf, Layout, 
  CheckSquare, BookOpen, Home, Sprout, LogIn, 
  UserPlus, LogOut, CalendarDays, Settings, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const getNavItems = () => {
    const commonItems = [
      { label: 'Home', icon: <Home size={20} />, path: '/' },
      { label: 'View Scheduled Sessions', icon: <Calendar size={20} />, path: '/sessions' },
      { label: 'View Sustainability Leaderboard', icon: <BarChart2 size={20} />, path: '/leaderboard' },
    ];

    const authenticatedItems = [
      { label: 'My Calendar', icon: <CalendarDays size={20} />, path: '/calendar' },
      { label: 'View Session Bookmarks', icon: <Bookmark size={20} />, path: '/bookmarks' },
      { label: 'Track Sustainability Actions', icon: <Leaf size={20} />, path: '/sustainability' },
      { label: 'Manage User Profile', icon: <Layout size={20} />, path: '/profile' },
      { label: 'Session Check-In', icon: <CheckSquare size={20} />, path: '/check-in' },
      { label: 'Event Bingo Card', icon: <BookOpen size={20} />, path: '/bingo' },
    ];

    const adminItems = user?.role === 'ADMIN' ? [
      { label: 'Admin Dashboard', icon: <BarChart3 size={20} />, path: '/admin/dashboard' },
      { label: 'Bingo Administration', icon: <Settings size={20} />, path: '/admin/bingo' },
    ] : [];

    const authItems = isAuthenticated ? [
      ...adminItems,
      { label: 'Sign Out', icon: <LogOut size={20} />, path: '/logout' },
    ] : [
      { label: 'Sign In', icon: <LogIn size={20} />, path: '/login' },
      { label: 'Sign Up', icon: <UserPlus size={20} />, path: '/signup' },
    ];

    return [...commonItems, ...(isAuthenticated ? authenticatedItems : []), ...authItems];
  };

  const sidebarVariants = {
    hidden: { x: -300 },
    visible: { 
      x: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleLogout = async (e: React.MouseEvent, path: string) => {
    if (path === '/logout') {
      e.preventDefault();
      await logout();
    }
  };

  return (
    <motion.aside 
      className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <div className="p-6 border-b border-gray-200">
        <motion.div 
          className="flex items-center space-x-3" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sprout size={28} className="text-primary-600" />
          <h1 className="font-bold text-xl text-gray-900">EcoPulse</h1>
        </motion.div>
      </div>
      
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {getNavItems().map((item) => (
            <motion.li key={item.path} variants={itemVariants}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`
                }
                onClick={(e) => handleLogout(e, item.path)}
              >
                <span className="mr-3 text-primary-600">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>
      
      {isAuthenticated && user && (
        <motion.div 
          className="p-4 border-t border-gray-200 flex items-center"
          variants={itemVariants}
        >
          <div className="flex-shrink-0 mr-3">
            <img 
              src={user.profilePicture || 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg'} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.role === 'ADMIN' ? 'Administrator' : 'User'} • {user.email}
            </p>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;