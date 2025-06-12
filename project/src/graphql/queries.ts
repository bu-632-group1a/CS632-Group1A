import { gql } from '@apollo/client';

export const CREATE_SUSTAINABILITY_ACTION = gql`
  mutation CreateSustainabilityAction($input: CreateSustainabilityActionInput!) {
    createSustainabilityAction(input: $input) {
      id
      actionType
      description
      impactScore
      performedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUSTAINABILITY_ACTIONS = gql`
  query GetSustainabilityActions($filter: SustainabilityActionFilterInput) {
    sustainabilityActions(filter: $filter) {
      id
      actionType
      description
      impactScore
      performedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUSTAINABILITY_METRICS = gql`
  query GetSustainabilityMetrics($userId: String) {
    sustainabilityMetrics(userId: $userId) {
      totalActions
      totalImpact
      averageImpact
      actionsByType {
        actionType
        count
      }
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int) {
    leaderboard(limit: $limit) {
      userId
      fullName
      profilePicture
      totalActions
      totalImpact
      averageImpact
      actionsByType {
        actionType
        count
      }
      rank
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      firstName
      lastName
      fullName
      username
      email
      profilePicture
      city
      state
      company
      location
      role
      isEmailVerified
      createdAt
      updatedAt
    }
  }
`;

// Bingo Queries
export const GET_BINGO_ITEMS = gql`
  query GetBingoItems {
    bingoItems {
      id
      text
      position
      category
      points
      isActive
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const GET_BINGO_GAME = gql`
  query GetBingoGame {
    bingoGame {
      id
      userId
      completedItems {
        item {
          id
          text
          position
          category
          points
          isActive
        }
        completedAt
      }
      bingosAchieved {
        type
        pattern
        achievedAt
        pointsAwarded
      }
      totalPoints
      isCompleted
      gameStartedAt
      gameCompletedAt
      createdAt
      updatedAt
    }
  }
`;

export const USERS = gql`
  query Users {
    users {
      id
      firstName
      lastName
      fullName
      username
      email
      profilePicture
      city
      state
      company
      location
      role
      isEmailVerified
      createdAt
      updatedAt
    }
  }
`;

export const GET_BINGO_LEADERBOARD = gql`
  query GetBingoLeaderboard($limit: Int) {
    bingoLeaderboard(limit: $limit) {
      userId
      fullName
      profilePicture
      location
      company
      totalPoints
      completedItemsCount
      bingosCount
      rank
      isCompleted
      gameCompletedAt
    }
  }
`;

export const GET_BINGO_STATS = gql`
  query GetBingoStats {
    bingoStats {
      totalGames
      completedGames
      totalBingos
      averageCompletionRate
    }
  }
`;

// Get default bingo game query
export const GET_DEFAULT_BINGO_GAME = gql`
  query GetDefaultBingoGame {
    easyBingoItems {
      id
      text
      position
      category
      points
      isActive
      createdBy
      createdAt
      updatedAt
    }
  }
`;