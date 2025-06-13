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

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
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

export const REFRESH_ALL_BOARDS = gql`
  mutation RefreshAllBoards {
    refreshAllBoards
  }
`;

// Bingo Mutations
export const CREATE_BINGO_ITEM = gql`
  mutation CreateBingoItem($input: CreateBingoItemInput!) {
    createBingoItem(input: $input) {
      id
      text
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