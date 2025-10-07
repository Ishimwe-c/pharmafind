import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SearchHistoryContext = createContext();

export const useSearchHistory = () => {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
};

// Helper functions for localStorage operations
const STORAGE_KEY = 'pharmafind_search_history';

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        console.warn('Search history is not an array, returning empty array');
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error loading search history:', error);
    return [];
  }
};

const saveToStorage = (data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Error saving search history:', error);
    return false;
  }
};

export const SearchHistoryProvider = ({ children }) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load search history from localStorage on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      const loadedData = loadFromStorage();
      setSearchHistory(loadedData);
      setIsLoading(false);
      setIsInitialized(true);
      hasLoadedRef.current = true;
    }
  }, []);

  // Save search history to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (isInitialized && hasLoadedRef.current) {
      saveToStorage(searchHistory);
    }
  }, [searchHistory, isInitialized]);

  // Add a new search to history
  const addSearch = (searchData) => {
    const newSearch = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      searchTerm: searchData.searchTerm || '',
      insuranceFilter: searchData.insuranceFilter || '',
      location: searchData.location || '',
      resultsCount: searchData.resultsCount || 0,
      filters: searchData.filters || {}
    };

    setSearchHistory(prev => {
      // Remove duplicate searches (same search term and filters)
      const filtered = prev.filter(search => 
        !(search.searchTerm === newSearch.searchTerm && 
          search.insuranceFilter === newSearch.insuranceFilter &&
          search.location === newSearch.location)
      );
      
      // Add new search at the beginning and limit to 20 items
      return [newSearch, ...filtered].slice(0, 20);
    });
  };

  // Remove a specific search from history
  const removeSearch = (searchId) => {
    setSearchHistory(prev => prev.filter(search => search.id !== searchId));
  };

  // Clear all search history
  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error removing search history from localStorage:', error);
    }
  };

  // Get recent searches (last 10)
  const getRecentSearches = (limit = 10) => {
    return searchHistory.slice(0, limit);
  };

  // Get search statistics
  const getSearchStats = () => {
    const totalSearches = searchHistory.length;
    const uniqueTerms = new Set(searchHistory.map(s => s.searchTerm.toLowerCase())).size;
    const mostUsedInsurance = searchHistory
      .filter(s => s.insuranceFilter)
      .reduce((acc, s) => {
        acc[s.insuranceFilter] = (acc[s.insuranceFilter] || 0) + 1;
        return acc;
      }, {});
    
    const topInsurance = Object.entries(mostUsedInsurance)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalSearches,
      uniqueTerms,
      topInsurance: topInsurance ? topInsurance[0] : null,
      topInsuranceCount: topInsurance ? topInsurance[1] : 0
    };
  };

  const value = {
    searchHistory,
    isLoading,
    isInitialized,
    addSearch,
    removeSearch,
    clearHistory,
    getRecentSearches,
    getSearchStats
  };

  return (
    <SearchHistoryContext.Provider value={value}>
      {children}
    </SearchHistoryContext.Provider>
  );
};

export default SearchHistoryProvider;










