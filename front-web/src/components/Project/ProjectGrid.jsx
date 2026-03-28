import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PROJECTS } from '../../graphql/queries';
import { useAppContext } from '../../context/AppContext';
import ProjectCard from './ProjectCard';

const ProjectGrid = () => {
  const { projectFilter, layout, selectedProjectId, searchQuery } = useAppContext();
  const { data, loading, error } = useQuery(GET_PROJECTS);

  const rawProjects = data ? data[projectFilter] : [];

  const projects = useMemo(() => {
    let p = rawProjects || [];
    if (searchQuery) {
      p = p.filter(proj => proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || proj.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    // If we wanted to strictly show only the selected project from the sidebar:
    if (selectedProjectId) {
      // p = p.filter(proj => proj.id === selectedProjectId);
      // Let's just sort the selected one to the top instead, for better UX
      p = [...p].sort((a, b) => {
        if (a.id === selectedProjectId) return -1;
        if (b.id === selectedProjectId) return 1;
        return 0;
      });
    }
    return p;
  }, [rawProjects, searchQuery, selectedProjectId]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"></div>)}
    </div>
  );
  if (error) return <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">Error loading projects! Please try again.</div>;



  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        <p className="text-lg">No projects match your criteria.</p>
        {searchQuery && <p className="text-sm mt-2 text-gray-400">Try clearing your search.</p>}
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectGrid;
