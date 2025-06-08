export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture?: string;
  city?: string;
  state?: string;
  company?: string;
  location?: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  speaker: string;
  time: string;
  location: string;
  category: string;
  imageUrl?: string;
  date: string;
  type: 'keynote' | 'panel' | 'break' | 'presentation' | 'workshop' | 'reception' | 'other';
  speakers?: string[];
  moderator?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  dateEarned: string;
}

export interface BingoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface SustainabilityAction {
  id: string;
  title: string;
  points: number;
  completed: boolean;
  date?: string;
  category: 'transport' | 'waste' | 'energy' | 'food' | 'other';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  profilePicture?: string;
  score: number;
  rank: number;
}

// GraphQL Types
export interface BingoItemGraphQL {
  id: string;
  text: string;
  position: number;
  category: string;
  points: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BingoCompletedItem {
  item: BingoItemGraphQL;
  completedAt: string;
}

export interface BingoAchievement {
  type: 'ROW' | 'COLUMN' | 'DIAGONAL';
  pattern: number[];
  achievedAt: string;
  pointsAwarded: number;
}

export interface BingoGame {
  id: string;
  userId: string;
  completedItems: BingoCompletedItem[];
  bingosAchieved: BingoAchievement[];
  totalPoints: number;
  isCompleted: boolean;
  gameStartedAt: string;
  gameCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}