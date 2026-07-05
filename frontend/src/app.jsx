import React, { useState, useEffect, useContext } from 'react';
import LandingPage from './pages/landingpage';
import ValidatorDashboard from './pages/instansi';
import YayasanPage from './pages/yayasan';
import PenerimaPage from './pages/penerima';
import DonaturPage from './pages/donatur';
import { PhilanthropyContext, PhilanthropyProvider } from './context/PhilanthropyContext';

function AppRouter() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const { apiToken, userRole, logout } = useContext(PhilanthropyContext);

  useEffect(() => {
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
    const isLandingOrLogin = currentHash === '#/' || currentHash === '#/login' || currentHash === '#/register';

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
        if (currentHash === '#/penerima') {
          expectedHash = '#/penerima';
        } else {
          expectedHash = '#/donatur';
        }
      }

      // Redirect if current page does not match expected role page
      if (isLandingOrLogin || currentHash !== expectedHash) {
        window.location.hash = expectedHash;
      }
    } else {
      // User is not logged in, block protected pages
      if (!isLandingOrLogin) {
        window.location.hash = '#/';
      }
    }
  }, [currentHash, apiToken, userRole]);

  const renderPage = () => {
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