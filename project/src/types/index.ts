export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  sustainabilityScore: number;
  badges: Badge[];
  checkedInEvents: string[];
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
  type: 'keynote' | 'panel' | 'break' | 'presentation' | 'workshop' | 'other';
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
  avatar?: string;
  score: number;
  rank: number;
}