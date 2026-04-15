"use client";
import { ApolloClient, ApolloLink, InMemoryCache, Observable, createHttpLink, fromPromise, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useMutation as useApolloMutation, useQuery as useApolloQuery } from '@apollo/client/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GraphQL server URI from .env
const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

// Create HTTP Link
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
});

// Logging link
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
          if (err?.name === 'AbortError') return; // benign — component unmounted mid-request
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

// Auth link — attaches Bearer token to every request
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await AsyncStorage.getItem('@dandan_auth_token');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      }
    };
  } catch (e) {
    return { headers };
  }
});

// Token refresh logic
let isRefreshing = false;
let pendingRequests: (() => void)[] = [];
const resolvePendingRequests = () => { pendingRequests.forEach(resolve => resolve()); pendingRequests = []; };

const getNewToken = async () => {
  const refreshToken = await AsyncStorage.getItem('@dandan_refresh_token');
  const role = await AsyncStorage.getItem('@dandan_role');
  if (!refreshToken) throw new Error('No refresh token');

  const endpoint = role === 'merchant' ? '/merchants/auth/refresh' : '/users/auth/refresh';
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();

  if (data.token && data.refreshToken) {
    await AsyncStorage.setItem('@dandan_auth_token', data.token);
    await AsyncStorage.setItem('@dandan_refresh_token', data.refreshToken);
    return data.token;
  }
  throw new Error('Invalid token payload');
};

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  // Suppress AbortErrors — benign in React Strict Mode dev (component unmounts
  // while a query is in-flight on the first mount, then remounts cleanly).
  if (networkError && networkError.name === 'AbortError') return;

  const isUnauthorized =
    (networkError && (networkError as any).statusCode === 401) ||
    (graphQLErrors && graphQLErrors.some(err =>
      err.extensions?.code === 'UNAUTHENTICATED' ||
      err.message.includes('401') ||
      err.message.includes('Unauthorized')
    ));

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
          headers: { ...oldHeaders, authorization: `Bearer ${newToken}` },
        });
        return forward(operation);
      });
    } else {
      forward$ = fromPromise(new Promise<void>(resolve => {
        pendingRequests.push(() => resolve());
      })).flatMap(() => forward(operation));
    }
    return forward$;
  }
});

// Apollo Client — always connects to the real backend
export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, loggingLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

console.log(`🌐 Connecting to GraphQL: ${GRAPHQL_URL}`);

// Always use real Apollo hooks
export const useQuery = (query: any, options: any = {}) => {
  const gqlQuery = typeof query === 'string' ? gql`${query}` : query;
  return useApolloQuery(gqlQuery, options);
};

export const useMutation = (mutation: any, options: any = {}) => {
  const gqlMutation = typeof mutation === 'string' ? gql`${mutation}` : mutation;
  return useApolloMutation(gqlMutation, options);
};

// ── GraphQL Query / Mutation strings ──────────────────────────────────────────

export const GET_MERCHANTS = `
  query GetMerchants {
    merchants { id name category categoryEmoji distance rating reviewCount open address phone hours website image description tags visitCount programs { id name desc active icon color segments } offers { id title desc discount expires } reviews { author rating text date } }
  }
`;

export const GET_PROGRAMS = `
  query GetPrograms {
    programs {
      id name desc active color icon segments { label color type value }
    }
  }
`;

export const GET_WALLET = `
  query GetWallet {
    wallet {
      balance transactions { id merchant amount type date }
    }
  }
`;

export const GET_DAILY_QUESTS = `
  query GetDailyQuests {
    dailyQuests {
      id title desc points icon completed
    }
  }
`;

export const GET_OFFERS = `
  query GetOffers {
    offers {
      id title desc image price discount expires
    }
  }
`;

export const GET_CHAT_SUGGESTIONS = `
  query GetChatSuggestions {
    chatSuggestions {
      id
      question
      responseType
      responseText
      shops { name rating distance img }
      featured { title sub img }
      deals { title price loc }
    }
  }
`;

export const DEDUCT_POINTS = `
  mutation DeductPoints($amount: Int!, $merchant: String!) {
    deductPoints(amount: $amount, merchant: $merchant) {
      success wallet { balance }
    }
  }
`;

export const EARN_POINTS = `
  mutation EarnPoints($amount: Int!, $merchant: String!) {
    earnPoints(amount: $amount, merchant: $merchant) {
      success wallet { balance }
    }
  }
`;

export const GET_RECENT_STORES = `
  query GetRecentStores {
    recentStores {
      id name visitDate pointsEarned
    }
  }
`;

export const GET_REWARDS = `
  query GetRewards {
    rewards {
      id name description type price pointsPrice stock isEnabled imageUrl merchantId
    }
  }
`;

export const GET_NEARBY = `
  query GetNearby {
    merchants { id name category categoryEmoji distance rating reviewCount open address phone hours website image description tags visitCount programs { id name desc active icon color segments } offers { id title desc discount expires } reviews { author rating text date } }
  }
`;

export const GET_NOTIFICATIONS = `
  query GetNotifications {
    notifications { id title message type date read link }
  }
`;

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
