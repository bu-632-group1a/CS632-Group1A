import { gql } from 'apollo-server-express';

const typeDefs = gql`
  "A sustainability action performed by a user"
  type SustainabilityAction {
    id: ID!
    "Type of sustainability action performed"
    actionType: ActionType!
    "Description or notes about the action"
    description: String
    "Impact score calculated for this action"
    impactScore: Float!
    "Date when the action was performed"
    performedAt: String!
    "Date when the record was created"
    createdAt: String!
    "Date when the record was last updated"
    updatedAt: String!
  }

  "Types of sustainability actions that can be performed"
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

  "Input for creating a new sustainability action"
  input CreateSustainabilityActionInput {
    actionType: ActionType!
    description: String
    impactScore: Float
    performedAt: String
  }

  "Input for updating an existing sustainability action"
  input UpdateSustainabilityActionInput {
    actionType: ActionType
    description: String
    impactScore: Float
    performedAt: String
  }

  "Filter options for querying sustainability actions"
  input SustainabilityActionFilterInput {
    actionType: ActionType
    fromDate: String
    toDate: String
  }

  "Aggregated metrics about sustainability actions"
  type SustainabilityMetrics {
    "Total number of actions recorded"
    totalActions: Int!
    "Sum of impact scores across all actions"
    totalImpact: Float!
    "Count of actions by type"
    actionsByType: [ActionTypeCount!]!
    "Average impact score"
    averageImpact: Float!
  }

  "Count of actions by type"
  type ActionTypeCount {
    "Type of sustainability action"
    actionType: ActionType!
    "Number of actions of this type"
    count: Int!
  }

  "Root Query type"
  type Query {
    "Get all sustainability actions"
    sustainabilityActions(filter: SustainabilityActionFilterInput): [SustainabilityAction!]!
    "Get a specific sustainability action by ID"
    sustainabilityAction(id: ID!): SustainabilityAction
    "Get aggregated metrics about sustainability actions"
    sustainabilityMetrics: SustainabilityMetrics!
  }

  "Root Mutation type"
  type Mutation {
    "Create a new sustainability action"
    createSustainabilityAction(input: CreateSustainabilityActionInput!): SustainabilityAction!
    "Update an existing sustainability action"
    updateSustainabilityAction(id: ID!, input: UpdateSustainabilityActionInput!): SustainabilityAction!
    "Delete a sustainability action"
    deleteSustainabilityAction(id: ID!): Boolean!
  }

  "Root Subscription type"
  type Subscription {
    "Subscribe to sustainability action creation events"
    sustainabilityActionCreated: SustainabilityAction!
    "Subscribe to sustainability action update events"
    sustainabilityActionUpdated: SustainabilityAction!
    "Subscribe to sustainability action deletion events"
    sustainabilityActionDeleted: ID!
  }
`;

export default typeDefs;