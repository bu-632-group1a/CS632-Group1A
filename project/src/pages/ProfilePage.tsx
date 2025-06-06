import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Upload, X } from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { UPDATE_PROFILE_PICTURE } from '../graphql/mutations';
import { ME } from '../graphql/queries';

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const { data: userData, loading: userLoading } = useQuery(ME);
  const user = userData?.me;

  const [updateProfilePicture, { loading }] = useMutation(UPDATE_PROFILE_PICTURE, {
    onCompleted: () => {
      setIsEditing(false);
      setError('');
    },
    onError: (error) => {
      setError(error.message);
    },
    refetchQueries: [{ query: ME }]
  });

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600">You need to be signed in to view this page.</p>
        <a href="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">
          Go to login
        </a>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleUpdateImage = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    try {
      await updateProfilePicture({
        variables: {
          input: {
            profilePicture: imageUrl
          }
        }
      });
    } catch (err) {
      // Error is handled by onError callback
    }
  };

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
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-gray-600">Manage your account and review your progress</p>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-xl shadow-soft overflow-hidden"
        variants={itemVariants}
      >
        <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-6">
            <div className="relative">
              <img 
                src={user?.profilePicture || 'https://media.istockphoto.com/id/1298261537/vector/blank-man-profile-head-icon-placeholder.jpg?s=612x612&w=0&k=20&c=CeT1RVWZzQDay4t54ookMaFsdi7ZHVFg2Y5v7hxigCA='} 
                alt={user?.fullName} 
                className="w-32 h-32 rounded-xl border-4 border-white shadow-md object-cover"
              />
              <button 
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md text-primary-600 hover:text-primary-800"
                onClick={() => setIsEditing(true)}
              >
                <Upload size={16} />
              </button>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          {isEditing && (
            <motion.div 
              className="mb-6 bg-gray-50 p-4 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Update Profile Picture</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setIsEditing(false);
                    setImageUrl('');
                    setError('');
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  fullWidth
                />
                <Button
                  onClick={handleUpdateImage}
                  isLoading={loading}
                >
                  Save
                </Button>
              </div>
            </motion.div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Account Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">{user?.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">{user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>
                  <span className="ml-2 text-gray-900">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Member since:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Last updated:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(user?.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;