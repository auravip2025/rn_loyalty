import { ApolloClient, ApolloLink, InMemoryCache, createHttpLink, gql, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useMutation as useApolloMutation, useQuery as useApolloQuery } from '@apollo/client/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as mockClient from '../mocks/graphqlMock';

// Define the GraphQL server URI from environment variables
const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://192.168.0.101:4000/graphql';

// Create HTTP Link
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
});

// Create Logging Link using a manual Observable wrapper for maximum compatibility
const loggingLink = new ApolloLink((operation, forward) => {
  const { operationName, variables } = operation;
  console.log(`🚀 [GraphQL Request]: ${operationName || 'Unnamed'}`, variables || {});

  return new Observable((observer) => {
    let subscription;
    try {
      subscription = forward(operation).subscribe({
        next: (result) => {
          console.log(`✅ [GraphQL Response]: ${operationName || 'Unnamed'}`, result.data);
          observer.next(result);
        },
        error: (err) => {
          console.error(`❌ [GraphQL Error]: ${operationName || 'Unnamed'}`, err);
          observer.error(err);
        },
        complete: () => observer.complete(),
      });
    } catch (e) {
      observer.error(e);
    }
    return () => { if (subscription) subscription.unsubscribe(); };
  });
});

// Create Auth Link for Bearer tokens
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await AsyncStorage.getItem('@dandan_auth_token');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    };
  } catch (e) {
    return { headers };
  }
});

// Initialize Apollo Client with Logging and Auth Support
export const client = new ApolloClient({
  link: ApolloLink.from([loggingLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

// Toggle environment driven by Expo Config (from .env)
const isMock = process.env.EXPO_PUBLIC_ENV === 'mock';

if (isMock) {
  console.log("🛠️ App started in MOCK environment, using mock GraphQL client.");
} else {
  console.log(`🌐 App started in ${process.env.EXPO_PUBLIC_ENV} environment, connecting to ${GRAPHQL_URL}`);
}

export const IS_MOCK = isMock;

// Wrapper hooks to Switch between Mock and Real
export const useQuery = (query, options = {}) => {
  if (isMock) {
    return mockClient.useQuery(query, options);
  }
  // Convert string query to gql if it's not already
  const gqlQuery = typeof query === 'string' ? gql`${query}` : query;
  return useApolloQuery(gqlQuery, options);
};

export const useMutation = (mutation, options = {}) => {
  if (isMock) {
    return mockClient.useMutation(mutation);
  }
  // Convert string mutation to gql if it's not already
  const gqlMutation = typeof mutation === 'string' ? gql`${mutation}` : mutation;
  return useApolloMutation(gqlMutation, options);
};

// Export Queries/Mutations from the mock database/schema
export const GET_MERCHANTS = mockClient.GET_MERCHANTS;
export const GET_PROGRAMS = mockClient.GET_PROGRAMS;
export const GET_WALLET = mockClient.GET_WALLET;
export const GET_DAILY_QUESTS = mockClient.GET_DAILY_QUESTS;
export const GET_OFFERS = mockClient.GET_OFFERS;
export const DEDUCT_POINTS = mockClient.DEDUCT_POINTS;
export const EARN_POINTS = mockClient.EARN_POINTS;

export const AUTHENTICATE = `
  mutation Authenticate($email: String!) {
    authenticate(email: $email) {
      success
      message
      isNew
      user {
        id
        email
      }
    }
  }
`;

export const VERIFY_OTP = `
  mutation VerifyOtp($email: String!, $otp: String!) {
    verifyOtp(email: $email, otp: $otp) {
      success
      message
      token
      user {
        email
        isEmailVerified
      }
    }
  }
`;
