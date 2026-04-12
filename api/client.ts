"use client";
import { ApolloClient, ApolloLink, InMemoryCache, Observable, createHttpLink, fromPromise, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
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

let isRefreshing = false;
let pendingRequests = [];
const resolvePendingRequests = () => { pendingRequests.forEach(resolve => resolve()); pendingRequests = []; };

const getNewToken = async () => {
  const refreshToken = await AsyncStorage.getItem('@dandan_refresh_token');
  const role = await AsyncStorage.getItem('@dandan_role');
  if (!refreshToken) throw new Error("No refresh token");

  const endpoint = role === 'merchant' ? '/merchants/auth/refresh' : '/users/auth/refresh';
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();

  if (data.token && data.refreshToken) {
    await AsyncStorage.setItem('@dandan_auth_token', data.token);
    await AsyncStorage.setItem('@dandan_refresh_token', data.refreshToken);
    return data.token;
  }
  throw new Error("Invalid token payload");
};

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const isUnauthorized =
    (networkError && networkError.statusCode === 401) ||
    (graphQLErrors && graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('401') || err.message.includes('Unauthorized')));

  if (isUnauthorized) {
    let forward$;
    if (!isRefreshing) {
      isRefreshing = true;
      forward$ = fromPromise(
        getNewToken().then((newToken) => {
          resolvePendingRequests();
          return newToken;
        }).catch((error) => {
          pendingRequests = [];
          AsyncStorage.multiRemove(['@dandan_auth_token', '@dandan_refresh_token', '@dandan_user', '@dandan_role']);
          throw error;
        }).finally(() => {
          isRefreshing = false;
        })
      ).flatMap((newToken) => {
        const oldHeaders = operation.getContext().headers;
        operation.setContext({
          headers: {
            ...oldHeaders,
            authorization: `Bearer ${newToken}`,
          },
        });
        return forward(operation);
      });
    } else {
      forward$ = fromPromise(new Promise(resolve => {
        pendingRequests.push(() => resolve());
      })).flatMap(() => forward(operation));
    }
    return forward$;
  }
});

// Initialize Apollo Client with Logging and Auth Support
export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, loggingLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

// Toggle environment driven by Expo Config (from .env)
const isMock = process.env.EXPO_PUBLIC_ENV === 'mock';

console.log(`🌐 App started in ${process.env.EXPO_PUBLIC_ENV} environment, connecting to ${GRAPHQL_URL}`);

export const IS_MOCK = isMock;

// Hooks — delegate to mock or real Apollo based on environment
export const useQuery = (query, options = {}) => {
  if (isMock) return mockClient.useQuery(query, options);
  const gqlQuery = typeof query === 'string' ? gql`${query}` : query;
  return useApolloQuery(gqlQuery, options);
};

export const useMutation = (mutation, options = {}) => {
  if (isMock) return mockClient.useMutation(mutation, options);
  const gqlMutation = typeof mutation === 'string' ? gql`${mutation}` : mutation;
  return useApolloMutation(gqlMutation, options);
};


// Export Queries/Mutations from the mock database/schema
export const GET_MERCHANTS = mockClient.GET_MERCHANTS;
export const GET_PROGRAMS = mockClient.GET_PROGRAMS;
export const GET_WALLET = mockClient.GET_WALLET;
export const GET_DAILY_QUESTS = mockClient.GET_DAILY_QUESTS;
export const GET_OFFERS = mockClient.GET_OFFERS;
export const GET_CHAT_SUGGESTIONS = mockClient.GET_CHAT_SUGGESTIONS;
export const DEDUCT_POINTS = mockClient.DEDUCT_POINTS;
export const EARN_POINTS = mockClient.EARN_POINTS;
export const GET_RECENT_STORES = mockClient.GET_RECENT_STORES;
export const GET_REWARDS = mockClient.GET_REWARDS;

export const AUTHENTICATE = `
  mutation Authenticate($email: String!) {
    authenticate(email: $email) {
      success
      message
      expiresIn
      cooldown
    }
  }
`;

export const VERIFY_OTP = `
  mutation VerifyOtp($email: String!, $otp: String!) {
    verifyOtp(email: $email, otp: $otp) {
      user {
        role
        isEmailVerified
        id
        email
        createdAt
      }
      token
      tokenType
      success
      refreshToken
      message
      isNewUser
      expiresIn
    }
  }
`;
