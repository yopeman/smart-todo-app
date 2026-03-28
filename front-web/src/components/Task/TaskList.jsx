import React from 'react';
import { Circle, CheckCircle2 } from 'lucide-react';
import SubtaskList from '../Subtask/SubtaskList';

const TaskList = ({ tasks = [], projectId }) => {
  if (tasks.length === 0) {
    return <div className="text-sm text-gray-500 italic px-1">No tasks yet.</div>;
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task.id} className="flex flex-col p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm transition-colors group">
          <div className="flex items-start gap-3 w-full">
            <button className="mt-0.5 text-gray-400 hover:text-green-500 transition-colors flex-shrink-0">
              {task.status === 'DONE' ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} />}
            </button>
            <div className="flex-1 min-w-0">
              <h5 className={`text-sm font-medium truncate pt-[1px] ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                {task.title}
              </h5>
              {task.description && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{task.description}</p>
              )}
            </div>
          </div>
          {task.subtasks && task.subtasks.length > 0 && (
            <SubtaskList subtasks={task.subtasks} />
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
