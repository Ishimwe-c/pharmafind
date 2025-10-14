import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import geolocationService from '../services/geolocationService';
import axiosClient from '../axios-client';

/**
 * InsuranceMatchTracker Component
 * 
 * Monitors patient location and sends notifications when they're near
 * pharmacies that accept their insurance
 * 
 * This component runs in the background when enabled
 */
const InsuranceMatchTracker = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [error, setError] = useState(null);

  // Check initial permissions on mount
  useEffect(() => {
    checkPermissions();
    
    // Load tracking preference from localStorage
    const savedPreference = localStorage.getItem('insuranceMatchTracking');
    if (savedPreference === 'enabled') {
      startTracking();
    }
    
    // Cleanup on unmount
    return () => {
      if (isTracking) {
        geolocationService.stopTracking();
      }
    };
  }, []);

  /**
   * Check if we have necessary permissions
   */
  const checkPermissions = () => {
    const geolocationSupported = geolocationService.isSupported();
    const notificationSupported = 'Notification' in window;
    const notificationPermission = notificationSupported ? Notification.permission : 'not-supported';
    
    setHasPermission(
      geolocationSupported &&
      notificationSupported &&
      (notificationPermission === 'granted' || notificationPermission === 'default')
    );
  };

  /**
   * Request necessary permissions
   */
  const requestPermissions = async () => {
    try {
      setError(null);
      
      // Request geolocation permission
      await geolocationService.requestPermission();
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }
      
      setHasPermission(true);
      // Don't show success toast here - startTracking() will show it
      
      // Auto-start tracking after permissions granted
      startTracking();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
      setHasPermission(false);
    }
  };

  /**
   * Start location tracking
   */
  const startTracking = async () => {
    if (!hasPermission) {
      requestPermissions();
      return;
    }
    
    // Check if user has any active insurance before enabling tracking
    try {
      const response = await axiosClient.get('/patient-insurances');
      // API already filters by active insurances by default, so just check if there's any data
      const insurances = response.data?.data || [];
      
      if (insurances.length === 0) {
        addToast('Please add and activate at least one insurance before enabling tracking.', 'warning');
        setError('No active insurance found. Please add your insurance first.');
        return;
      }
    } catch (err) {
      console.error('Error checking insurances:', err);
      // Continue anyway, let backend handle it
    }
    
    const started = geolocationService.startTracking(
      (position) => {
        setCurrentPosition(position);
        // Clear timeout errors when we get a successful position
        if (error && error.includes('timed out')) {
          setError(null);
        }
      },
      (err) => {
        const errorMessage = err.message;
        setError(errorMessage);
        
        // Don't stop tracking on timeout errors - let it retry automatically
        if (errorMessage.includes('timed out')) {
          console.log('Timeout error, but keeping tracking active for retry');
          return;
        }
        
        // Stop tracking only for permission denied or position unavailable
        if (errorMessage.includes('Permission denied') || errorMessage.includes('Position unavailable')) {
          setIsTracking(false);
          localStorage.setItem('insuranceMatchTracking', 'disabled');
          geolocationService.stopTracking();
        }
      }
    );
    
    if (started) {
      setIsTracking(true);
      localStorage.setItem('insuranceMatchTracking', 'enabled');
      addToast('Insurance match tracking enabled! You\'ll be notified when near pharmacies that accept your insurance.', 'success');
    }
  };

  /**
   * Stop location tracking
   */
  const stopTracking = () => {
    geolocationService.stopTracking();
    setIsTracking(false);
    setCurrentPosition(null);
    localStorage.setItem('insuranceMatchTracking', 'disabled');
    addToast('Insurance match tracking disabled', 'info');
  };

  /**
   * Toggle tracking on/off
   */
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // Don't render if not patient
  if (!user || user.role !== 'patient') {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-20 right-6 z-40 print:hidden">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
            isTracking 
              ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
              : 'bg-gray-500 hover:bg-gray-600'
          } text-white`}
          title={isTracking ? 'Tracking Active' : 'Enable Insurance Match Tracking'}
        >
          {isTracking ? (
            <span className="material-icons">location_on</span>
          ) : (
            <span className="material-icons">location_off</span>
          )}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed bottom-36 right-6 z-40 bg-white rounded-lg shadow-2xl p-6 w-80 print:hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="material-icons text-teal-600 mr-2">location_searching</span>
              Insurance Match Tracker
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4">
            Get notified when you're near pharmacies that accept your insurance!
          </p>

          {/* Status */}
          <div className={`p-3 rounded-lg mb-4 ${
            isTracking 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center">
              <span className={`material-icons text-sm mr-2 ${
                isTracking ? 'text-green-600' : 'text-gray-500'
              }`}>
                {isTracking ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={`text-sm font-medium ${
                isTracking ? 'text-green-700' : 'text-gray-600'
              }`}>
                {isTracking ? 'Tracking Active' : 'Tracking Disabled'}
              </span>
            </div>
            {currentPosition && (
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Accuracy: {Math.round(currentPosition.accuracy)}m
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={`p-3 border rounded-lg mb-4 ${
              error.includes('timed out') 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                <span className={`material-icons text-sm mr-2 ${
                  error.includes('timed out') ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {error.includes('timed out') ? 'warning' : 'error'}
                </span>
                <p className={`text-xs flex-1 ${
                  error.includes('timed out') ? 'text-yellow-700' : 'text-red-600'
                }`}>
                  {error}
                  {error.includes('timed out') && (
                    <span className="block mt-1 text-yellow-600">
                      Tracking will retry automatically when GPS signal improves.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Permission Warning */}
          {!hasPermission && !isTracking && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-xs text-yellow-800">
                📍 Location and notification permissions are required
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={hasPermission ? toggleTracking : requestPermissions}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isTracking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            <span className="material-icons text-sm mr-2">
              {isTracking ? 'location_off' : 'location_on'}
            </span>
            {isTracking 
              ? 'Stop Tracking' 
              : hasPermission 
                ? 'Start Tracking' 
                : 'Enable Permissions'}
          </button>

          {/* Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">How it works:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-start">
                <span className="material-icons text-xs mr-1 text-teal-600">check</span>
                <span>Monitors your location in the background</span>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-xs mr-1 text-teal-600">check</span>
                <span>Checks for nearby pharmacies (within 500m)</span>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-xs mr-1 text-teal-600">check</span>
                <span>Notifies you when they accept your insurance</span>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-xs mr-1 text-teal-600">check</span>
                <span>Battery-friendly (checks every 30 seconds)</span>
              </li>
            </ul>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 mt-3 italic">
            🔒 Your location is never stored. It's only used to find nearby pharmacies.
          </p>
        </div>
      )}
    </>
  );
};

export default InsuranceMatchTracker;

