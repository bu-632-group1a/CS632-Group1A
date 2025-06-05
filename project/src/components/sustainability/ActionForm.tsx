import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Leaf, AlertCircle } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { CREATE_SUSTAINABILITY_ACTION } from '../../graphql/mutations';
import { GET_SUSTAINABILITY_ACTIONS, GET_SUSTAINABILITY_METRICS } from '../../graphql/queries';
import Button from '../ui/Button';

interface ActionFormProps {
  onSuccess?: () => void;
}

interface FormInputs {
  actionType: string;
  description: string;
  performedAt: string;
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
  { value: 'OTHER', label: 'Other Action' },
];

const ActionForm: React.FC<ActionFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>();
  
  const [createAction, { loading, error }] = useMutation(CREATE_SUSTAINABILITY_ACTION, {
    update(cache, { data: { createSustainabilityAction } }) {
      // Update actions list
      const existingActions = cache.readQuery({
        query: GET_SUSTAINABILITY_ACTIONS,
      });
      
      cache.writeQuery({
        query: GET_SUSTAINABILITY_ACTIONS,
        data: {
          sustainabilityActions: [
            createSustainabilityAction,
            ...existingActions?.sustainabilityActions || [],
          ],
        },
      });

      // Update metrics
      const existingMetrics = cache.readQuery({
        query: GET_SUSTAINABILITY_METRICS,
      });
      
      if (existingMetrics?.sustainabilityMetrics) {
        const { sustainabilityMetrics } = existingMetrics;
        cache.writeQuery({
          query: GET_SUSTAINABILITY_METRICS,
          data: {
            sustainabilityMetrics: {
              ...sustainabilityMetrics,
              totalActions: sustainabilityMetrics.totalActions + 1,
              totalImpact: sustainabilityMetrics.totalImpact + createSustainabilityAction.impactScore,
            },
          },
        });
      }
    },
    onCompleted: () => {
      reset();
      onSuccess?.();
    },
  });

  const onSubmit = async (data: FormInputs) => {
    try {
      await createAction({
        variables: {
          input: {
            ...data,
            performedAt: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      console.error('Error creating action:', err);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <div className="flex items-center mb-6">
        <div className="bg-primary-100 p-2 rounded-full mr-4">
          <Leaf className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Log Sustainability Action</h2>
          <p className="text-gray-600">Record your eco-friendly actions</p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-4 bg-red-50 rounded-lg flex items-start"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">Failed to save action. Please try again.</p>
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Type
          </label>
          <select
            {...register('actionType', { required: 'Please select an action type' })}
            className={`
              w-full rounded-lg border ${errors.actionType ? 'border-red-500' : 'border-gray-300'}
              px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500
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
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add any additional details about your action..."
          />
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={loading}
          icon={<Leaf size={20} />}
        >
          Log Action
        </Button>
      </div>
    </motion.form>
  );
};

export default ActionForm;