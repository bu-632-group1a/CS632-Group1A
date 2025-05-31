import { SustainabilityAction, SustainabilityActionType, SustainabilityImpact } from '../types';

// Mocked sustainability service functions for demo purposes
// In a real app, these would make API calls to a backend server

// Simulate a delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Points for each action type
const actionPoints: Record<SustainabilityActionType, number> = {
  'reusable_bottle': 10,
  'vegetarian_meal': 15,
  'public_transport': 20,
  'digital_materials': 5,
  'waste_recycling': 10,
  'energy_saving': 5,
  'water_conservation': 5
};

// Mock user sustainability actions
let mockUserActions: SustainabilityAction[] = [
  {
    id: 'action1',
    userId: 'user1',
    actionType: 'reusable_bottle',
    points: 10,
    timestamp: '2023-11-15T10:30:00',
    description: 'Used my reusable water bottle throughout the morning sessions'
  },
  {
    id: 'action2',
    userId: 'user1',
    actionType: 'vegetarian_meal',
    points: 15,
    timestamp: '2023-11-15T12:15:00',
    description: 'Chose the vegetarian lunch option'
  },
  {
    id: 'action3',
    userId: 'user1',
    actionType: 'digital_materials',
    points: 5,
    timestamp: '2023-11-15T14:00:00',
    description: 'Accessed session materials digitally instead of printing'
  }
];

// Mock leaderboard data
const mockLeaderboard = [
  { userId: 'user2', userName: 'Emma Thompson', score: 210, rank: 1 },
  { userId: 'user3', userName: 'Daniel Kim', score: 185, rank: 2 },
  { userId: 'user4', userName: 'Sophia Martinez', score: 160, rank: 3 },
  { userId: 'user1', userName: 'Demo User', score: 120, rank: 4 },
  { userId: 'user5', userName: 'Noah Johnson', score: 95, rank: 5 },
  { userId: 'user6', userName: 'Olivia Williams', score: 80, rank: 6 },
  { userId: 'user7', userName: 'Liam Brown', score: 65, rank: 7 },
  { userId: 'user8', userName: 'Ava Davis', score: 50, rank: 8 },
  { userId: 'user9', userName: 'William Miller', score: 35, rank: 9 },
  { userId: 'user10', userName: 'Isabella Wilson', score: 20, rank: 10 }
];

export const getSustainabilityActions = async (): Promise<SustainabilityAction[]> => {
  await delay(700);
  return mockUserActions;
};

export const logSustainabilityAction = async (
  actionType: SustainabilityActionType,
  description?: string
): Promise<SustainabilityAction> => {
  await delay(800);
  
  const points = actionPoints[actionType];
  
  const newAction: SustainabilityAction = {
    id: `action${Date.now()}`,
    userId: 'user1', // In a real app, this would be the current user's ID
    actionType,
    points,
    timestamp: new Date().toISOString(),
    description
  };
  
  // Add to mock actions
  mockUserActions.push(newAction);
  
  // Update user's score in the leaderboard
  const userIndex = mockLeaderboard.findIndex(user => user.userId === 'user1');
  if (userIndex !== -1) {
    mockLeaderboard[userIndex].score += points;
    // Re-sort and update ranks
    mockLeaderboard.sort((a, b) => b.score - a.score);
    mockLeaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });
  }
  
  return newAction;
};

export const getSustainabilityImpact = async (): Promise<SustainabilityImpact> => {
  await delay(600);
  
  // Calculate impact based on user actions
  const paperSaved = mockUserActions.filter(a => a.actionType === 'digital_materials').length * 10;
  const plasticAvoided = mockUserActions.filter(a => a.actionType === 'reusable_bottle').length * 2;
  const co2Reduced = mockUserActions.reduce((total, action) => {
    switch (action.actionType) {
      case 'vegetarian_meal':
        return total + 2.5;
      case 'public_transport':
        return total + 5.0;
      default:
        return total + 0.5;
    }
  }, 0);
  const waterSaved = mockUserActions.filter(a => 
    a.actionType === 'water_conservation' || a.actionType === 'vegetarian_meal'
  ).length * 100;
  
  return {
    paperSaved, // sheets
    plasticAvoided, // items
    co2Reduced, // kg
    waterSaved // liters
  };
};

export const getLeaderboard = async () => {
  await delay(900);
  return mockLeaderboard;
};