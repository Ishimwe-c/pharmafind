import React, { useState } from 'react';
import { useSearchHistory } from '../context/SearchHistoryContext';

const SearchHistory = ({ onSearchSelect }) => {
  const { 
    getRecentSearches, 
    removeSearch, 
    clearHistory, 
    getSearchStats 
  } = useSearchHistory();
  
  const [showAll, setShowAll] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const recentSearches = getRecentSearches(showAll ? 20 : 5);
  const stats = getSearchStats();

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const searchTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - searchTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleSearchClick = (search) => {
    if (onSearchSelect) {
      onSearchSelect({
        searchTerm: search.searchTerm,
        insuranceFilter: search.insuranceFilter,
        location: search.location,
        filters: search.filters
      });
    }
  };

  const handleRemoveSearch = (e, searchId) => {
    e.stopPropagation();
    removeSearch(searchId);
  };

  if (recentSearches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Search History</h3>
        </div>
        <div className="text-center py-6">
          <span className="material-icons text-4xl text-gray-300 mb-2">history</span>
          <p className="text-gray-500 text-sm">No searches yet</p>
          <p className="text-gray-400 text-xs">Your recent searches will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Search History</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Show statistics"
          >
            <span className="material-icons text-sm">analytics</span>
          </button>
          <button
            onClick={clearHistory}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Clear all history"
          >
            <span className="material-icons text-sm">clear_all</span>
          </button>
        </div>
      </div>

      {/* Search Statistics */}
      {showStats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Search Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Total searches:</span>
              <span className="font-medium ml-1">{stats.totalSearches}</span>
            </div>
            <div>
              <span className="text-gray-500">Unique terms:</span>
              <span className="font-medium ml-1">{stats.uniqueTerms}</span>
            </div>
            {stats.topInsurance && (
              <div className="col-span-2">
                <span className="text-gray-500">Most used insurance:</span>
                <span className="font-medium ml-1">{stats.topInsurance}</span>
                <span className="text-gray-400 ml-1">({stats.topInsuranceCount} times)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      <div className="space-y-2">
        {recentSearches.map((search) => (
          <div
            key={search.id}
            onClick={() => handleSearchClick(search)}
            className="group p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {search.searchTerm && (
                  <p className="text-sm font-medium text-gray-900 truncate">
                    "{search.searchTerm}"
                  </p>
                )}
                {search.insuranceFilter && (
                  <p className="text-xs text-purple-600 mt-1">
                    Insurance: {search.insuranceFilter}
                  </p>
                )}
                {search.location && (
                  <p className="text-xs text-blue-600 mt-1">
                    Location: {search.location}
                  </p>
                )}
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(search.timestamp)}
                  </span>
                  {search.resultsCount > 0 && (
                    <span className="text-xs text-gray-500">
                      • {search.resultsCount} results
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => handleRemoveSearch(e, search.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 ml-2"
                title="Remove from history"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {recentSearches.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          {showAll ? 'Show Less' : `Show All (${recentSearches.length})`}
        </button>
      )}
    </div>
  );
};

export default SearchHistory;



















