import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [layout, setLayout] = useState(() => localStorage.getItem('layout') || 'grid');
  const [projectFilter, setProjectFilter] = useState('my_projects');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('layout', layout);
  }, [layout]);

  const value = {
    theme, setTheme,
    layout, setLayout,
    projectFilter, setProjectFilter,
    selectedProjectId, setSelectedProjectId,
    searchQuery, setSearchQuery
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
