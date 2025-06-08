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

  input ForgotPasswordInput {
    email: String!
  }

  input ResetPasswordInput {
    token: String!
    newPassword: String!
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
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

  type PasswordResetResponse {
    success: Boolean!
    message: String!
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
    userId: String!
    fullName: String!
    profilePicture: String
    location: String
    company: String
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

  # Bingo Types
  type BingoItem {
    id: ID!
    text: String!
    position: Int!
    category: BingoCategory!
    points: Int!
    isActive: Boolean!
    createdBy: String!
    createdAt: String!
    updatedAt: String!
  }

  enum BingoCategory {
    TRANSPORT
    ENERGY
    WASTE
    WATER
    FOOD
    COMMUNITY
    DIGITAL
    GENERAL
  }

  input CreateBingoItemInput {
    text: String!
    position: Int!
    category: BingoCategory
    points: Int
    isActive: Boolean
  }

  input UpdateBingoItemInput {
    text: String
    position: Int
    category: BingoCategory
    points: Int
    isActive: Boolean
  }

  type BingoCompletedItem {
    item: BingoItem!
    completedAt: String!
  }

  type BingoAchievement {
    type: BingoType!
    pattern: [Int!]!
    achievedAt: String!
    pointsAwarded: Int!
  }

  enum BingoType {
    ROW
    COLUMN
    DIAGONAL
  }

  type BingoGame {
    id: ID!
    userId: String!
    completedItems: [BingoCompletedItem!]!
    bingosAchieved: [BingoAchievement!]!
    totalPoints: Int!
    isCompleted: Boolean!
    gameStartedAt: String!
    gameCompletedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type BingoLeaderboardEntry {
    userId: String!
    fullName: String!
    profilePicture: String
    location: String
    company: String
    totalPoints: Int!
    completedItemsCount: Int!
    bingosCount: Int!
    rank: Int!
    isCompleted: Boolean!
    gameCompletedAt: String
  }

  type BingoStats {
    totalGames: Int!
    completedGames: Int!
    totalBingos: Int!
    averageCompletionRate: Float!
  }

  type BingoItemCompletedEvent {
    userId: String!
    itemId: ID!
    item: BingoItem!
  }

  type BingoAchievedEvent {
    userId: String!
    bingo: BingoAchievement!
    game: BingoGame!
  }

  type EasyBingoCompletionResult {
    game: BingoGame!
    completedItem: BingoItem!
    message: String!
  }

  type Query {
    me: User!
    users: [User!]!
    sustainabilityActions(filter: SustainabilityActionFilterInput): [SustainabilityAction!]!
    sustainabilityAction(id: ID!): SustainabilityAction
    sustainabilityMetrics(userId: String): SustainabilityMetrics!
    leaderboard(limit: Int): [LeaderboardEntry!]!
    allUserMetrics: [UserSustainabilityMetrics!]!
    
    # Bingo Queries
    bingoItems: [BingoItem!]!
    bingoGame: BingoGame!
    bingoLeaderboard(limit: Int): [BingoLeaderboardEntry!]!
    bingoStats: BingoStats!
    easyBingoItems: [BingoItem!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    forgotPassword(input: ForgotPasswordInput!): PasswordResetResponse!
    resetPassword(input: ResetPasswordInput!): PasswordResetResponse!
    changePassword(input: ChangePasswordInput!): PasswordResetResponse!
    refreshToken(refreshToken: String!): TokenPayload!
    logout(refreshToken: String!): Boolean!
    updateProfilePicture(input: UpdateProfileInput!): User!
    updateUserProfile(input: UpdateUserProfileInput!): User!
    verifyEmail(token: String!): Boolean!
    createSustainabilityAction(input: CreateSustainabilityActionInput!): SustainabilityAction!
    updateSustainabilityAction(id: ID!, input: UpdateSustainabilityActionInput!): SustainabilityAction!
    deleteSustainabilityAction(id: ID!): Boolean!
    
    # Bingo Mutations
    createBingoItem(input: CreateBingoItemInput!): BingoItem!
    updateBingoItem(id: ID!, input: UpdateBingoItemInput!): BingoItem!
    toggleBingoItem(itemId: ID!): BingoGame!
    completeEasyBingoItem: EasyBingoCompletionResult!
    resetBingoGame: BingoGame!
    refreshBingoItems: [BingoItem!]!
  }

  type Subscription {
    sustainabilityActionCreated: SustainabilityAction!
    sustainabilityActionUpdated: SustainabilityAction!
    sustainabilityActionDeleted: ID!
    leaderboardUpdated: [LeaderboardEntry!]!
    
    # Bingo Subscriptions
    bingoItemCompleted: BingoItemCompletedEvent!
    bingoAchieved: BingoAchievedEvent!
    bingoGameUpdated: BingoGame!
  }
`;