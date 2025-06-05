import { gql } from '@apollo/client';

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
  query GetSustainabilityMetrics {
    sustainabilityMetrics {
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