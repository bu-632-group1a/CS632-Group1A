import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, Calendar, CheckSquare, Bookmark, 
  TrendingUp, Filter, Search, Home, Shield, AlertCircle,
  Download, RefreshCw, Eye, UserCheck, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { AdminService, UserAnalytics, DashboardStats } from '../services/adminService';
import { ME } from '../graphql/queries';

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: userData } = useQuery(ME, { skip: !isAuthenticated });
  const currentUser = userData?.me;

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [sortBy, setSortBy] = useState<'bookmarks' | 'checkins' | 'engagement' | 'total'>('total');
  const [showTopUsersOnly, setShowTopUsersOnly] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'ADMIN' || user?.role === 'ADMIN';

  const loadDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      const [stats, analytics] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getUserAnalytics()
      ]);

      setDashboardStats(stats);
      setUserAnalytics(analytics);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // Filter and sort user analytics
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = userAnalytics;

    // Apply user filter
    if (userFilter.trim()) {
      const filterLower = userFilter.toLowerCase();
      filtered = filtered.filter(user => 
        user.userId.toLowerCase().includes(filterLower) ||
        user.fullName?.toLowerCase().includes(filterLower)
      );
    }

    // Apply top users filter
    if (showTopUsersOnly) {
      filtered = filtered.filter(user => 
        user.bookmarksCount > 0 || user.checkInsCount > 0
      );
    }

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'bookmarks':
          return b.bookmarksCount - a.bookmarksCount;
        case 'checkins':
          return b.checkInsCount - a.checkInsCount;
        case 'engagement':
          return b.engagementRate - a.engagementRate;
        case 'total':
        default:
          return (b.bookmarksCount + b.checkInsCount) - (a.bookmarksCount + a.checkInsCount);
      }
    });

    return filtered;
  }, [userAnalytics, userFilter, sortBy, showTopUsersOnly]);

  const exportData = () => {
    const csvContent = [
      ['User ID', 'Full Name', 'Bookmarks', 'Check-ins', 'Engagement Rate (%)'].join(','),
      ...filteredAndSortedUsers.map(user => [
        user.userId,
        user.fullName || 'N/A',
        user.bookmarksCount,
        user.checkInsCount,
        user.engagementRate.toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Check authentication and admin status
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You need to be signed in to access the admin dashboard.</p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-600 mr-2" />
            <div>
              <h3 className="font-medium text-red-900">Failed to Load Dashboard</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => loadDashboardData()} icon={<RefreshCw size={20} />}>
          Retry
        </Button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
      {/* Header */}
      <motion.div 
        className="space-y-2"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-gray-600">Session bookmarks and attendance analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 justify-start w-full mt-2">
          <div className="flex items-center bg-primary-50 px-3 py-2 rounded-lg">
            <Shield size={16} className="text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-800">
              Admin: {currentUser?.fullName || user?.fullName}
            </span>
          </div>
          <Button
            onClick={handleRefresh}
            isLoading={refreshing}
            variant="outline"
            icon={<RefreshCw size={20} />}
            className="text-gray-600 hover:text-gray-900"
          >
            Refresh
          </Button>
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
      </motion.div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="bg-primary-50">
                <div className="flex items-center">
                  <BarChart3 size={24} className="text-primary-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Overview Statistics</h2>
                    <p className="text-sm text-gray-600">Platform-wide engagement metrics</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {dashboardStats?.totalUsers || 0}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      <Users size={16} className="mr-1" />
                      Active Users
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {dashboardStats?.totalBookmarks || 0}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      <Bookmark size={16} className="mr-1" />
                      Total Bookmarks
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {dashboardStats?.totalCheckIns || 0}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      <CheckSquare size={16} className="mr-1" />
                      Total Check-ins
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {dashboardStats?.overallEngagementRate.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      <TrendingUp size={16} className="mr-1" />
                      Engagement Rate
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Average Per User</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bookmarks:</span>
                        <span className="font-medium">{dashboardStats?.averageBookmarksPerUser.toFixed(1) || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-ins:</span>
                        <span className="font-medium">{dashboardStats?.averageCheckInsPerUser.toFixed(1) || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Platform Totals</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sessions:</span>
                        <span className="font-medium">{dashboardStats?.totalSessions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Users:</span>
                        <span className="font-medium">{dashboardStats?.totalUsers || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Sessions by Check-ins */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="bg-secondary-50">
                <div className="flex items-center">
                  <Calendar size={24} className="text-secondary-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Top Sessions by Check-ins</h2>
                    <p className="text-sm text-gray-600">Sessions with the most check-ins</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {dashboardStats?.topSessions
                    ?.filter(session => session.checkInsCount > 0)
                    .sort((a, b) => b.checkInsCount - a.checkInsCount)
                    .slice(0, 5)
                    .map((session, index) => (
                      <div key={session.sessionCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-secondary-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{session.sessionName}</h3>
                            <p className="text-sm text-gray-600">Session ID: {session.sessionCode}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{session.checkInsCount}</div>
                            <div className="text-xs text-gray-500">Check-ins</div>
                          </div>
                        </div>
                      </div>
                  ))}
                  {/* Show a message if there are no sessions with check-ins */}
                  {dashboardStats?.topSessions?.filter(session => session.checkInsCount > 0).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Eye size={48} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions with check-ins found</h3>
                      <p className="text-gray-600">No session check-in data available.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Analytics */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="bg-accent-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users size={24} className="text-accent-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">User Analytics</h2>
                      <p className="text-sm text-gray-600">Individual user engagement data</p>
                    </div>
                  </div>
                  <Button
                    onClick={exportData}
                    variant="outline"
                    icon={<Download size={20} />}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by User ID or Full Name..."
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        icon={<Search size={18} />}
                        fullWidth
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="total">Sort by Total Activity</option>
                        <option value="bookmarks">Sort by Bookmarks</option>
                        <option value="checkins">Sort by Check-ins</option>
                        <option value="engagement">Sort by Engagement Rate</option>
                      </select>
                      <button
                        onClick={() => setShowTopUsersOnly(!showTopUsersOnly)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${showTopUsersOnly 
                            ? 'bg-primary-100 text-primary-800' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                      >
                        <Filter size={16} className="inline mr-1" />
                        Active Only
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredAndSortedUsers.length} of {userAnalytics.length} users
                </div>

                {/* User List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredAndSortedUsers.length > 0 ? (
                    filteredAndSortedUsers.map((user) => (
                      <motion.div
                        key={user.userId}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                              <UserCheck size={20} className="text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {user.fullName || `User ${user.userId}`}
                              </h3>
                              <p className="text-sm text-gray-600">ID: {user.userId}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{user.bookmarksCount}</div>
                              <div className="text-xs text-gray-500">Bookmarks</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{user.checkInsCount}</div>
                              <div className="text-xs text-gray-500">Check-ins</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">{user.engagementRate.toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">Engagement</div>
                            </div>
                            <div className="text-center">
                              <Badge 
                                variant={user.engagementRate >= 80 ? 'success' : user.engagementRate >= 50 ? 'warning' : 'default'}
                                size="sm"
                              >
                                {user.engagementRate >= 80 ? 'High' : user.engagementRate >= 50 ? 'Medium' : 'Low'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye size={48} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
export default AdminDashboardPage;