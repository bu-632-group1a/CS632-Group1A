console.log('bingoResolvers.js is loaded');
import { GraphQLError } from 'graphql';
import { pubsub } from '../index.js';
import BingoItem from '../models/BingoItem.js';
import BingoGame from '../models/BingoGame.js';
import User from '../models/User.js';
import { getVerifiedAuthUser, getUnverifiedAuthUser } from '../utils/auth.js';
import { validateCreateBingoItem, validateUpdateBingoItem } from '../validators/bingoValidators.js';
import { getProjectManagementSustainabilityBingoItems, getAlternativeProjectBingoItems } from '../utils/defaultBingoItems.js';
import mongoose from 'mongoose'; // Add this at the top if not already imported

// Subscription event names
const BINGO_EVENTS = {
  BINGO_ITEM_COMPLETED: 'BINGO_ITEM_COMPLETED',
  BINGO_ACHIEVED: 'BINGO_ACHIEVED',
  BINGO_GAME_UPDATED: 'BINGO_GAME_UPDATED',
};

// Easy completion items - these are considered simple actions
const EASY_COMPLETION_CATEGORIES = ['DIGITAL', 'ENERGY'];
const EASY_COMPLETION_KEYWORDS = [
  'digital',
  'virtual',
  'online',
  'paperless',
  'cloud',
  'automate',
  'optimize',
  'efficient'
];

export const bingoResolvers = {
  Query: {
    bingoItems: async () => {
      try {
        let items = await BingoItem.find({ isActive: true });        
        // If no items exist, create the default project management + sustainability items
        if (items.length === 0) {
          const defaultItems = getProjectManagementSustainabilityBingoItems();
          const createdItems = await BingoItem.insertMany(
            defaultItems.map(item => ({
              ...item,
              createdBy: 'system',
              isActive: true,
            }))
          );
          items = createdItems;
        }
        
        return items;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch bingo items: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    bingoGame: async (_, __, context) => {
      const authUser = getVerifiedAuthUser(context);

      try {
        let game = await BingoGame.findOne({ userId: authUser.userId.toString() })
          .populate('completedItems.itemId');

        if (!game) {
          // Always use current active items
          const allItems = await BingoItem.find({ isActive: true });
          if (allItems.length < 16) {
            throw new GraphQLError('Not enough bingo items to create a board (need at least 16)', {
              extensions: { code: 'BAD_REQUEST' },
            });
          }
          const shuffled = allItems.sort(() => Math.random() - 0.5).slice(0, 16);
          const board = shuffled.map((item, idx) => ({
            itemId: item._id,
            position: idx,
          }));

          game = new BingoGame({
            userId: authUser.userId.toString(),
            completedItems: [],
            bingosAchieved: [],
            totalPoints: 0,
            board,
          });
          await game.save();
          await game.populate('completedItems.itemId');
        }

        if (game && Array.isArray(game.board)) {
          game.board = game.board.map(entry => {
            // Remove 'item' property if it exists
            const { item, ...rest } = entry.toObject ? entry.toObject() : entry;
            return rest;
          });
        }
        console.log('game.board before return:', game.board);

        return game;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch bingo game: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    bingoLeaderboard: async (_, { limit = 10 }, context) => {
      // Make this query public - no authentication required
      try {
        const leaderboard = await BingoGame.aggregate([
          {
            $addFields: {
              completedItemsCount: { $size: '$completedItems' },
              bingosCount: { $size: '$bingosAchieved' },
            },
          },
          {
            $sort: { 
              totalPoints: -1, 
              bingosCount: -1, 
              completedItemsCount: -1,
              updatedAt: 1,
            },
          },
          { $limit: limit },
        ]);

        // Fetch user profile information for each leaderboard entry
        const enrichedLeaderboard = await Promise.all(
          leaderboard.map(async (entry, index) => {
            try {
              const user = await User.findById(entry.userId).select('firstName lastName username profilePicture city state company');
              
              return {
                userId: entry.userId,
                fullName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                profilePicture: user?.profilePicture || null,
                location: user ? (user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || null) : null,
                company: user?.company || null,
                totalPoints: entry.totalPoints,
                completedItemsCount: entry.completedItemsCount,
                bingosCount: entry.bingosCount,
                rank: index + 1,
                isCompleted: entry.isCompleted,
                gameCompletedAt: entry.gameCompletedAt?.toISOString() || null,
              };
            } catch (userError) {
              console.error(`Failed to fetch user ${entry.userId}:`, userError);
              return {
                userId: entry.userId,
                fullName: 'Unknown User',
                profilePicture: null,
                location: null,
                company: null,
                totalPoints: entry.totalPoints,
                completedItemsCount: entry.completedItemsCount,
                bingosCount: entry.bingosCount,
                rank: index + 1,
                isCompleted: entry.isCompleted,
                gameCompletedAt: entry.gameCompletedAt?.toISOString() || null,
              };
            }
          })
        );

        return enrichedLeaderboard;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch bingo leaderboard: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    bingoStats: async (_, __, context) => {
      // Make this query public - no authentication required
      try {
        const totalGames = await BingoGame.countDocuments();
        const completedGames = await BingoGame.countDocuments({ isCompleted: true });
        const totalBingos = await BingoGame.aggregate([
          { $unwind: '$bingosAchieved' },
          { $count: 'total' },
        ]);
        
        const avgCompletionRate = await BingoGame.aggregate([
          {
            $addFields: {
              completionRate: {
                $multiply: [
                  { $divide: [{ $size: '$completedItems' }, 16] },
                  100,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgCompletionRate: { $avg: '$completionRate' },
            },
          },
        ]);

        return {
          totalGames,
          completedGames,
          totalBingos: totalBingos[0]?.total || 0,
          averageCompletionRate: avgCompletionRate[0]?.avgCompletionRate || 0,
        };
      } catch (error) {
        throw new GraphQLError(`Failed to fetch bingo stats: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    easyBingoItems: async (_, __, context) => {
      // Require email verification to access easy bingo items
      const authUser = getVerifiedAuthUser(context);
      
      try {
        // Find user's current game
        const game = await BingoGame.findOne({ userId: authUser.userId })
          .populate('completedItems.itemId');
        
        const completedItemIds = game ? game.completedItems.map(item => item.itemId._id.toString()) : [];
        
        // Find easy items that aren't completed yet
        const easyItems = await BingoItem.find({
          isActive: true,
          _id: { $nin: completedItemIds },
          $or: [
            { category: { $in: EASY_COMPLETION_CATEGORIES } },
            { text: { $regex: EASY_COMPLETION_KEYWORDS.join('|'), $options: 'i' } }
          ]
        }).sort({ points: 1 }).limit(3);
        return easyItems;
      } catch (error) {
        if (error.extensions?.code === 'EMAIL_NOT_VERIFIED') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to fetch easy bingo items: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
  },

  Mutation: {
    createBingoItem: async (_, { input }, context) => {
      // Admin operations don't require email verification, but still need authentication
      const authUser = getUnverifiedAuthUser(context);
      
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized to create bingo items', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const { error } = validateCreateBingoItem(input);
      if (error) {
        throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        const newItem = new BingoItem({
          ...input,
          createdBy: authUser.userId,
        });

        await newItem.save();
        return newItem;
      } catch (error) {
   
        throw new GraphQLError(`Failed to create bingo item: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    updateBingoItem: async (_, { id, input }, context) => {
      // Admin operations don't require email verification, but still need authentication
      const authUser = getUnverifiedAuthUser(context);
      
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized to update bingo items', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const { error } = validateUpdateBingoItem(input);
      if (error) {
        throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        const updatedItem = await BingoItem.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true, runValidators: true }
        );

        if (!updatedItem) {
          throw new GraphQLError(`Bingo item with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return updatedItem;
      } catch (error) {
        if (error.extensions?.code === 'NOT_FOUND') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to update bingo item: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    toggleBingoItem: async (_, { itemId }, context) => {
      // Require email verification for bingo game interactions
      const authUser = getVerifiedAuthUser(context);

      try {
        // Find the bingo item
        const bingoItem = await BingoItem.findById(itemId);
        if (!bingoItem) {
          throw new GraphQLError(`Bingo item with ID ${itemId} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        // Find or create the user's bingo game
        let game = await BingoGame.findOne({ userId: authUser.userId });
        if (!game) {
          game = new BingoGame({
            userId: authUser.userId,
            completedItems: [],
            bingosAchieved: [],
            totalPoints: 0,
          });
        }

        // Check if item is already completed
        const existingItemIndex = game.completedItems.findIndex(
          item => item.itemId.toString() === itemId
        );

        if (existingItemIndex >= 0) {
          // Remove the item (toggle off)
          game.completedItems.splice(existingItemIndex, 1);
        } else {
        // Find the position for this item on the user's board
        const boardEntry = game.board.find(b => b.itemId.toString() === itemId);
        if (!boardEntry) {
          throw new GraphQLError('Item not found on user board', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        game.completedItems.push({
          itemId: bingoItem._id,
          position: boardEntry.position,
          completedAt: new Date(),
        });
          // Publish item completion event
          pubsub.publish(BINGO_EVENTS.BINGO_ITEM_COMPLETED, {
            bingoItemCompleted: {
              userId: authUser.userId,
              itemId: bingoItem._id,
              item: bingoItem,
            },
          });
        }

        // Check for new bingos
        const newBingos = game.checkForBingos();
        if (newBingos.length > 0) {
          game.bingosAchieved.push(...newBingos);
          
          // Publish bingo achievement events
          newBingos.forEach(bingo => {
            pubsub.publish(BINGO_EVENTS.BINGO_ACHIEVED, {
              bingoAchieved: {
                userId: authUser.userId,
                bingo,
                game,
              },
            });
          });
        }

        // Update total points and completion status
        game.totalPoints = game.calculateTotalPoints();
        if (game.bingosAchieved.length > 0) {
          game.isCompleted = true;
          if (!game.gameCompletedAt) {
            game.gameCompletedAt = new Date();
          }
        }
        
        if (game.isCompleted && !game.gameCompletedAt) {
          game.gameCompletedAt = new Date();
        }

        await game.save();
        await game.populate('completedItems.itemId');

        // Publish game update event
        pubsub.publish(BINGO_EVENTS.BINGO_GAME_UPDATED, {
          bingoGameUpdated: game,
        });

        return game;
      } catch (error) {
        if (error.extensions?.code === 'NOT_FOUND' || error.extensions?.code === 'EMAIL_NOT_VERIFIED') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to toggle bingo item: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    completeEasyBingoItem: async (_, __, context) => {
      const authUser = getVerifiedAuthUser(context);

      try {
        let game = await BingoGame.findOne({ userId: authUser.userId });
        if (!game) {
          game = new BingoGame({
            userId: authUser.userId,
            completedItems: [],
            bingosAchieved: [],
            totalPoints: 0,
          });
        }

        // Prevent further moves after win
        if (game.isCompleted) {
          throw new GraphQLError('Game is already completed!', {
            extensions: { code: 'FORBIDDEN' },
          });
        }

        const completedItemIds = game.completedItems.map(item => item.itemId.toString());

        // Find the easiest available item
        const easyItem = await BingoItem.findOne({
          isActive: true,
          _id: { $nin: completedItemIds },
          $or: [
            { category: { $in: EASY_COMPLETION_CATEGORIES } },
            { text: { $regex: EASY_COMPLETION_KEYWORDS.join('|'), $options: 'i' } }
          ]
        }).sort({ points: 1, position: 1 });

        if (!easyItem) {
          throw new GraphQLError('No easy bingo items available to complete', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        const boardEntry = game.board.find(b => b.itemId.toString() === easyItem._id.toString());
        if (!boardEntry) {
          throw new GraphQLError('Easy item not found on user board', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        game.completedItems.push({
          itemId: easyItem._id,
          position: boardEntry.position,
          completedAt: new Date(),
        });
        // Publish item completion event
        pubsub.publish(BINGO_EVENTS.BINGO_ITEM_COMPLETED, {
          bingoItemCompleted: {
            userId: authUser.userId,
            itemId: easyItem._id,
            item: easyItem,
          },
        });

        // Check for new bingos
        const newBingos = game.checkForBingos();
        if (newBingos.length > 0) {
          game.bingosAchieved.push(...newBingos);
          
          // Publish bingo achievement events
          newBingos.forEach(bingo => {
            pubsub.publish(BINGO_EVENTS.BINGO_ACHIEVED, {
              bingoAchieved: {
                userId: authUser.userId,
                bingo,
                game,
              },
            });
          });
        }

        // Update total points
        game.totalPoints = game.calculateTotalPoints();

        // Set isCompleted if a bingo has been achieved
        if (game.bingosAchieved.length > 0) {
          game.isCompleted = true;
          if (!game.gameCompletedAt) {
            game.gameCompletedAt = new Date();
          }
        }        
        if (game.isCompleted && !game.gameCompletedAt) {
          game.gameCompletedAt = new Date();
        }

        await game.save();
        await game.populate('completedItems.itemId');

        // Publish game update event
        pubsub.publish(BINGO_EVENTS.BINGO_GAME_UPDATED, {
          bingoGameUpdated: game,
        });

        return {
          game,
          completedItem: easyItem,
          message: `Completed easy action: ${easyItem.text}`,
        };
      } catch (error) {
        if (error.extensions?.code === 'NOT_FOUND' || error.extensions?.code === 'EMAIL_NOT_VERIFIED') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to complete easy bingo item: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    resetBingoGame: async (_, __, context) => {
      // Require email verification for bingo game interactions
      const authUser = getVerifiedAuthUser(context);

      try {
        const game = await BingoGame.findOne({ userId: authUser.userId });
        if (!game) {
          throw new GraphQLError('No bingo game found for user', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        // Reset the game
        game.completedItems = [];
        game.bingosAchieved = [];
        game.totalPoints = 0;
        game.isCompleted = false;
        game.gameStartedAt = new Date();
        game.gameCompletedAt = undefined;

        await game.save();
        await game.populate('completedItems.itemId');

        return game;
      } catch (error) {
        if (error.extensions?.code === 'NOT_FOUND' || error.extensions?.code === 'EMAIL_NOT_VERIFIED') {
          throw error;
        }
        
        throw new GraphQLError(`Failed to reset bingo game: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    refreshBingoItems: async (_, __, context) => {
      // Admin operations don't require email verification, but still need authentication
      const authUser = getUnverifiedAuthUser(context);
      
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized to refresh bingo items', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      try {
        // Clear existing items
        await BingoItem.deleteMany({});
        
        // Create new set of items (alternating between sets for variety)
        const useAlternative = Math.random() > 0.5;
        const newItems = useAlternative 
          ? getAlternativeProjectBingoItems() 
          : getProjectManagementSustainabilityBingoItems();
        
        const createdItems = await BingoItem.insertMany(
          newItems.map(item => ({
            ...item,
            createdBy: authUser.userId,
            isActive: true,
          }))
        );

        return createdItems;
      } catch (error) {
        throw new GraphQLError(`Failed to refresh bingo items: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    refreshAllBoards: async (_, __, context) => {
      // Only allow admins to refresh all boards
      const authUser = getUnverifiedAuthUser(context);
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized to refresh all boards', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      try {
        const allItems = await BingoItem.find({ isActive: true });
        const users = await User.find({});
        const updatedGames = [];

        for (const user of users) {
          // Shuffle and select 16 items for the board
          const shuffled = allItems.sort(() => Math.random() - 0.5).slice(0, 16);
          const board = shuffled.map((item, idx) => ({
            itemId: item._id,
            position: idx,
          }));

          let game = await BingoGame.findOne({ userId: user._id });
          if (!game) {
            game = new BingoGame({
              userId: user._id,
              completedItems: [],
              bingosAchieved: [],
              totalPoints: 0,
              board,
            });
          } else {
            game.board = board;
          }
          await game.save();
          updatedGames.push(game);
        }

        return updatedGames.length;
      } catch (error) {
        throw new GraphQLError(`Failed to refresh all boards: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
  },

  Subscription: {
    bingoItemCompleted: {
      subscribe: () => pubsub.asyncIterator([BINGO_EVENTS.BINGO_ITEM_COMPLETED]),
    },

    bingoAchieved: {
      subscribe: () => pubsub.asyncIterator([BINGO_EVENTS.BINGO_ACHIEVED]),
    },

    bingoGameUpdated: {
      subscribe: () => pubsub.asyncIterator([BINGO_EVENTS.BINGO_GAME_UPDATED]),
    },
  },

  BingoItem: {
    id: (parent) => parent._id || parent.id,
  },

  BingoGame: {
    id: (parent) => parent._id || parent.id,
    completedItems: (parent) => parent.completedItems || [],
    bingosAchieved: (parent) => parent.bingosAchieved || [],
  },

BingoBoardEntry: {
  item: async (parent) => {
    // Log for debugging
    console.log('BingoBoardEntry.item resolver called:', parent);
    if (!parent.itemId) return null;
    // Ensure itemId is a string or ObjectId
    return await BingoItem.findById(parent.itemId);
  },
  position: (parent) => parent.position,
},
  BingoCompletedItem: {
    item: (parent) => { /* ... */ },
    position: (parent) => {
      if (typeof parent.position !== 'number') {
        console.error('Missing position in BingoCompletedItem:', parent);
        return 0; // or throw an error
      }
      return parent.position;
    },
    completedAt: (parent) => parent.completedAt,
  },

  BingoAchievement: {
    achievedAt: (parent) => parent.achievedAt.toISOString(),
  },
};

export default bingoResolvers;