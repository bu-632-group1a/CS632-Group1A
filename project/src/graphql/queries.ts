import { gql } from '@apollo/client';

export const GET_SUSTAINABILITY_ACTIONS = gql`
  query GetSustainabilityActions($filter: SustainabilityActionFilterInput) {
    sustainabilityActions(filter: $filter) {
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