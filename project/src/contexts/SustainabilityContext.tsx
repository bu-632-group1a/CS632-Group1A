import React, { createContext, useContext, useState, useEffect } from 'react';
import { SustainabilityAction, SustainabilityActionType, SustainabilityImpact } from '../types';
import { useAuth } from './AuthContext';
import { 
  getSustainabilityActions, 
  logSustainabilityAction, 
  getSustainabilityImpact 
} from '../services/sustainabilityService';

interface SustainabilityContextType {
  userActions: SustainabilityAction[];
  userScore: number;
  impactData: SustainabilityImpact;
  logAction: (actionType: SustainabilityActionType, description?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SustainabilityContext = createContext<SustainabilityContextType | undefined>(undefined);

export const SustainabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userActions, setUserActions] = useState<SustainabilityAction[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [impactData, setImpactData] = useState<SustainabilityImpact>({
    paperSaved: 0,
    plasticAvoided: 0,
    co2Reduced: 0,
    waterSaved: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's sustainability data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserSustainabilityData();
    } else {
      // Reset data when not authenticated
      setUserActions([]);
      setUserScore(0);
      setImpactData({
        paperSaved: 0,
        plasticAvoided: 0,
        co2Reduced: 0,
        waterSaved: 0
      });
    }
  }, [isAuthenticated, user]);

  const loadUserSustainabilityData = async () => {
    setIsLoading(true);
    try {
      // Load user's sustainability actions
      const actions = await getSustainabilityActions();
      setUserActions(actions);
      
      // Calculate total score
      const score = actions.reduce((total, action) => total + action.points, 0);
      setUserScore(score);
      
      // Load impact data
      const impact = await getSustainabilityImpact();
      setImpactData(impact);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sustainability data');
    } finally {
      setIsLoading(false);
    }
  };

  const logAction = async (actionType: SustainabilityActionType, description?: string) => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to log sustainability actions');
      return;
    }

    setIsLoading(true);
    try {
      // Log the action
      const newAction = await logSustainabilityAction(actionType, description);
      
      // Update local state
      setUserActions(prevActions => [...prevActions, newAction]);
      setUserScore(prevScore => prevScore + newAction.points);
      
      // Refresh impact data
      const impact = await getSustainabilityImpact();
      setImpactData(impact);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log sustainability action');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SustainabilityContext.Provider
      value={{
        userActions,
        userScore,
        impactData,
        logAction,
        isLoading,
        error
      }}
    >
      {children}
    </SustainabilityContext.Provider>
  );
};

export const useSustainability = (): SustainabilityContextType => {
  const context = useContext(SustainabilityContext);
  if (context === undefined) {
    throw new Error('useSustainability must be used within a SustainabilityProvider');
  }
  return context;
};