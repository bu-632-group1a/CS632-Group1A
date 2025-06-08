import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Leaf, AlertCircle, Home } from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { CREATE_SUSTAINABILITY_ACTION } from '../../graphql/mutations';
import { GET_SUSTAINABILITY_ACTIONS, GET_SUSTAINABILITY_METRICS, ME } from '../../graphql/queries';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface ActionFormProps {
  onSuccess?: () => void;
}

interface FormInputs {
  actionType: string;
  description: string;
}

const actionTypes = [
  { value: 'REUSABLE_BOTTLE', label: 'Used Reusable Bottle' },
  { value: 'PUBLIC_TRANSPORT', label: 'Used Public Transport' },
  { value: 'COMPOSTING', label: 'Composted Waste' },
  { value: 'RECYCLING', label: 'Recycled Materials' },
  { value: 'DIGITAL_OVER_PRINT', label: 'Used Digital Materials' },
  { value: 'RIDESHARE', label: 'Shared Ride' },
  { value: 'ENERGY_SAVING', label: 'Saved Energy' },
  { value: 'WATER_CONSERVATION', label: 'Conserved Water' },
  { value: 'WASTE_REDUCTION', label: 'Reduced Waste' },
  { value: 'OTHER', label: 'Describe' },
];

const ActionForm: React.FC<ActionFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  
  // Safe query execution with error handling
  const { data: userData, error: userError } = useQuery(ME, {
    skip: !user,
    errorPolicy: 'all'
  });
  
  // Safely extract user data with fallbacks
  const currentUser = userData?.me || null;
  const userId = currentUser?.id || user?.id || null;
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>();
  
  const [createAction, { loading, error }] = useMutation(CREATE_SUSTAINABILITY_ACTION, {
    errorPolicy: 'all',
    update(cache, result) {
      try {
        // Safely destructure the result
        const newAction = result?.data?.createSustainabilityAction;
        if (!newAction || !userId) return;

        // Update actions cache
        try {
          const existingActions = cache.readQuery({
            query: GET_SUSTAINABILITY_ACTIONS,
            variables: {
              filter: { userId }
            }
          });
          
          if (existingActions?.sustainabilityActions) {
            cache.writeQuery({
              query: GET_SUSTAINABILITY_ACTIONS,
              variables: {
                filter: { userId }
              },
              data: {
                sustainabilityActions: [
                  newAction,
                  ...existingActions.sustainabilityActions,
                ],
              },
            });
          }
        } catch (cacheError) {
          console.warn('Failed to update actions cache:', cacheError);
        }

        // Update metrics cache
        try {
          const existingMetrics = cache.readQuery({
            query: GET_SUSTAINABILITY_METRICS,
            variables: { userId }
          });
          
          if (existingMetrics?.sustainabilityMetrics && newAction.impactScore) {
            cache.writeQuery({
              query: GET_SUSTAINABILITY_METRICS,
              variables: { userId },
              data: {
                sustainabilityMetrics: {
                  ...existingMetrics.sustainabilityMetrics,
                  totalActions: (existingMetrics.sustainabilityMetrics.totalActions || 0) + 1,
                  totalImpact: (existingMetrics.sustainabilityMetrics.totalImpact || 0) + newAction.impactScore,
                },
              },
            });
          }
        } catch (cacheError) {
          console.warn('Failed to update metrics cache:', cacheError);
        }
      } catch (updateError) {
        console.warn('Cache update failed:', updateError);
      }
    },
    onCompleted: (data) => {
      try {
        if (data?.createSustainabilityAction) {
          reset();
          onSuccess?.();
        }
      } catch (completedError) {
        console.warn('onCompleted handler error:', completedError);
      }
    },
    onError: (error) => {
      console.error('Error creating sustainability action:', error);
      // Log the specific error details for debugging
      if (error.graphQLErrors?.length > 0) {
        console.error('GraphQL Errors:', error.graphQLErrors);
      }
      if (error.networkError) {
        console.error('Network Error:', error.networkError);
      }
    }
  });

  const onSubmit = async (data: FormInputs) => {
    if (!userId) {
      console.error('No user ID available for action creation');
      return;
    }

    try {
      console.log('Submitting sustainability action:', {
        actionType: data.actionType,
        description: data.description || '',
        userId: userId,
        performedAt: new Date().toISOString(),
      });

      await createAction({
        variables: {
          input: {
            actionType: data.actionType,
            description: data.description || '',
            userId: userId,
            performedAt: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      console.error('Error creating action:', err);
    }
  };

  // Show user error if ME query failed
  if (userError) {
    console.warn('User query error:', userError);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl shadow-soft p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="bg-primary-100 p-2 rounded-full mr-4">
            <Leaf className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Log Sustainability Action</h2>
            <p className="text-sm sm:text-base text-gray-600">Record your eco-friendly actions</p>
          </div>
        </div>
        <Link to="/" className="self-start sm:self-auto">
          <Button
            variant="ghost"
            icon={<Home size={20} />}
            className="text-gray-600 hover:text-gray-900"
            size="sm"
          >
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 sm:p-4 bg-red-50 rounded-lg flex items-start"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-red-700 font-medium text-sm sm:text-base">Failed to save action</p>
            <p className="text-red-600 text-xs sm:text-sm mt-1 break-words">
              {error.graphQLErrors?.[0]?.message || error.message || 'Please try again.'}
            </p>
            {error.graphQLErrors?.length > 0 && (
              <details className="mt-2">
                <summary className="text-red-600 text-xs cursor-pointer">Technical Details</summary>
                <pre className="text-red-500 text-xs mt-1 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(error.graphQLErrors, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Type *
          </label>
          <select
            {...register('actionType', { required: 'Please select an action type' })}
            className={`
              w-full rounded-lg border ${errors.actionType ? 'border-red-500' : 'border-gray-300'}
              px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base
            `}
          >
            <option value="">Select an action</option>
            {actionTypes.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.actionType && (
            <p className="mt-1 text-sm text-red-600">{errors.actionType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
            placeholder="Add any additional details about your action..."
          />
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={loading}
          icon={<Leaf size={20} />}
          disabled={!userId}
          size="lg"
        >
          {!userId ? 'Sign In to Log Action' : 'Log Action'}
        </Button>

        {!userId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> You need to be signed in to save your sustainability actions and track your progress.
            </p>
          </div>
        )}
      </div>
    </motion.form>
  );
};

export default ActionForm;