import { GraphQLError } from 'graphql';
import { pubsub } from '../index.js';
import SustainabilityAction from '../models/SustainabilityAction.js';
import User from '../models/User.js';
import { validateCreateAction, validateUpdateAction } from '../validators/actionValidators.js';

// Subscription event names
const EVENTS = {
  SUSTAINABILITY_ACTION_CREATED: 'SUSTAINABILITY_ACTION_CREATED',
  SUSTAINABILITY_ACTION_UPDATED: 'SUSTAINABILITY_ACTION_UPDATED',
  SUSTAINABILITY_ACTION_DELETED: 'SUSTAINABILITY_ACTION_DELETED',
  LEADERBOARD_UPDATED: 'LEADERBOARD_UPDATED',
};

const resolvers = {
  Query: {
    sustainabilityActions: async (_, { filter = {} }) => {
      try {
        const query = {};
        
        if (filter.actionType) {
          query.actionType = filter.actionType;
        }
        
        if (filter.userId) {
          query.userId = filter.userId;
        }
        
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
    
    sustainabilityMetrics: async (_, { userId }) => {
      try {
        const match = userId ? { userId } : {};
        const { totalImpact, count } = await SustainabilityAction.calculateTotalImpact(userId);
        
        const actionsByTypeResult = await SustainabilityAction.aggregate([
          { $match: match },
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

    leaderboard: async (_, { limit = 10 }) => {
      try {
        // First, get the aggregated data
        const leaderboardData = await SustainabilityAction.aggregate([
          {
            $group: {
              _id: '$userId',
              totalActions: { $sum: 1 },
              totalImpact: { $sum: '$impactScore' },
            },
          },
          {
            $project: {
              userId: '$_id',
              totalActions: 1,
              totalImpact: 1,
              averageImpact: { $divide: ['$totalImpact', '$totalActions'] },
              _id: 0,
            },
          },
          { $sort: { totalImpact: -1 } },
          { $limit: limit },
        ]);

        // Enrich with user data and actions by type
        const enrichedLeaderboard = await Promise.all(
          leaderboardData.map(async (entry, index) => {
            try {
              // Try to find user by ID first, then by name if it's a string
              let user = null;
              
              // Check if userId looks like a MongoDB ObjectId
              if (entry.userId && entry.userId.match(/^[0-9a-fA-F]{24}$/)) {
                user = await User.findById(entry.userId).select('firstName lastName username profilePicture city state company');
              } else if (entry.userId && typeof entry.userId === 'string') {
                // If it's a string that doesn't look like an ObjectId, try to find by name
                const nameParts = entry.userId.split(' ');
                if (nameParts.length >= 2) {
                  user = await User.findOne({
                    firstName: nameParts[0],
                    lastName: nameParts.slice(1).join(' ')
                  }).select('firstName lastName username profilePicture city state company');
                }
              }

              // Get actions by type for this user
              const actionsByType = await SustainabilityAction.aggregate([
                { $match: { userId: entry.userId } },
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
                ...entry,
                rank: index + 1,
                actionsByType,
                user: user ? {
                  id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  fullName: `${user.firstName} ${user.lastName}`,
                  username: user.username,
                  profilePicture: user.profilePicture,
                  location: user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || null,
                  company: user.company,
                } : {
                  id: entry.userId,
                  firstName: entry.userId.includes(' ') ? entry.userId.split(' ')[0] : 'Unknown',
                  lastName: entry.userId.includes(' ') ? entry.userId.split(' ').slice(1).join(' ') : 'User',
                  fullName: entry.userId.includes(' ') ? entry.userId : 'Unknown User',
                  username: entry.userId.toLowerCase().replace(/\s+/g, ''),
                  profilePicture: null,
                  location: null,
                  company: null,
                }
              };
            } catch (error) {
              console.error(`Failed to process leaderboard entry for userId ${entry.userId}:`, error);
              
              // Get actions by type even if user lookup fails
              const actionsByType = await SustainabilityAction.aggregate([
                { $match: { userId: entry.userId } },
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
                ...entry,
                rank: index + 1,
                actionsByType,
                user: {
                  id: entry.userId,
                  firstName: entry.userId.includes(' ') ? entry.userId.split(' ')[0] : 'Unknown',
                  lastName: entry.userId.includes(' ') ? entry.userId.split(' ').slice(1).join(' ') : 'User',
                  fullName: entry.userId.includes(' ') ? entry.userId : 'Unknown User',
                  username: entry.userId.toLowerCase().replace(/\s+/g, ''),
                  profilePicture: null,
                  location: null,
                  company: null,
                }
              };
            }
          })
        );

        return enrichedLeaderboard;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch leaderboard: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    allUserMetrics: async () => {
      try {
        // Get total metrics across all actions
        const metrics = await SustainabilityAction.aggregate([
          {
            $group: {
              _id: null,
              totalActions: { $sum: 1 },
              totalImpact: { $sum: '$impactScore' },
            }
          }
        ]);

        // Get actions grouped by type
        const actionsByType = await SustainabilityAction.aggregate([
          {
            $group: {
              _id: '$actionType',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              actionType: '$_id',
              count: 1,
              _id: 0
            }
          }
        ]);

        // Return aggregated metrics
        return [{
          userId: null,
          totalActions: metrics[0]?.totalActions || 0,
          totalImpact: metrics[0]?.totalImpact || 0,
          averageImpact: metrics[0]?.totalActions ? metrics[0].totalImpact / metrics[0].totalActions : 0,
          actionsByType
        }];
      } catch (error) {
        throw new GraphQLError(`Failed to fetch user metrics: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
  },
  
  Mutation: {
    createSustainabilityAction: async (_, { input }) => {
      try {
        const { error } = validateCreateAction(input);
        if (error) {
          throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        
        if (!input.performedAt) {
          input.performedAt = new Date().toISOString();
        }
        
        const newAction = new SustainabilityAction({
          ...input,
          performedAt: new Date(input.performedAt),
        });
        
        await newAction.save();
        
        pubsub.publish(EVENTS.SUSTAINABILITY_ACTION_CREATED, {
          sustainabilityActionCreated: newAction,
        });

        const leaderboard = await resolvers.Query.leaderboard(_, { limit: 10 });
        pubsub.publish(EVENTS.LEADERBOARD_UPDATED, {
          leaderboardUpdated: leaderboard,
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
    
    updateSustainabilityAction: async (_, { id, input }) => {
      try {
        const { error } = validateUpdateAction(input);
        if (error) {
          throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        
        if (input.performedAt) {
          input.performedAt = new Date(input.performedAt);
        }
        
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
        
        pubsub.publish(EVENTS.SUSTAINABILITY_ACTION_UPDATED, {
          sustainabilityActionUpdated: updatedAction,
        });

        const leaderboard = await resolvers.Query.leaderboard(_, { limit: 10 });
        pubsub.publish(EVENTS.LEADERBOARD_UPDATED, {
          leaderboardUpdated: leaderboard,
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
    
    deleteSustainabilityAction: async (_, { id }) => {
      try {
        const deletedAction = await SustainabilityAction.findByIdAndDelete(id);
        
        if (!deletedAction) {
          throw new GraphQLError(`Sustainability action with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        
        pubsub.publish(EVENTS.SUSTAINABILITY_ACTION_DELETED, {
          sustainabilityActionDeleted: id,
        });

        const leaderboard = await resolvers.Query.leaderboard(_, { limit: 10 });
        pubsub.publish(EVENTS.LEADERBOARD_UPDATED, {
          leaderboardUpdated: leaderboard,
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
    sustainabilityActionCreated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.SUSTAINABILITY_ACTION_CREATED]),
    },
    
    sustainabilityActionUpdated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.SUSTAINABILITY_ACTION_UPDATED]),
    },
    
    sustainabilityActionDeleted: {
      subscribe: () => pubsub.asyncIterator([EVENTS.SUSTAINABILITY_ACTION_DELETED]),
    },

    leaderboardUpdated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.LEADERBOARD_UPDATED]),
    },
  },
  
  SustainabilityAction: {
    id: (parent) => parent._id || parent.id,
    performedAt: (parent) => parent.performedAt.toISOString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },
};

export default resolvers;