import React from 'react';
import MainLayout from './components/Layout/MainLayout';
import { useAppContext } from './context/AppContext';
import ProjectGrid from './components/Project/ProjectGrid';
import { Toaster } from 'react-hot-toast';

function App() {
  const { projectFilter } = useAppContext();

  return (
    <MainLayout>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white border dark:border-gray-700 shadow-lg' }} />
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold capitalize text-gray-800 dark:text-gray-100 tracking-tight">
            {projectFilter.replace('_', ' ')}
          </h1>
        </div>
        <ProjectGrid />
      </div>
    </MainLayout>
  );
}

export default App;
