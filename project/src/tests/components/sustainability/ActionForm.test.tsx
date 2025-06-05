import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ActionForm from '../../../components/sustainability/ActionForm';
import { CREATE_SUSTAINABILITY_ACTION } from '../../../graphql/mutations';

const mocks = [
  {
    request: {
      query: CREATE_SUSTAINABILITY_ACTION,
      variables: {
        input: {
          actionType: 'REUSABLE_BOTTLE',
          description: 'Test description',
          performedAt: expect.any(String),
        },
      },
    },
    result: {
      data: {
        createSustainabilityAction: {
          id: '1',
          actionType: 'REUSABLE_BOTTLE',
          description: 'Test description',
          impactScore: 50,
          performedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  },
];

describe('ActionForm', () => {
  it('renders form elements correctly', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ActionForm />
      </MockedProvider>
    );

    expect(screen.getByText('Log Sustainability Action')).toBeInTheDocument();
    expect(screen.getByLabelText(/Action Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Action/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting without action type', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ActionForm />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Log Action/i }));

    await waitFor(() => {
      expect(screen.getByText('Please select an action type')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    const onSuccess = jest.fn();
    
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ActionForm onSuccess={onSuccess} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/Action Type/i), {
      target: { value: 'REUSABLE_BOTTLE' },
    });

    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test description' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Log Action/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});