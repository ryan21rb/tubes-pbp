import React, { useState, useEffect, useContext } from 'react';
import LandingPage from './pages/landingpage';
import ValidatorDashboard from './pages/instansi';
import YayasanPage from './pages/yayasan';
import PenerimaPage from './pages/penerima';
import DonaturPage from './pages/donatur';
import TransactionExplorerPage from './pages/transaction_explorer';
import { PhilanthropyContext, PhilanthropyProvider } from './context/PhilanthropyContext';

function AppRouter() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const { apiToken, userRole, logout } = useContext(PhilanthropyContext);

  useEffect(() => {
    // Reset to landing page on initial load/refresh
    window.location.hash = '#/';

    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogoutClick = async () => {
    await logout();
    window.location.hash = '#/';
  };

  const handleLoginClick = () => {
    window.location.hash = '#/login';
  };

  // Guard routing based on authentication token and user role
  useEffect(() => {
    const isLanding = currentHash === '#/' || currentHash === '' || currentHash === '#';
    const isLoginOrRegister = currentHash === '#/login' || currentHash === '#/register';
    const isExplorerRoute = currentHash.startsWith('#/tx/');

    if (isExplorerRoute) {
      // Allow transaction explorer routes to render without redirection
      return;
    }

    if (apiToken) {
      // User is logged in
      const roleLower = (userRole || '').toLowerCase();
      
      // Determine expected hash based on user role
      let expectedHash = '#/';
      if (roleLower === 'yayasan') {
        expectedHash = '#/yayasan';
      } else if (roleLower === 'instansi') {
        expectedHash = '#/instansi';
      } else if (roleLower === 'penerima') {
        expectedHash = '#/penerima';
      } else if (roleLower === 'donatur') {
        expectedHash = '#/donatur';
      }

      // Redirect if user tries to visit login/register, or if they are on a protected page that is not their dashboard
      if (isLoginOrRegister || (!isLanding && currentHash !== expectedHash)) {
        window.location.hash = expectedHash;
      }
    } else {
      // User is not logged in, block protected pages
      if (!isLanding && !isLoginOrRegister) {
        window.location.hash = '#/';
      }
    }
  }, [currentHash, apiToken, userRole]);

  const renderPage = () => {
    if (currentHash.startsWith('#/tx/')) {
      return <TransactionExplorerPage />;
    }

    switch (currentHash) {
      case '#/donatur':
        return <DonaturPage onLogoutClick={handleLogoutClick} />;
      case '#/penerima':
        return <PenerimaPage onLogoutClick={handleLogoutClick} />;
      case '#/yayasan':
        return <YayasanPage onLogoutClick={handleLogoutClick} />;
      case '#/instansi':
        return <ValidatorDashboard onLogoutClick={handleLogoutClick} />;
      case '#/':
      default:
        return <LandingPage onLoginClick={handleLoginClick} />;
    }
  };

  return renderPage();
}

function App() {
  return (
    <PhilanthropyProvider>
      <AppRouter />
    </PhilanthropyProvider>
  );
}

export default App;