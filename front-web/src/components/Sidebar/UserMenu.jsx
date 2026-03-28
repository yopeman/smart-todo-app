import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, LogOut, Sun, Moon, LayoutGrid, List as ListIcon, Info, HelpCircle, Mail } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { theme, setTheme, layout, setLayout } = useAppContext();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="font-medium">Settings & More</span>
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preferences</div>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} className="mr-3" /> : <Moon size={16} className="mr-3" />}
            Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          
          <button 
            onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {layout === 'grid' ? <ListIcon size={16} className="mr-3" /> : <LayoutGrid size={16} className="mr-3" />}
            Switch to {layout === 'grid' ? 'List' : 'Grid'} View
          </button>

          <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Help</div>

          <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Info size={16} className="mr-3" /> About
          </button>
          <a href="mailto:yopeman318@gmail.com" className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Mail size={16} className="mr-3" /> Contact
          </a>
          <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <HelpCircle size={16} className="mr-3" /> Help / FAQ
          </button>

          <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
          
          <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={16} className="mr-3" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
