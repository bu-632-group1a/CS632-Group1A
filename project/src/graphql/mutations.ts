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