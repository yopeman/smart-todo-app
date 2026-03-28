import React from 'react';
import { Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const TopBar = () => {
  const { searchQuery, setSearchQuery } = useAppContext();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Space for breadcrumbs or active section title if needed */}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-gray-100 shadow-sm group-focus-within:w-72"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
