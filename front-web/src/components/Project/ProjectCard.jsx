import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import ProjectMenu from './ProjectMenu';
import TaskList from '../Task/TaskList';
import { useSubscription } from '@apollo/client/react';
import { PROJECT_UPDATED_SUBSCRIPTION } from '../../graphql/subscriptions';
import { toast } from 'react-hot-toast';

const ProjectCard = ({ project }) => {
  const { title, description, priority, status, tasks } = project;

  useSubscription(PROJECT_UPDATED_SUBSCRIPTION, {
    variables: { project_id: project.id },
    onData: ({ data }) => {
      const updatedProject = data.data?.projectUpdated;
      if (updatedProject) {
        toast(`Project "${updatedProject.title}" was updated!`, {
          icon: '🔄',
        });
      }
    }
  });

  const priorityColors = {
    HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  };

  const statusColors = {
    TODO: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/50">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 relative">
        <div className="flex justify-between items-start mb-3 pr-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{title}</h3>
          <div className="absolute right-3 top-4">
            <ProjectMenu projectId={project.id} />
          </div>
        </div>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{description}</p>}
        
        <div className="flex items-center gap-2 flex-wrap">
          {priority && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${priorityColors[priority]}`}>
              {priority}
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-transparent ${statusColors[status] || statusColors.TODO}`}>
            {status?.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-1 bg-gray-50/50 dark:bg-gray-900/20">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-4">Tasks</h4>
        <TaskList tasks={tasks} projectId={project.id} />
      </div>
    </div>
  );
};

export default ProjectCard;
