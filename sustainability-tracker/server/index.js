import express from 'express';
import http from 'http';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { typeDefs } from './schema/typeDefs.js';
import resolvers from './resolvers/index.js';
import userResolvers from './resolvers/userResolvers.js';
import bingoResolvers from './resolvers/bingoResolvers.js';
import { connectDB } from './config/db.js';
import { verifyAccessToken } from './utils/auth.js';
import BingoItem from './models/BingoItem.js';
import { getProjectManagementSustainabilityBingoItems } from './utils/defaultBingoItems.js';

console.log('typeDefs loaded:', typeof typeDefs);
console.log('bingoResolvers loaded:', typeof bingoResolvers);
console.log('bingoResolvers keys:', Object.keys(bingoResolvers));

dotenv.config();

// Create PubSub instance for subscriptions
export const pubsub = new PubSub();

// Merge resolvers
const mergedResolvers = {
  Query: {
    ...resolvers.Query,
    ...userResolvers.Query,
    ...bingoResolvers.Query,
  },
  Mutation: {
    ...resolvers.Mutation,
    ...userResolvers.Mutation,
    ...bingoResolvers.Mutation,
  },
  Subscription: {
    ...resolvers.Subscription,
    ...bingoResolvers.Subscription,
  },
  SustainabilityAction: resolvers.SustainabilityAction,
  User: userResolvers.User,
  BingoItem: bingoResolvers.BingoItem,
  BingoGame: bingoResolvers.BingoGame,
  BingoCompletedItem: bingoResolvers.BingoCompletedItem,
  BingoAchievement: bingoResolvers.BingoAchievement,
  BingoBoardEntry: bingoResolvers.BingoBoardEntry,
};

async function startServer() {
  // Connect to MongoDB
  await connectDB();
  
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Enhanced CORS configuration for production deployment
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://cs-632-group1-a.vercel.app',
    'https://cs632-group1a.onrender.com',
    'https://studio.apollographql.com',    
    // Add any other domains you need
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Authorization'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
  };

  // Apply CORS middleware
  app.use(cors(corsOptions));

  // Add explicit OPTIONS handler for preflight requests
  app.options('*', cors(corsOptions));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Sustainability Tracker GraphQL API'
    });
  });

  // Create GraphQL schema
  const schema = makeExecutableSchema({ 
    typeDefs, 
    resolvers: mergedResolvers 
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    formatError: (err) => {
      console.error('GraphQL Error:', err);
      
      return {
        message: err.message,
        code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
        path: err.path,
      };
    },
    context: ({ req }) => {
      let user = null;
      
      const token = req?.headers?.authorization?.split('Bearer ')[1];
      if (token) {
        try {
          user = verifyAccessToken(token);
        } catch (error) {
          console.error('Token verification failed:', error.message);
        }
      }
      
      return {
        req,
        user,
      };
    },
    cors: false, // Disable Apollo's built-in CORS since we're using Express CORS
    introspection: true, // Enable introspection for GraphQL Playground
    playground: true, // Enable GraphQL Playground
  });

  // Start Apollo Server
  await server.start();
  
  // Apply Apollo middleware to Express
  server.applyMiddleware({ 
    app,
    cors: false, // Disable Apollo's CORS since we're using Express CORS
    path: '/graphql'
  });
  
  // Set up WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  
  // Use GraphQL over WebSocket protocol
  const serverCleanup = useServer({ schema }, wsServer);

  // Ensure default bingo items exist
  async function ensureDefaultBingoItems() {
    const count = await BingoItem.countDocuments();
    if (count < 16) {
      const defaultItems = getProjectManagementSustainabilityBingoItems();
      await BingoItem.insertMany(
        defaultItems.map(item => ({
          ...item,
          createdBy: 'system',
          isActive: true,
        }))
      );
      console.log('Inserted default bingo items');
    }
  }

  // Ensure default bingo items on server start
  await ensureDefaultBingoItems();

  // Start the server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🔌 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🌐 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    serverCleanup.dispose();
    await server.stop();
    httpServer.close(() => {
      console.log('Process terminated');
    });
  });
}

// Handle server errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});