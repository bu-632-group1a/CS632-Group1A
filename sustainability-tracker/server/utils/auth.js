import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables before any usage

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
console.log('JWT_SECRET:', JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', JWT_REFRESH_SECRET);

export const prompteUser = (user) => {
    const adminEmails = ['judahb@bu.edu', 'mscloddy@bu.edu', 'pahadid@bu.edu','sofiyak@bu.edu'];
      if (adminEmails.includes(user.email)) {
        user.role = 'ADMIN';
      } else {
        user.role = 'USER';
      }
      return user;
}
export const generateTokens = (user) => {
  const  promotedUser = prompteUser(user);
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      role: promotedUser.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      username: user.username,
      city: user.city || null,
      state: user.state || null,
      company: user.company || null,
      location: user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || null,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  try {
    if (!token) {
      throw new GraphQLError('No token provided', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new GraphQLError('Invalid or expired token', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    throw new GraphQLError('Invalid refresh token', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
};

export const getAuthUser = (context) => {
  const authHeader = context.req.headers.authorization;
  
  if (!authHeader) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    throw new GraphQLError('Invalid token format', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  const decodedToken = verifyAccessToken(token);
  return decodedToken;
};

// New function to get authenticated user and enforce email verification
export const getVerifiedAuthUser = (context) => {
  const authUser = getAuthUser(context);
  
  // Check if email is verified
  if (!authUser.isEmailVerified) {
    throw new GraphQLError('Email verification required. Please check your email and verify your account before accessing this feature.', {
      extensions: { 
        code: 'EMAIL_NOT_VERIFIED',
        requiresEmailVerification: true 
      },
    });
  }
  
  return authUser;
};

// Function to get auth user without email verification requirement (for certain operations)
export const getUnverifiedAuthUser = (context) => {
  return getAuthUser(context);
};

export const checkRole = (user, requiredRole) => {
  if (user.role !== requiredRole) {
    throw new GraphQLError('Not authorized', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
};