import { GraphQLError } from 'graphql';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { 
  validateRegister, 
  validateLogin, 
  validateProfilePicture, 
  validateUpdateUserProfile,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
} from '../validators/userValidators.js';
import { generateTokens, verifyRefreshToken, getAuthUser } from '../utils/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from '../utils/email.js';

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

      const { firstName, lastName, username, email, password, city, state, company } = input;

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
        city: city || undefined,
        state: state || undefined,
        company: company || undefined,
        role: 'USER',
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      const savedUser = await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(savedUser.email, verificationToken);
        console.log(`Verification email sent to ${savedUser.email}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email sending fails
      }

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

    forgotPassword: async (_, { input }) => {
      const { error } = validateForgotPassword(input);
      if (error) {
        throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { email } = input;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
        };
      }

      // Generate password reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken, user.firstName);
        console.log(`Password reset email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        throw new GraphQLError('Failed to send password reset email', {
          extensions: { code: 'EMAIL_ERROR' },
        });
      }

      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    },

    resetPassword: async (_, { input }) => {
      const { error } = validateResetPassword(input);
      if (error) {
        throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { token, newPassword } = input;

      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new GraphQLError('Invalid or expired reset token', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Verify the token
      const isValidToken = user.verifyPasswordResetToken(token);
      if (!isValidToken) {
        throw new GraphQLError('Invalid or expired reset token', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.clearPasswordResetToken();
      
      // Clear all refresh tokens for security
      user.refreshTokens = [];
      
      await user.save();

      // Send confirmation email
      try {
        await sendPasswordResetConfirmationEmail(user.email, user.firstName);
        console.log(`Password reset confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset confirmation email:', emailError);
        // Don't fail the password reset if email sending fails
      }

      return {
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      };
    },

    changePassword: async (_, { input }, context) => {
      const authUser = getAuthUser(context);
      
      const { error } = validateChangePassword(input);
      if (error) {
        throw new GraphQLError(`Validation error: ${error.details[0].message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { currentPassword, newPassword } = input;

      // Find user
      const user = await User.findById(authUser.userId);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Verify current password
      const validPassword = await user.comparePassword(currentPassword);
      if (!validPassword) {
        throw new GraphQLError('Current password is incorrect', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password has been changed successfully.',
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

    updateUserProfile: async (_, { input }, context) => {
      const authUser = getAuthUser(context);
      
      const { error } = validateUpdateUserProfile(input);
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

      // Update only provided fields
      if (input.firstName !== undefined) user.firstName = input.firstName;
      if (input.lastName !== undefined) user.lastName = input.lastName;
      if (input.city !== undefined) user.city = input.city || undefined;
      if (input.state !== undefined) user.state = input.state || undefined;
      if (input.company !== undefined) user.company = input.company || undefined;
      if (input.profilePicture !== undefined) user.profilePicture = input.profilePicture || undefined;

      await user.save();

      return user;
    },

    verifyEmail: async (_, { token }) => {
      const user = await User.findOne({
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new GraphQLError('Invalid or expired verification token', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const isValidToken = user.verifyEmailToken(token);
      if (!isValidToken) {
        throw new GraphQLError('Invalid verification token', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return true;
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
    location: (parent) => {
      if (parent.city && parent.state) {
        return `${parent.city}, ${parent.state}`;
      } else if (parent.city) {
        return parent.city;
      } else if (parent.state) {
        return parent.state;
      }
      return null;
    },
  },
};

export default userResolvers;