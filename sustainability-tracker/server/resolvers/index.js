import { GraphQLError } from 'graphql';
import { pubsub } from '../index.js';
import SustainabilityAction from '../models/SustainabilityAction.js';
import { validateCreateAction, validateUpdateAction } from '../validators/actionValidators.js';

// Subscription event names
const EVENTS = {
  SUSTAINABILITY_ACTION_CREATED: 'SUSTAINABILITY_ACTION_CREATED',
  SUSTAINABILITY_ACTION_UPDATED: 'SUSTAINABILITY_ACTION_UPDATED',
  SUSTAINABILITY_ACTION_DELETED: 'SUSTAINABILITY_ACTION_DELETED',
};

const resolvers = {
  Query: {
    // Get all sustainability actions with optional filtering
    sustainabilityActions: async (_, { filter = {} }) => {
      try {
        const query = {};
        
        // Apply filters if provided
        if (filter.actionType) {
          query.actionType = filter.actionType;
        }
        
        // Apply date range filter if provided
        if (filter.fromDate || filter.toDate) {
          query.performedAt = {};
          
          if (filter.fromDate) {
            query.performedAt.$gte = new Date(filter.fromDate);
          }
          
          if (filter.toDate) {
            query.performedAt.$lte = new Date(filter.toDate);
          }
        }
        
        return await SustainabilityAction.find(query).sort({ performedAt: -1 });
      } catch (error) {
        throw new GraphQLError(`Failed to fetch sustainability actions: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
    
    // Get a specific sustainability action by ID
    sustainabilityAction: async (_, { id }) => {
      try {
        const action = await SustainabilityAction.findById(id);
        
        if (!action) {
          throw new GraphQLError(`Sustainability action with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        
        return action;
      } catch (error) {
        if (error.extensions?.code === 'NOT_FOUND') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to fetch sustainability action: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
    
    // Get aggregated metrics about sustainability actions
    sustainabilityMetrics: async () => {
      try {
        // Get total actions and impact
        const { totalImpact, count } = await SustainabilityAction.calculateTotalImpact();
        
        // Get action counts by type
        const actionsByTypeResult = await SustainabilityAction.aggregate([
          {
            $group: {
              _id: '$actionType',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              actionType: '$_id',
              count: 1,
              _id: 0,
            },
          },
        ]);
        
        return {
          totalActions: count,
          totalImpact,
          averageImpact: count > 0 ? totalImpact / count : 0,
          actionsByType: actionsByTypeResult,
        };
      } catch (error) {
        throw new GraphQLError(`Failed to calculate sustainability metrics: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
  },
  
  Mutation: {
    // Create a new sustainability action
    createSustainabilityAction: async (_, { input }) => {
      try {
        // Validate input
        const { error } = validateCreateAction(input);
        if (error) {
          throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        
        // Set default performed date to now if not provided
        if (!input.performedAt) {
          input.performedAt = new Date().toISOString();
        }
        
        // Create new sustainability action
        const newAction = new SustainabilityAction({
          ...input,
          performedAt: new Date(input.performedAt),
        });
        
        // Save to database
        await newAction.save();
        
        // Publish subscription event
        pubsub.publish(EVENTS.SUSTAINABILITY_ACTION_CREATED, {
          sustainabilityActionCreated: newAction,
        });
        
        return newAction;
      } catch (error) {
        if (error.extensions?.code === 'BAD_USER_INPUT') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to create sustainability action: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
    
    // Update an existing sustainability action
    updateSustainabilityAction: async (_, { id, input }) => {
      try {
        // Validate input
        const { error } = validateUpdateAction(input);
        if (error) {
          throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        
        // Convert performedAt to Date object if provided
        if (input.performedAt) {
          input.performedAt = new Date(input.performedAt);
        }
        
        // Find and update the action
        const updatedAction = await SustainabilityAction.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true, runValidators: true }
        );
        
        if (!updatedAction) {
          throw new GraphQLError(`Sustainability action with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        
        // Publish subscription event
        pubsub.publish(EVENTS.SUSTAINABILITY_ACTION_UPDATED, {
          sustainabilityActionUpdated: updatedAction,
        });
        
        return updatedAction;
      } catch (error) {
        if (error.extensions?.code === 'BAD_USER_INPUT' || 
            error.extensions?.code === 'NOT_FOUND') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to update sustainability action: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
    
    // Delete a sustainability action
    deleteSustainabilityAction: async (_, { id }) => {
      try {
        const deletedAction = await SustainabilityAction.findByIdAndDelete(id);
        
        if (!deletedAction) {
          throw new GraphQLError(`Sustainability action with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        
        // Publish subscription event
        pubsub.publish(EVENTS.SUSTAINABILITY_ACTION_DELETED, {
          sustainabilityActionDeleted: id,
        });
        
        return true;
      } catch (error) {
        if (error.extensions?.code === 'NOT_FOUND') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to delete sustainability action: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
  },
  
  Subscription: {
    // Subscribe to sustainability action creation events
    sustainabilityActionCreated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.SUSTAINABILITY_ACTION_CREATED]),
    },
    
    // Subscribe to sustainability action update events
    sustainabilityActionUpdated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.SUSTAINABILITY_ACTION_UPDATED]),
    },
    
    // Subscribe to sustainability action deletion events
    sustainabilityActionDeleted: {
      subscribe: () => pubsub.asyncIterator([EVENTS.SUSTAINABILITY_ACTION_DELETED]),
    },
  },
  
  // Type resolvers for SustainabilityAction
  SustainabilityAction: {
    id: (parent) => parent._id || parent.id,
    performedAt: (parent) => parent.performedAt.toISOString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },
};

export default resolvers;