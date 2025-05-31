import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSustainability } from '../../contexts/SustainabilityContext';
import { Leaf, Menu, X, User, Calendar, Award, QrCode, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { userScore } = useSustainability();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Sessions', path: '/sessions' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  const authenticatedLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'My Agenda', path: '/agenda', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Sustainability', path: '/sustainability', icon: <Leaf className="w-5 h-5" /> },
    { name: 'Bingo', path: '/bingo', icon: <Award className="w-5 h-5" /> },
    { name: 'QR Scanner', path: '/scanner', icon: <QrCode className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Leaf className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">EcoPulse</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    location.pathname === link.path
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' || user?.role === 'organizer' ? (
                  <Link
                    to="/admin"
                    className="mx-3 px-3 py-1 text-sm rounded-full bg-secondary-100 text-secondary-800 hover:bg-secondary-200"
                  >
                    Admin
                  </Link>
                ) : null}
                <div className="mx-3 px-3 py-1 text-sm rounded-full bg-primary-100 text-primary-800">
                  <Leaf className="inline-block w-4 h-4 mr-1" /> {userScore} pts
                </div>
                <div className="ml-3 relative">
                  <div className="group relative">
                    <button
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => navigate('/profile')}
                    >
                      {user?.avatarUrl ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.avatarUrl}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </button>
                    <div className="hidden group-hover:block absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-gray-500 truncate">{user?.email}</p>
                      </div>
                      {authenticatedLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {link.icon}
                          <span className="ml-2">{link.name}</span>
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                location.pathname === link.path
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
        {isAuthenticated ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              {user?.avatarUrl ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={user.avatarUrl}
                  alt={user.name}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-800">
                  <User className="h-6 w-6" />
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
              <div className="ml-auto px-3 py-1 text-sm rounded-full bg-primary-100 text-primary-800">
                <Leaf className="inline-block w-4 h-4 mr-1" /> {userScore} pts
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {authenticatedLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  <span className="ml-2">{link.name}</span>
                </Link>
              ))}
              {user?.role === 'admin' || user?.role === 'organizer' ? (
                <Link
                  to="/admin"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="ml-2">Admin</span>
                </Link>
              ) : null}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center justify-around">
              <Link
                to="/login"
                className="flex-1 mx-4 text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="flex-1 mx-4 text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;