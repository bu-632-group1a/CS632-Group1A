import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import { typeDefs } from './schema/typeDefs.js';
import resolvers from './resolvers/index.js';
import userResolvers from './resolvers/userResolvers.js';
import { connectDB } from './config/db.js';
import { verifyAccessToken } from './utils/auth.js';

dotenv.config();

// Create PubSub instance for subscriptions
export const pubsub = new PubSub();

// Merge resolvers
const mergedResolvers = {
  Query: {
    ...resolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...resolvers.Mutation,
    ...userResolvers.Mutation,
  },
  Subscription: resolvers.Subscription,
  SustainabilityAction: resolvers.SustainabilityAction,
  User: userResolvers.User,
};

async function startServer() {
  // Connect to MongoDB
  await connectDB();
  
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

app.use(cors({
  origin: 'https://cs-632-group1-a.vercel.app', // your Vercel frontend URL
  credentials: true,
}));

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
  });

  // Start Apollo Server
  await server.start();
  
  // Apply Apollo middleware to Express
server.applyMiddleware({
  app,
  cors: false, // 🚫 disable Apollo's built-in CORS handling
});
  
  // Set up WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  
  // Use GraphQL over WebSocket protocol
  const serverCleanup = useServer({ schema }, wsServer);

  // Start the server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🔌 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

// Handle server errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});