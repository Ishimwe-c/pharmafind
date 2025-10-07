import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import { useToast } from '../../context/ToastContext';

const SearchHistoryPage = () => {
  const { 
    searchHistory, 
    removeSearch, 
    clearHistory, 
    getSearchStats 
  } = useSearchHistory();
  
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, insurance, text

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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearchClick = (search) => {
    // Navigate to dashboard with search parameters
    const params = new URLSearchParams();
    if (search.insuranceFilter) {
      params.append('insurance', search.insuranceFilter);
    }
    if (search.searchTerm) {
      params.append('search', search.searchTerm);
    }
    
    const queryString = params.toString();
    navigate(`/patient/dashboard${queryString ? `?${queryString}` : ''}`);
    addToast('Search applied from history', 'info');
  };

  const handleRemoveSearch = (searchId) => {
    removeSearch(searchId);
    addToast('Search removed from history', 'info');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      clearHistory();
      addToast('All search history cleared', 'info');
    }
  };

  // Filter searches based on type
  const filteredSearches = searchHistory.filter(search => {
    if (filterType === 'insurance') return search.insuranceFilter && !search.searchTerm;
    if (filterType === 'text') return search.searchTerm && !search.insuranceFilter;
    return true; // all
  });

  // Group searches by date
  const groupedSearches = filteredSearches.reduce((groups, search) => {
    const date = new Date(search.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(search);
    return groups;
  }, {});

  if (searchHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Search History</h1>
                <p className="text-gray-600 mt-2">View and manage your pharmacy search history</p>
              </div>
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <span className="material-icons text-6xl text-gray-300 mb-4">history</span>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Search History</h2>
            <p className="text-gray-500 mb-6">Your recent pharmacy searches will appear here</p>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Searching
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Search History</h1>
              <p className="text-gray-600 mt-2">View and manage your pharmacy search history</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleClearHistory}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Statistics Sidebar */}
          {showStats && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalSearches}</div>
                    <div className="text-sm text-gray-600">Total Searches</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.uniqueTerms}</div>
                    <div className="text-sm text-gray-600">Unique Terms</div>
                  </div>
                  
                  {stats.topInsurance && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{stats.topInsurance}</div>
                      <div className="text-sm text-gray-600">Most Used Insurance</div>
                      <div className="text-xs text-gray-500">({stats.topInsuranceCount} times)</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search History Content */}
          <div className={`${showStats ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  <div className="flex space-x-2">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'insurance', label: 'Insurance' },
                      { key: 'text', label: 'Text Search' }
                    ].map(filter => (
                      <button
                        key={filter.key}
                        onClick={() => setFilterType(filter.key)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filterType === filter.key
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {!showStats && (
                  <button
                    onClick={() => setShowStats(true)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Show Statistics
                  </button>
                )}
              </div>
            </div>

            {/* Search History List */}
            <div className="space-y-6">
              {Object.entries(groupedSearches).map(([date, searches]) => (
                <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {searches.map((search) => (
                      <div
                        key={search.id}
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => handleSearchClick(search)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              {search.searchTerm && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Text: "{search.searchTerm}"
                                </span>
                              )}
                              {search.insuranceFilter && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Insurance: {search.insuranceFilter}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <span className="material-icons text-sm mr-1">schedule</span>
                                {formatTimeAgo(search.timestamp)}
                              </span>
                              <span className="flex items-center">
                                <span className="material-icons text-sm mr-1">access_time</span>
                                {formatDate(search.timestamp)}
                              </span>
                              {search.resultsCount > 0 && (
                                <span className="flex items-center">
                                  <span className="material-icons text-sm mr-1">search</span>
                                  {search.resultsCount} results
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSearch(search.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 ml-4"
                            title="Remove from history"
                          >
                            <span className="material-icons text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHistoryPage;



















