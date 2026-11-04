import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes
      gcTime: 1000 * 60 * 15,   // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Standard Query Key Conventions per Feature:
export const QUERY_KEYS = {
  home: {
    all: ['home'],
    dashboard: () => ['home', 'dashboard'],
    footprint: () => ['home', 'footprint'],
  },
  activities: {
    all: ['activities'],
    categories: () => ['activities', 'categories'],
    list: (category) => ['activities', 'list', category],
    detail: (key) => ['activities', 'detail', key],
    active: () => ['activities', 'active'],
    completed: () => ['activities', 'completed'],
    expired: () => ['activities', 'expired'],
    cycle: (cycleId) => ['activities', 'cycle', cycleId],
    liked: () => ['activities', 'liked'],
    hidden: () => ['activities', 'hidden'],
  },
  community: {
    all: ['community'],
    overview: () => ['community', 'overview'],
    feed: (sort, tag) => ['community', 'feed', sort, tag],
  },
  solar: {
    all: ['solar'],
    estimate: () => ['solar', 'estimate'],
  },
  profile: {
    all: ['profile'],
    me: () => ['profile', 'me'],
    likedActivities: () => ['profile', 'liked-activities'],
    hiddenActivities: () => ['profile', 'hidden-activities'],
  },
};
