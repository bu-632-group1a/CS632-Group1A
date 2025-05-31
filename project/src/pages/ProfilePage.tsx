import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSustainability } from '../contexts/SustainabilityContext';
import { User, Settings, Camera, Mail, Building, Award, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { userScore, impactData } = useSustainability();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || '',
    title: user?.title || ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow rounded-lg overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-primary-600 to-primary-800">
            <div className="absolute -bottom-12 left-8">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-24 w-24 rounded-full border-4 border-white"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-4 border-white bg-primary-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
              )}
            </div>
            <button
              className="absolute bottom-2 right-4 text-white hover:text-primary-100"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>

          {/* Profile Info */}
          <div className="pt-16 px-8 pb-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      {user?.email}
                    </div>
                    {user?.organization && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-1" />
                        {user.organization}
                      </div>
                    )}
                    {user?.title && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Award className="h-4 w-4 mr-1" />
                        {user.title}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Edit Profile
                  </button>
                </div>

                {/* Sustainability Stats */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Sustainability Impact</h3>
                  <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-primary-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="truncate text-sm font-medium text-primary-800">Total Score</dt>
                      <dd className="mt-1 text-3xl font-semibold text-primary-900">{userScore}</dd>
                    </div>
                    <div className="bg-green-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="truncate text-sm font-medium text-green-800">Paper Saved</dt>
                      <dd className="mt-1 text-3xl font-semibold text-green-900">
                        {impactData.paperSaved}
                        <span className="text-sm font-normal"> sheets</span>
                      </dd>
                    </div>
                    <div className="bg-blue-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="truncate text-sm font-medium text-blue-800">CO₂ Reduced</dt>
                      <dd className="mt-1 text-3xl font-semibold text-blue-900">
                        {impactData.co2Reduced.toFixed(1)}
                        <span className="text-sm font-normal"> kg</span>
                      </dd>
                    </div>
                    <div className="bg-purple-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="truncate text-sm font-medium text-purple-800">Plastic Avoided</dt>
                      <dd className="mt-1 text-3xl font-semibold text-purple-900">
                        {impactData.plasticAvoided}
                        <span className="text-sm font-normal"> items</span>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Badges and Achievements */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Badges & Achievements</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {user?.completedBingoSquares && user.completedBingoSquares.length >= 5 && (
                      <div className="flex flex-col items-center p-4 bg-accent-50 rounded-lg">
                        <Award className="h-8 w-8 text-accent-600" />
                        <p className="mt-2 text-sm font-medium text-accent-900">Bingo Master</p>
                      </div>
                    )}
                    {userScore >= 100 && (
                      <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                        <Leaf className="h-8 w-8 text-green-600" />
                        <p className="mt-2 text-sm font-medium text-green-900">Eco Warrior</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;