// User related types
export type Role = 'attendee' | 'speaker' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  organization?: string;
  title?: string;
  sustainabilityScore: number;
  completedBingoSquares: string[];
}

// Session related types
export interface Session {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  speakerId: string;
  speakerName: string;
  tags: string[];
  maxAttendees?: number;
  currentAttendees?: number;
}

export interface SpeakerInfo {
  id: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  sessions: string[];
  organization: string;
  title: string;
}

// Sustainability related types
export interface SustainabilityAction {
  id: string;
  userId: string;
  actionType: SustainabilityActionType;
  points: number;
  timestamp: string;
  description?: string;
}

export type SustainabilityActionType = 
  | 'reusable_bottle'
  | 'vegetarian_meal'
  | 'public_transport'
  | 'digital_materials'
  | 'waste_recycling'
  | 'energy_saving'
  | 'water_conservation';

export interface SustainabilityImpact {
  paperSaved: number; // in sheets
  plasticAvoided: number; // in items
  co2Reduced: number; // in kg
  waterSaved: number; // in liters
}

// Discussion related types
export interface Comment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  content: string;
  timestamp: string;
  upvotes: number;
  replies?: Comment[];
}

// Bingo related types
export interface BingoSquare {
  id: string;
  text: string;
  category: 'sustainability' | 'networking' | 'learning' | 'fun';
  points: number;
}

export interface BingoBoard {
  squares: BingoSquare[];
  size: number; // 5 for a 5x5 board
}

// API related types
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: 'success' | 'error';
};