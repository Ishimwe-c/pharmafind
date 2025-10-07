import React, { useState, useEffect } from 'react';

const PWAStatus = () => {
  const [pwaStatus, setPwaStatus] = useState({
    isInstalled: false,
    isStandalone: false,
    hasServiceWorker: false,
    isOnline: navigator.onLine
  });

  useEffect(() => {
    // Check if app is installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    
    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if service worker is registered
    let hasServiceWorker = false;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        hasServiceWorker = !!registration;
        setPwaStatus(prev => ({ ...prev, hasServiceWorker }));
      });
    }

    setPwaStatus(prev => ({
      ...prev,
      isInstalled,
      isStandalone
    }));

    // Listen for online/offline events
    const handleOnline = () => setPwaStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

//   return (
//     <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
//       {/* <div>PWA Status:</div>
//       <div>Installed: {pwaStatus.isInstalled ? '✅' : '❌'}</div>
//       <div>Standalone: {pwaStatus.isStandalone ? '✅' : '❌'}</div>
//       <div>Service Worker: {pwaStatus.hasServiceWorker ? '✅' : '❌'}</div>
//       <div>Online: {pwaStatus.isOnline ? '✅' : '❌'}</div> */}
//     </div>
//   );
};

export default PWAStatus;






