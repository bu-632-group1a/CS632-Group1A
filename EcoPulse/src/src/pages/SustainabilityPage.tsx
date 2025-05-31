import React, { useState } from 'react';
import { useSustainability } from '../contexts/SustainabilityContext';
import { Leaf, Plus, CheckCircle, AlertCircle, DropletIcon, Recycle, Bus, Salad, Battery, LightbulbOff } from 'lucide-react';
import { SustainabilityActionType } from '../types';
import { motion } from 'framer-motion';

const SustainabilityPage: React.FC = () => {
  const { userScore, userActions, impactData, logAction, isLoading } = useSustainability();
  const [showForm, setShowForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<SustainabilityActionType | null>(null);
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Define the available sustainability actions
  const actionTypes: Array<{ type: SustainabilityActionType; label: string; description: string; icon: React.ReactNode; points: number }> = [
    {
      type: 'reusable_bottle',
      label: 'Reusable Bottle',
      description: 'Used a reusable water bottle instead of disposable cups',
      icon: <DropletIcon className="h-5 w-5" />,
      points: 10
    },
    {
      type: 'vegetarian_meal',
      label: 'Vegetarian Meal',
      description: 'Chose a vegetarian meal option',
      icon: <Salad className="h-5 w-5" />,
      points: 15
    },
    {
      type: 'public_transport',
      label: 'Public Transport',
      description: 'Used public transportation to get to the conference',
      icon: <Bus className="h-5 w-5" />,
      points: 20
    },
    {
      type: 'digital_materials',
      label: 'Digital Materials',
      description: 'Used digital materials instead of printed handouts',
      icon: <Leaf className="h-5 w-5" />,
      points: 5
    },
    {
      type: 'waste_recycling',
      label: 'Recycling',
      description: 'Properly sorted waste into recycling bins',
      icon: <Recycle className="h-5 w-5" />,
      points: 10
    },
    {
      type: 'energy_saving',
      label: 'Energy Saving',
      description: 'Turned off lights or equipment when not in use',
      icon: <LightbulbOff className="h-5 w-5" />,
      points: 5
    },
    {
      type: 'water_conservation',
      label: 'Water Conservation',
      description: 'Conserved water by using less or reporting leaks',
      icon: <Battery className="h-5 w-5" />,
      points: 5
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAction) {
      setErrorMessage('Please select an action type');
      return;
    }

    try {
      await logAction(selectedAction, description);
      setSuccessMessage(`Successfully logged ${
        actionTypes.find(a => a.type === selectedAction)?.label
      } action!`);
      setDescription('');
      setSelectedAction(null);
      setShowForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to log action');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Get action details by type
  const getActionDetails = (type: SustainabilityActionType) => {
    return actionTypes.find(a => a.type === type);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
            <Leaf className="h-8 w-8 mr-2 text-primary-600" />
            Sustainability Tracker
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Track your eco-friendly actions and see your impact
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Log Action
          </button>
        </div>
      </div>

      {successMessage && (
        <motion.div
          className="rounded-md bg-green-50 p-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </motion.div>
      )}

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Log Action Form */}
      {showForm && (
        <motion.div
          className="bg-white shadow sm:rounded-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Log a Sustainability Action</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Select the type of eco-friendly action you've taken at the conference.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                {actionTypes.map((action) => (
                  <div
                    key={action.type}
                    className={`relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-primary-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 cursor-pointer ${
                      selectedAction === action.type ? 'border-primary-500 ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedAction(action.type)}
                  >
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      selectedAction === action.type ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="focus:outline-none">
                        <p className="text-sm font-medium text-gray-900">{action.label}</p>
                        <p className="text-xs text-gray-500 truncate">{action.points} points</p>
                      </div>
                    </div>
                    {selectedAction === action.type && (
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add details about your action..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedAction(null);
                    setDescription('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedAction || isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging...' : 'Log Action'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Sustainability Impact */}
      <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-lg shadow overflow-hidden mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Environmental Impact</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Score</p>
              <p className="mt-1 text-3xl font-bold text-primary-600">{userScore}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Paper Saved</p>
              <p className="mt-1 text-3xl font-bold text-primary-600">{impactData.paperSaved}</p>
              <p className="text-xs text-gray-500">sheets</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Plastic Avoided</p>
              <p className="mt-1 text-3xl font-bold text-primary-600">{impactData.plasticAvoided}</p>
              <p className="text-xs text-gray-500">items</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">CO₂ Reduced</p>
              <p className="mt-1 text-3xl font-bold text-primary-600">{impactData.co2Reduced.toFixed(1)}</p>
              <p className="text-xs text-gray-500">kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action History */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Action History</h3>
          
          {userActions.length === 0 ? (
            <p className="text-gray-500">You haven't logged any sustainability actions yet.</p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {userActions
                  .slice()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((action, actionIdx) => {
                    const actionDetails = getActionDetails(action.actionType);
                    return (
                      <li key={action.id}>
                        <div className="relative pb-8">
                          {actionIdx !== userActions.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                                {actionDetails?.icon || <Leaf className="h-5 w-5 text-primary-600" />}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {actionDetails?.label || action.actionType} 
                                  <span className="ml-2 font-medium text-primary-600">+{action.points} pts</span>
                                </p>
                                {action.description && (
                                  <p className="mt-0.5 text-sm text-gray-500">{action.description}</p>
                                )}
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {formatDate(action.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityPage;