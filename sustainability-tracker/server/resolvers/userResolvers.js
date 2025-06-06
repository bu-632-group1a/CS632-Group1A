import { GraphQLError } from 'graphql';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { validateRegister, validateLogin, validateProfilePicture } from '../validators/userValidators.js';
import { generateTokens, verifyRefreshToken, getAuthUser } from '../utils/auth.js';

const userResolvers = {
  Query: {
    me: async (_, __, context) => {
      const authUser = getAuthUser(context);
      
      const user = await User.findById(authUser.userId);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      
      return user;
    },
    
    users: async (_, __, context) => {
      const authUser = getAuthUser(context);
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      return await User.find({});
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const { error } = validateRegister(input);
      if (error) {
        throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { firstName, lastName, username, email, password } = input;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        username,
        email,
        password,
        role: 'USER',
      });

      const savedUser = await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(savedUser);

      // Add refresh token to user
      await user.addRefreshToken(refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

      return {
        user: savedUser,
        accessToken,
        refreshToken,
      };
    },

    login: async (_, { input }) => {
      const { error } = validateLogin(input);
      if (error) {
        throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { email, password } = input;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check password
      const validPassword = await user.comparePassword(password);
      if (!validPassword) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Add refresh token to user
      await user.addRefreshToken(refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

      return {
        user,
        accessToken,
        refreshToken,
      };
    },

    updateProfilePicture: async (_, { input }, context) => {
      const authUser = getAuthUser(context);
      
      const { error } = validateProfilePicture(input);
      if (error) {
        throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const user = await User.findById(authUser.userId);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      user.profilePicture = input.profilePicture;
      await user.save();

      return user;
    },

    refreshToken: async (_, { refreshToken }) => {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        
        const user = await User.findById(decoded.userId);
        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        // Check if refresh token exists and is valid
        const tokenExists = user.refreshTokens.find(t => t.token === refreshToken);
        if (!tokenExists || tokenExists.expiresAt < new Date()) {
          throw new GraphQLError('Invalid refresh token', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        // Remove old refresh token and add new one
        await user.removeRefreshToken(refreshToken);
        await user.addRefreshToken(
          tokens.refreshToken,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );

        return tokens;
      } catch (error) {
        throw new GraphQLError('Invalid refresh token', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
    },

    logout: async (_, { refreshToken }, context) => {
      const authUser = getAuthUser(context);
      
      const user = await User.findById(authUser.userId);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await user.removeRefreshToken(refreshToken);
      return true;
    },
  },

  User: {
    id: (parent) => parent._id || parent.id,
    fullName: (parent) => `${parent.firstName} ${parent.lastName}`,
  },
};

export default userResolvers;