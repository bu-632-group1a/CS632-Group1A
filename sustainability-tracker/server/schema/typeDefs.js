import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    username: String!
    email: String!
    profilePicture: String
    city: String
    state: String
    company: String
    location: String
    role: UserRole!
    isEmailVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  enum UserRole {
    USER
    ADMIN
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    username: String!
    email: String!
    password: String!
    city: String
    state: String
    company: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    profilePicture: String!
  }

  input UpdateUserProfileInput {
    firstName: String
    lastName: String
    city: String
    state: String
    company: String
    profilePicture: String
  }

  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  type TokenPayload {
    accessToken: String!
    refreshToken: String!
  }

  type SustainabilityAction {
    id: ID!
    actionType: ActionType!
    description: String
    impactScore: Float!
    userId: String!
    performedAt: String!
    createdAt: String!
    updatedAt: String!
  }

  enum ActionType {
    REUSABLE_BOTTLE
    PUBLIC_TRANSPORT
    COMPOSTING
    RECYCLING
    DIGITAL_OVER_PRINT
    RIDESHARE
    ENERGY_SAVING
    WATER_CONSERVATION
    WASTE_REDUCTION
    OTHER
  }

  input CreateSustainabilityActionInput {
    actionType: ActionType!
    description: String
    impactScore: Float
    performedAt: String
    userId: String!
  }

  input UpdateSustainabilityActionInput {
    actionType: ActionType
    description: String
    impactScore: Float
    performedAt: String
  }

  input SustainabilityActionFilterInput {
    actionType: ActionType
    fromDate: String
    toDate: String
    userId: String
  }

  type SustainabilityMetrics {
    totalActions: Int!
    totalImpact: Float!
    actionsByType: [ActionTypeCount!]!
    averageImpact: Float!
  }

  type ActionTypeCount {
    actionType: ActionType!
    count: Int!
  }

  type LeaderboardEntry {
    userId: String
    totalActions: Int!
    totalImpact: Float!
    averageImpact: Float!
    actionsByType: [ActionTypeCount!]!
    rank: Int!
  }

  type UserSustainabilityMetrics {
    userId: String
    totalActions: Int!
    totalImpact: Float!
    averageImpact: Float!
    actionsByType: [ActionTypeCount!]!
    recentActions: [SustainabilityAction!]
  }

  type Query {
    me: User!
    users: [User!]!
    sustainabilityActions(filter: SustainabilityActionFilterInput): [SustainabilityAction!]!
    sustainabilityAction(id: ID!): SustainabilityAction
    sustainabilityMetrics(userId: String): SustainabilityMetrics!
    leaderboard(limit: Int): [LeaderboardEntry!]!
    allUserMetrics: [UserSustainabilityMetrics!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): TokenPayload!
    logout(refreshToken: String!): Boolean!
    updateProfilePicture(input: UpdateProfileInput!): User!
    updateUserProfile(input: UpdateUserProfileInput!): User!
    verifyEmail(token: String!): Boolean!
    createSustainabilityAction(input: CreateSustainabilityActionInput!): SustainabilityAction!
    updateSustainabilityAction(id: ID!, input: UpdateSustainabilityActionInput!): SustainabilityAction!
    deleteSustainabilityAction(id: ID!): Boolean!
  }

  type Subscription {
    sustainabilityActionCreated: SustainabilityAction!
    sustainabilityActionUpdated: SustainabilityAction!
    sustainabilityActionDeleted: ID!
    leaderboardUpdated: [LeaderboardEntry!]!
  }
`;