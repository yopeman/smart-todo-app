import React, { useState, useEffect } from 'react';
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Analytics from './components/Analytics'
import HowItWorks from './components/HowItWorks'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Dashboard from './components/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('auth_token', token);
      // Change title for visual verification
      document.title = "Smart To Do - Authenticated";
      // Clear token from URL
      window.history.replaceState({}, document.title, "/");
      setIsLoggedIn(true);
    } else {
      // Check if already logged in via localStorage
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    document.title = "Smart To Do - AI-Powered Task Management";
    setIsLoggedIn(false);
  };


  if (isLoggedIn) {
    return <Dashboard logout={handleLogout} />;
  }

  return (
    <div className="app">
      <Header />
      <Hero />
      <Features />
      <div id="analytics">
        <Analytics />
      </div>
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  )
}

export default App

