import React, { useState, useEffect } from 'react';
import LandingPage from './pages/landingpage';
import ValidatorDashboard from './pages/instansi';
import YayasanPage from './pages/yayasan';
import PenerimaPage from './pages/penerima';
import DonaturPage from './pages/donatur';
import { PhilanthropyProvider } from './context/PhilanthropyContext';

function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleHomeClick = () => { 
    window.location.hash = '#/'; 
  };

  const handleLoginClick = () => {
    window.location.hash = '#/login';
  };

  const handleRegisterClick = () => {
    window.location.hash = '#/register';
  };

  const renderPage = () => {
    switch (currentHash) {
      case '#/donatur':
        return <DonaturPage onLogoutClick={handleHomeClick} />;
      case '#/penerima':
        return <PenerimaPage onLogoutClick={handleHomeClick} />;
      case '#/yayasan':
        return <YayasanPage onLogoutClick={handleHomeClick} />;
      case '#/instansi':
        return <ValidatorDashboard onLogoutClick={handleHomeClick} />;
      case '#/':
      default:
        return <LandingPage onLoginClick={handleLoginClick} />;
    }
  };

  return (
    <PhilanthropyProvider>
      {renderPage()}
    </PhilanthropyProvider>
  );
}

export default App;