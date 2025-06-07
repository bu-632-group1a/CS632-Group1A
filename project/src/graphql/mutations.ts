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
        email
        role
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
        email
        role
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
        email
        profilePicture
        role
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
      email
      profilePicture
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;