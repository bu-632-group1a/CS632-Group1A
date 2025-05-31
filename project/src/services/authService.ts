import { User } from '../types';

// Mocked authentication functions for demo purposes
// In a real app, these would make API calls to a backend server

// Simulate a delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Sample user data for demo
const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'attendee',
    sustainabilityScore: 120,
    completedBingoSquares: ['square1', 'square2']
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    sustainabilityScore: 250,
    completedBingoSquares: ['square1', 'square2', 'square3', 'square4']
  }
];

export const loginUser = async (email: string, password: string) => {
  await delay(800); // Simulate API delay
  
  // Simple authentication for demo purposes
  if (email === 'demo@example.com' && password === 'password') {
    // Return the demo user
    return {
      token: 'mock-jwt-token',
      user: mockUsers[0]
    };
  }
  
  if (email === 'admin@example.com' && password === 'admin') {
    // Return the admin user
    return {
      token: 'mock-admin-jwt-token',
      user: mockUsers[1]
    };
  }

  // If credentials don't match, throw an error
  throw new Error('Invalid email or password');
};

export const registerUser = async (name: string, email: string, password: string) => {
  await delay(1000); // Simulate API delay
  
  // In a real app, this would create a new user in the database
  // For demo, we'll return a success response with a new user object
  const newUser: User = {
    id: `user${Date.now()}`,
    name,
    email,
    role: 'attendee',
    sustainabilityScore: 0,
    completedBingoSquares: []
  };
  
  return {
    token: 'mock-jwt-token-new-user',
    user: newUser
  };
};

export const getUserProfile = async () => {
  await delay(500); // Simulate API delay
  
  // In a real app, this would decode the JWT token and fetch the user's profile
  // For demo, we'll return the demo user
  const token = localStorage.getItem('token');
  
  if (token === 'mock-admin-jwt-token') {
    return mockUsers[1];
  }
  
  if (token) {
    return mockUsers[0];
  }
  
  throw new Error('Not authenticated');
};

export const logoutUser = () => {
  // In a real app, this might involve invalidating the token on the server
  // For demo, we just remove the token from localStorage
  localStorage.removeItem('token');
};