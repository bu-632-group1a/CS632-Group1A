import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, BarChart3, Users, Trophy, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { 
  GET_BINGO_ITEMS, 
  GET_BINGO_STATS, 
  GET_BINGO_LEADERBOARD 
} from '../../graphql/queries';
import { 
  CREATE_BINGO_ITEM, 
  UPDATE_BINGO_ITEM 
} from '../../graphql/mutations';

interface BingoItemForm {
  text: string;
  position: number;
  category: string;
  points: number;
  isActive: boolean;
}

const BingoAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'stats' | 'leaderboard'>('items');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<BingoItemForm>({
    text: '',
    position: 1,
    category: 'GENERAL',
    points: 10,
    isActive: true
  });

  const { data: itemsData, loading: itemsLoading, error: itemsError } = useQuery(GET_BINGO_ITEMS, {
    errorPolicy: 'all'
  });
  
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_BINGO_STATS, {
    errorPolicy: 'all'
  });
  
  const { data: leaderboardData, loading: leaderboardLoading, error: leaderboardError } = useQuery(GET_BINGO_LEADERBOARD, {
    variables: { limit: 10 },
    errorPolicy: 'all'
  });

  const [createBingoItem, { loading: creating }] = useMutation(CREATE_BINGO_ITEM, {
    refetchQueries: [{ query: GET_BINGO_ITEMS }],
    onCompleted: () => {
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating bingo item:', error);
    }
  });

  const [updateBingoItem, { loading: updating }] = useMutation(UPDATE_BINGO_ITEM, {
    refetchQueries: [{ query: GET_BINGO_ITEMS }],
    onCompleted: () => {
      setEditingItem(null);
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating bingo item:', error);
    }
  });

  // FIX: Create a mutable copy of the array before sorting
  const bingoItems = React.useMemo(() => {
    if (!itemsData?.bingoItems) return [];
    // Create a shallow copy to avoid mutating the Apollo cache
    return [...itemsData.bingoItems];
  }, [itemsData?.bingoItems]);

  const stats = statsData?.bingoStats;
  
  // FIX: Create a mutable copy of the leaderboard array
  const leaderboard = React.useMemo(() => {
    if (!leaderboardData?.bingoLeaderboard) return [];
    return [...leaderboardData.bingoLeaderboard];
  }, [leaderboardData?.bingoLeaderboard]);

  const categories = [
    'TRANSPORT', 'ENERGY', 'WASTE', 'WATER', 
    'FOOD', 'COMMUNITY', 'DIGITAL', 'GENERAL'
  ];

  const resetForm = () => {
    setFormData({
      text: '',
      position: 1,
      category: 'GENERAL',
      points: 10,
      isActive: true
    });
  };

  const handleCreateItem = async () => {
    if (!formData.text.trim()) return;

    try {
      await createBingoItem({
        variables: {
          input: {
            text: formData.text.trim(),
            position: formData.position,
            category: formData.category,
            points: formData.points,
            isActive: formData.isActive
          }
        }
      });
    } catch (error) {
      // Error handled by onError callback
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!formData.text.trim()) return;

    try {
      await updateBingoItem({
        variables: {
          id: itemId,
          input: {
            text: formData.text.trim(),
            position: formData.position,
            category: formData.category,
            points: formData.points,
            isActive: formData.isActive
          }
        }
      });
    } catch (error) {
      // Error handled by onError callback
    }
  };

  const startEditing = (item: any) => {
    setEditingItem(item.id);
    setFormData({
      text: item.text,
      position: item.position,
      category: item.category,
      points: item.points,
      isActive: item.isActive
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setShowCreateForm(false);
    resetForm();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'TRANSPORT': 'primary',
      'ENERGY': 'secondary',
      'WASTE': 'success',
      'WATER': 'info',
      'FOOD': 'warning',
      'COMMUNITY': 'danger',
      'DIGITAL': 'primary',
      'GENERAL': 'default'
    };
    return colors[category] || 'default';
  };

  const tabs = [
    { id: 'items', label: 'Manage Items', icon: <Edit2 size={18} /> },
    { id: 'stats', label: 'Statistics', icon: <BarChart3 size={18} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> }
  ];

  // Show error state if there are critical errors
  if (itemsError && statsError && leaderboardError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-700">
            <AlertCircle size={20} className="mr-2" />
            <div>
              <h3 className="font-medium">Unable to load admin panel</h3>
              <p className="text-sm text-red-600 mt-1">
                There was an error connecting to the bingo service. Please try again later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-primary-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bingo Administration</h2>
          <div className="flex items-center space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 hover:bg-primary-100'}
                `}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {/* Items Management Tab */}
          {activeTab === 'items' && (
            <motion.div
              key="items"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Bingo Items</h3>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  icon={<Plus size={18} />}
                  disabled={showCreateForm}
                >
                  Add New Item
                </Button>
              </div>

              {itemsError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle size={20} className="text-amber-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-amber-900">Limited Functionality</h4>
                      <p className="text-sm text-amber-800">
                        Unable to load items from the server. You can still view cached data.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Form */}
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 p-4 rounded-lg mb-6"
                >
                  <h4 className="font-medium text-gray-900 mb-4">Create New Bingo Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Text"
                        value={formData.text}
                        onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Enter bingo item text..."
                        fullWidth
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="number"
                        min="1"
                        max="16"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.points}
                        onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={handleCreateItem}
                      isLoading={creating}
                      icon={<Save size={18} />}
                    >
                      Create Item
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelEditing}
                      icon={<X size={18} />}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Items List */}
              {itemsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto" />
                </div>
              ) : bingoItems.length > 0 ? (
                <div className="space-y-3">
                  {/* FIX: Sort the already-copied array safely */}
                  {bingoItems
                    .sort((a: any, b: any) => a.position - b.position)
                    .map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      {editingItem === item.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <Input
                                label="Text"
                                value={formData.text}
                                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                                fullWidth
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                              <input
                                type="number"
                                min="1"
                                max="16"
                                value={formData.position}
                                onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                              <input
                                type="number"
                                min="0"
                                value={formData.points}
                                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </div>
                            <div className="flex items-center">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.isActive}
                                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                  className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleUpdateItem(item.id)}
                              isLoading={updating}
                              icon={<Save size={18} />}
                            >
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={cancelEditing}
                              icon={<X size={18} />}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">#{item.position}</span>
                              <Badge 
                                variant={getCategoryColor(item.category) as any}
                                size="sm"
                              >
                                {item.category}
                              </Badge>
                              <span className="text-sm text-gray-500">{item.points} pts</span>
                              {!item.isActive && (
                                <Badge variant="danger" size="sm">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-gray-900">{item.text}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(item)}
                              icon={<Edit2 size={16} />}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No bingo items found. Create your first item to get started.
                </div>
              )}
            </motion.div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Bingo Statistics</h3>
              
              {statsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto" />
                </div>
              ) : statsError ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle size={20} className="text-amber-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-amber-900">Statistics Unavailable</h4>
                      <p className="text-sm text-amber-800">
                        Unable to load statistics from the server.
                      </p>
                    </div>
                  </div>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-primary-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {stats.totalGames}
                    </div>
                    <div className="text-sm text-gray-600">Total Games</div>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-secondary-600 mb-2">
                      {stats.completedGames}
                    </div>
                    <div className="text-sm text-gray-600">Completed Games</div>
                  </div>
                  <div className="bg-accent-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-accent-600 mb-2">
                      {stats.totalBingos}
                    </div>
                    <div className="text-sm text-gray-600">Total Bingos</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.round(stats.averageCompletionRate)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Completion</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No statistics available yet.
                </div>
              )}
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Bingo Leaderboard</h3>
              
              {leaderboardLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto" />
                </div>
              ) : leaderboardError ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle size={20} className="text-amber-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-amber-900">Leaderboard Unavailable</h4>
                      <p className="text-sm text-amber-800">
                        Unable to load leaderboard from the server.
                      </p>
                    </div>
                  </div>
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry: any, index: number) => {
                    // FIXED: Get display name from multiple sources with proper fallback
                    const displayName = entry.user?.fullName || 
                                      entry.fullName || 
                                      (entry.user?.firstName && entry.user?.lastName ? 
                                        `${entry.user.firstName} ${entry.user.lastName}` : 
                                        entry.user?.firstName) ||
                                      `User ${entry.userId}`;
                    
                    const profilePicture = entry.user?.profilePicture || 
                                         entry.profilePicture || 
                                         'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg';
                    
                    const location = entry.user?.location || entry.location;
                    const company = entry.user?.company || entry.company;
                    
                    return (
                      <div
                        key={entry.userId}
                        className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-sm font-bold text-primary-600">
                              {entry.rank}
                            </span>
                          </div>
                          <div className="flex items-center mr-4">
                            <img 
                              src={profilePicture}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{displayName}</p>
                              <div className="text-sm text-gray-500">
                                <span>{entry.completedItemsCount} items • {entry.bingosCount} bingos</span>
                                {(location || company) && (
                                  <span className="ml-2">
                                    • {[company, location].filter(Boolean).join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            {entry.totalPoints} pts
                          </div>
                          {entry.isCompleted && (
                            <Badge variant="success" size="sm">Completed</Badge>
                          )}
                          {entry.gameCompletedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Completed {new Date(entry.gameCompletedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No leaderboard data available yet.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default BingoAdminPanel;