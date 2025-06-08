import { gql } from '@apollo/client';

export const CREATE_SUSTAINABILITY_ACTION = gql`
  mutation CreateSustainabilityAction($input: CreateSustainabilityActionInput!) {
    createSustainabilityAction(input: $input) {
      id
      actionType
      description
      impactScore
      userId
      performedAt
      createdAt
      updatedAt
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
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
      accessToken
      refreshToken
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
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
      accessToken
      refreshToken
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user {
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
  }
`;

export const UPDATE_PROFILE_PICTURE = gql`
  mutation UpdateProfilePicture($input: UpdateProfileInput!) {
    updateProfilePicture(input: $input) {
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

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
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

export const LOGOUT = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;

// Bingo Mutations
export const CREATE_BINGO_ITEM = gql`
  mutation CreateBingoItem($input: CreateBingoItemInput!) {
    createBingoItem(input: $input) {
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

export const UPDATE_BINGO_ITEM = gql`
  mutation UpdateBingoItem($id: ID!, $input: UpdateBingoItemInput!) {
    updateBingoItem(id: $id, input: $input) {
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

export const TOGGLE_BINGO_ITEM = gql`
  mutation ToggleBingoItem($itemId: ID!) {
    toggleBingoItem(itemId: $itemId) {
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

export const RESET_BINGO_GAME = gql`
  mutation ResetBingoGame {
    resetBingoGame {
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