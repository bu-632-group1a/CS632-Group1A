import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`
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

export const checkRole = (user, requiredRole) => {
  if (user.role !== requiredRole) {
    throw new GraphQLError('Not authorized', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
};