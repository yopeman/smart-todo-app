import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PROJECTS } from '../../graphql/queries';
import { useAppContext } from '../../context/AppContext';
import { Folder, Plus } from 'lucide-react';
import CreateProjectModal from '../Modals/CreateProjectModal';

const ProjectList = () => {
  const { projectFilter, selectedProjectId, setSelectedProjectId } = useAppContext();
  const { data, loading, error } = useQuery(GET_PROJECTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) return (
    <div className="flex-1 flex flex-col mt-4 border-t border-gray-100 dark:border-gray-800 pt-4 animate-pulse">
       <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 ml-2"></div>
       <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
       <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
    </div>
  );
  if (error) return <div className="text-sm text-red-500 py-4 px-2">Error loading projects.</div>;

  const projects = data ? data[projectFilter] : [];

  return (
    <div className="flex-1 flex flex-col mt-4 border-t border-gray-100 dark:border-gray-800 pt-4 overflow-hidden">
      <div className="flex items-center justify-between px-2 mb-2 flex-shrink-0">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</h3>
        {projectFilter === 'my_projects' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 rounded bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            title="Create Project"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto w-full pr-1 space-y-1">
        {projects?.length === 0 && (
          <div className="text-sm text-gray-400 py-2 px-2 italic">No projects found.</div>
        )}
        
        {projects?.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)}
            className={`w-full flex items-stretch text-left px-2 py-2 text-sm rounded-lg transition-colors duration-200 group ${
              selectedProjectId === project.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium border border-blue-100 dark:border-blue-800/50'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center">
              <Folder 
                size={16} 
                className={`mr-3 flex-shrink-0 ${
                  selectedProjectId === project.id 
                    ? 'text-blue-500 fill-blue-500/20' 
                    : 'text-gray-400 group-hover:text-blue-400'
                } transition-colors`} 
              />
            </div>
            <span className="truncate leading-tight block pt-[1px]">{project.title}</span>
          </button>
        ))}
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default ProjectList;
