
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import { SearchHistoryProvider } from './context/SearchHistoryContext';
import { SidebarProvider } from './context/SidebarContext';
import { QueryProvider } from './context/QueryProvider';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAStatus from './components/PWAStatus';
import router from './router';
import './index.css';
import './styles/print.css';

/**
 * Main App Component
 * 
 * Wraps the application with necessary providers and router
 * This is the root component that initializes all context providers
 * and sets up routing for the entire application
 */
function App() {
  return (
    <React.StrictMode>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>
            <GoogleMapsProvider>
              <SearchHistoryProvider>
                <SidebarProvider>
                  <RouterProvider router={router} />
                  <PWAInstallPrompt />
                  <PWAStatus />
                </SidebarProvider>
              </SearchHistoryProvider>
            </GoogleMapsProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </React.StrictMode>
  );
}

export default App;
