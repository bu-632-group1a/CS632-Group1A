import { Session, Comment } from '../types';

// Mocked event service functions for demo purposes
// In a real app, these would make API calls to a backend server

// Simulate a delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Sample session data for demo
const mockSessions: Session[] = [
  {
    id: 'session1',
    title: 'Opening Keynote: The Future of Sustainable Conferences',
    description: 'Join Dr. Elena Martinez as she discusses innovative approaches to making conferences more sustainable and environmentally friendly.',
    startTime: '2023-11-15T09:00:00',
    endTime: '2023-11-15T10:00:00',
    location: 'Main Auditorium',
    speakerId: 'speaker1',
    speakerName: 'Dr. Elena Martinez',
    tags: ['keynote', 'sustainability', 'innovation'],
    maxAttendees: 500,
    currentAttendees: 427
  },
  {
    id: 'session2',
    title: 'Digital Transformation in Event Management',
    description: 'Learn how digital tools are revolutionizing event management and creating new opportunities for sustainability.',
    startTime: '2023-11-15T10:30:00',
    endTime: '2023-11-15T11:30:00',
    location: 'Room A',
    speakerId: 'speaker2',
    speakerName: 'Jason Wong',
    tags: ['technology', 'event management', 'digital'],
    maxAttendees: 200,
    currentAttendees: 183
  },
  {
    id: 'session3',
    title: 'Workshop: Measuring Your Carbon Footprint',
    description: 'A hands-on workshop to help you understand and measure your personal and organizational carbon footprint.',
    startTime: '2023-11-15T13:00:00',
    endTime: '2023-11-15T14:30:00',
    location: 'Workshop Room B',
    speakerId: 'speaker3',
    speakerName: 'Sarah Johnson',
    tags: ['workshop', 'carbon footprint', 'sustainability'],
    maxAttendees: 50,
    currentAttendees: 42
  },
  {
    id: 'session4',
    title: 'Panel Discussion: Sustainable Technology Innovations',
    description: 'Industry leaders discuss the latest technologies that are helping organizations become more sustainable.',
    startTime: '2023-11-15T15:00:00',
    endTime: '2023-11-15T16:30:00',
    location: 'Main Auditorium',
    speakerId: 'speaker4',
    speakerName: 'Panel Moderator: Michael Chen',
    tags: ['panel', 'technology', 'innovation', 'sustainability'],
    maxAttendees: 300,
    currentAttendees: 275
  },
  {
    id: 'session5',
    title: 'Networking Reception: Green Connections',
    description: 'Connect with like-minded professionals while enjoying sustainable refreshments and eco-friendly activities.',
    startTime: '2023-11-15T17:00:00',
    endTime: '2023-11-15T19:00:00',
    location: 'Grand Ballroom',
    speakerId: 'speaker5',
    speakerName: 'Hosted by Conference Committee',
    tags: ['networking', 'social', 'reception'],
    maxAttendees: 400,
    currentAttendees: 328
  },
  {
    id: 'session6',
    title: 'Closing Keynote: Taking Action for a Sustainable Future',
    description: 'Dr. James Rodriguez shares inspiring stories and practical steps for creating lasting environmental change.',
    startTime: '2023-11-16T16:00:00',
    endTime: '2023-11-16T17:00:00',
    location: 'Main Auditorium',
    speakerId: 'speaker6',
    speakerName: 'Dr. James Rodriguez',
    tags: ['keynote', 'sustainability', 'action'],
    maxAttendees: 500,
    currentAttendees: 456
  }
];

// Sample comments for demo
const mockComments: Record<string, Comment[]> = {
  'session1': [
    {
      id: 'comment1',
      sessionId: 'session1',
      userId: 'user1',
      userName: 'Alex Johnson',
      content: 'Really looking forward to this session! Dr. Martinez always has such insightful perspectives.',
      timestamp: '2023-11-10T14:23:00',
      upvotes: 5
    },
    {
      id: 'comment2',
      sessionId: 'session1',
      userId: 'user2',
      userName: 'Maya Patel',
      content: 'Will this session cover carbon offset strategies for larger conferences?',
      timestamp: '2023-11-11T09:45:00',
      upvotes: 3
    }
  ],
  'session2': [
    {
      id: 'comment3',
      sessionId: 'session2',
      userId: 'user3',
      userName: 'Carlos Rodriguez',
      content: 'I implemented some digital tools at our last event and saw a 40% reduction in paper use. Looking forward to learning more!',
      timestamp: '2023-11-12T16:30:00',
      upvotes: 7
    }
  ]
};

// Mock user agenda
let mockUserAgenda = {
  sessionIds: ['session1', 'session3'],
  checkedInSessionIds: ['session1']
};

export const getSessions = async (): Promise<Session[]> => {
  await delay(800);
  return mockSessions;
};

export const getSession = async (sessionId: string): Promise<Session> => {
  await delay(500);
  const session = mockSessions.find(s => s.id === sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  return session;
};

export const getSessionComments = async (sessionId: string): Promise<Comment[]> => {
  await delay(600);
  return mockComments[sessionId] || [];
};

export const addSessionComment = async (sessionId: string, content: string): Promise<Comment> => {
  await delay(700);
  
  const newComment: Comment = {
    id: `comment${Date.now()}`,
    sessionId,
    userId: 'user1', // In a real app, this would be the current user's ID
    userName: 'Demo User', // In a real app, this would be the current user's name
    content,
    timestamp: new Date().toISOString(),
    upvotes: 0
  };
  
  // Add to mock comments
  if (!mockComments[sessionId]) {
    mockComments[sessionId] = [];
  }
  mockComments[sessionId].push(newComment);
  
  return newComment;
};

export const getUserAgenda = async () => {
  await delay(600);
  return mockUserAgenda;
};

export const addToAgenda = async (sessionId: string) => {
  await delay(500);
  
  if (!mockUserAgenda.sessionIds.includes(sessionId)) {
    mockUserAgenda.sessionIds.push(sessionId);
  }
  
  return { success: true };
};

export const removeFromAgenda = async (sessionId: string) => {
  await delay(500);
  
  mockUserAgenda.sessionIds = mockUserAgenda.sessionIds.filter(id => id !== sessionId);
  
  return { success: true };
};

export const checkInToSession = async (sessionId: string, qrCode: string) => {
  await delay(800);
  
  // In a real app, this would validate the QR code against the session
  // For demo, we'll just check if the session exists
  const session = mockSessions.find(s => s.id === sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  
  // Check if the QR code is valid (simple check for demo)
  if (!qrCode.includes(sessionId)) {
    throw new Error('Invalid QR code for this session');
  }
  
  // Add to checked in sessions if not already there
  if (!mockUserAgenda.checkedInSessionIds.includes(sessionId)) {
    mockUserAgenda.checkedInSessionIds.push(sessionId);
    
    // Update current attendees count
    session.currentAttendees = (session.currentAttendees || 0) + 1;
  }
  
  return { success: true };
};