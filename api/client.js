import * as mockClient from '../mocks/graphqlMock';

// In a real application, you would configure Apollo Client, URQL, or Relay here.
const realClient = {
    useQuery: () => {
        console.warn("Real network not hooked up yet.");
        return { data: null, loading: false, error: new Error('Not implemented') };
    },
    useMutation: () => [
        () => console.warn("Real network not hooked up yet."),
        { loading: false, error: new Error('Not implemented') }
    ],
    GET_PROGRAMS: 'REAL_GET_PROGRAMS',
    GET_WALLET: 'REAL_GET_WALLET',
    GET_DAILY_QUESTS: 'REAL_GET_DAILY_QUESTS',
    GET_OFFERS: 'REAL_GET_OFFERS',
    DEDUCT_POINTS: 'REAL_DEDUCT_POINTS',
    EARN_POINTS: 'REAL_EARN_POINTS',
};

// Toggle environment driven by Expo Config (from .env)
// Forcing to true here because Metro needs a restart to pick up .env changes
const isMock = process.env.EXPO_PUBLIC_ENV === 'mock' || true;

if (isMock) {
    console.log("🛠️ App started in MOCK environment, using mock GraphQL client.");
}

export const useQuery = isMock ? mockClient.useQuery : realClient.useQuery;
export const useMutation = isMock ? mockClient.useMutation : realClient.useMutation;

export const GET_PROGRAMS = isMock ? mockClient.GET_PROGRAMS : realClient.GET_PROGRAMS;
export const GET_WALLET = isMock ? mockClient.GET_WALLET : realClient.GET_WALLET;
export const GET_DAILY_QUESTS = isMock ? mockClient.GET_DAILY_QUESTS : realClient.GET_DAILY_QUESTS;
export const GET_OFFERS = isMock ? mockClient.GET_OFFERS : realClient.GET_OFFERS;
export const DEDUCT_POINTS = isMock ? mockClient.DEDUCT_POINTS : realClient.DEDUCT_POINTS;
export const EARN_POINTS = isMock ? mockClient.EARN_POINTS : realClient.EARN_POINTS;
