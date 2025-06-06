import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';
import { RetryLink } from '@apollo/client/link/retry';

// Use relative URL in development, full URL in production
const GRAPHQL_HTTP_URL = import.meta.env.DEV ? '/graphql' : 'https://cs632-group1a.onrender.com/graphql';
const GRAPHQL_WS_URL = import.meta.env.DEV 
  ? `ws://${window.location.host}/graphql`
  : 'wss://cs632-group1a.onrender.com/graphql';

// Add auth link to inject authorization header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_state') 
    ? JSON.parse(localStorage.getItem('auth_state')!).accessToken 
    : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Increase timeout and add better error handling for HTTP requests
const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
  credentials: 'include',
  fetchOptions: {
    timeout: 30000, // 30 second timeout
  }
});

// Improve WebSocket connection with better retry logic and connection status handling
const wsLink = new GraphQLWsLink(createClient({
  url: GRAPHQL_WS_URL,
  connectionParams: () => {
    const token = localStorage.getItem('auth_state') 
      ? JSON.parse(localStorage.getItem('auth_state')!).accessToken 
      : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  retryAttempts: 5,
  shouldRetry: (error) => {
    // Retry on network errors and server errors, but not on authentication errors
    return !(error instanceof Error && error.message.includes('Unauthorized'));
  },
  connectionAckWaitTimeout: 10000, // 10 second timeout for connection acknowledgment
  keepAlive: 10000, // Send keep-alive every 10 seconds
}));

// Enhanced retry logic with exponential backoff
const retryLink = new RetryLink({
  delay: {
    initial: 1000, // Start with a 1 second delay
    max: 10000,    // Maximum 10 second delay
    jitter: true   // Add randomness to prevent thundering herd
  },
  attempts: {
    max: 3,
    retryIf: (error, operation) => {
      // Retry on network errors and 5xx server errors
      const isNetworkError = !error.response;
      const isServerError = error.statusCode >= 500;
      return isNetworkError || isServerError;
    }
  }
});

// Improved error handling with more detailed logging and user-friendly messages
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
      );
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`, {
      operation: operation.operationName,
      variables: operation.variables,
    });

    // Check if the error is due to server being unreachable
    if (networkError.message.includes('Failed to fetch')) {
      console.error('Unable to reach the GraphQL server. Please check your internet connection or try again later.');
    }

    return forward(operation);
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  // Combine authLink with httpLink for authenticated HTTP requests
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  link: from([errorLink, retryLink, splitLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'network-only'
    },
    watchQuery: {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first' // Use cache after first successful fetch
    }
  },
  connectToDevTools: true // Enable Apollo dev tools for better debugging
});