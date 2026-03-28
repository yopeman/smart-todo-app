import React from 'react';
import UserProfile from '../Sidebar/UserProfile';
import ProjectFilter from '../Sidebar/ProjectFilter';
import ProjectList from '../Sidebar/ProjectList';
import UserMenu from '../Sidebar/UserMenu';

const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 backdrop-blur-md">
        <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform cursor-default">
          Smart To Do
        </h1>
      </div>
      <div className="flex-1 overflow-y-hidden p-4 flex flex-col">
        <UserProfile />
        <ProjectFilter />
        <ProjectList />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <UserMenu />
      </div>
    </aside>
  );
};

export default Sidebar;
