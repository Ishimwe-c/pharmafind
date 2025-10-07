import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * QueryClient Configuration
 * 
 * Configures React Query with optimal settings for the PharmaFind application
 * Includes caching strategies, retry logic, and stale time configurations
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache data for 10 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      // Retry failed requests up to 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

/**
 * QueryProvider Component
 * 
 * Wraps the application with React Query's QueryClientProvider
 * Provides data fetching, caching, and synchronization capabilities
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Query provider component
 */
export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;










