import React from 'react';
import { useAppContext } from '../../context/AppContext';

const filters = [
  { id: 'my_projects', label: 'My Projects' },
  { id: 'shared_projects', label: 'Shared Projects' },
  { id: 'public_projects', label: 'Public Projects' }
];

const ProjectFilter = () => {
  const { projectFilter, setProjectFilter } = useAppContext();

  return (
    <div className="flex flex-col gap-1 w-full mt-4">
      {filters.map((filter) => {
        const isActive = projectFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => setProjectFilter(filter.id)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default ProjectFilter;
