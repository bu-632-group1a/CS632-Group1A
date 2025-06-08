import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { Leaf, BarChart2, AlertCircle } from 'lucide-react';
import { GET_SUSTAINABILITY_ACTIONS, GET_SUSTAINABILITY_METRICS, ME } from '../graphql/queries';
import ActionForm from '../components/sustainability/ActionForm';
import ImpactAnimation from '../components/sustainability/ImpactAnimation';
import Card, { CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const SustainabilityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: userData } = useQuery(ME, {
    skip: !isAuthenticated // Only execute query when user is authenticated
  });
  const currentUser = userData?.me;
  
  // Use the user ID from JWT token instead of name
  const userId = currentUser?.id || user?.id || 'anonymous';
  
  const { data: metricsData, loading: metricsLoading, error: metricsError } = useQuery(GET_SUSTAINABILITY_METRICS, {
    variables: { userId },
    skip: !userId || userId === 'anonymous'
  });
  
  const { data: actionsData, loading: actionsLoading, error: actionsError } = useQuery(GET_SUSTAINABILITY_ACTIONS, {
    variables: { 
      filter: { userId }
    },
    skip: !userId || userId === 'anonymous'
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

  if (metricsError || actionsError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">Failed to load sustainability data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Sustainability Impact</h1>
        <p className="text-gray-600">Track and visualize your eco-friendly actions</p>
        {!isAuthenticated && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              <strong>Note:</strong> Sign in to save your sustainability actions and track your progress over time.
            </p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ActionForm />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 p-2 rounded-full mr-4">
                  <BarChart2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Impact</h2>
                  <p className="text-gray-600">Watch your impact grow</p>
                </div>
              </div>

              {metricsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
                </div>
              ) : (
                <ImpactAnimation
                  score={metricsData?.sustainabilityMetrics?.totalImpact || 0}
                  maxScore={1000}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Actions</h2>
        <div className="space-y-4">
          {actionsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white h-20 rounded-lg" />
              ))}
            </div>
          ) : actionsData?.sustainabilityActions?.length > 0 ? (
            actionsData.sustainabilityActions.map((action: any) => (
              <motion.div
                key={action.id}
                className="bg-white rounded-lg p-4 shadow-soft"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="bg-primary-100 p-2 rounded-full mr-4">
                    <Leaf className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{action.actionType.replace(/_/g, ' ')}</h3>
                    {action.description && (
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(action.performedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-primary-100 text-primary-800 text-sm px-2 py-1 rounded-full">
                      +{action.impactScore} pts
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No actions logged yet</h3>
              <p className="text-gray-600">
                Start logging your sustainability actions to track your environmental impact.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SustainabilityPage;