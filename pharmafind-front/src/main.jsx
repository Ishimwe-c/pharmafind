import React from 'react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'
import './index.css'

/**
 * Main application entry point
 * 
 * Renders the App component wrapped with ErrorBoundary for error handling
 * The App component contains all necessary providers and routing
 */
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
