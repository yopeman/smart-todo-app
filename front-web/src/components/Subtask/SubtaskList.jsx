import React from 'react';
import { Square, CheckSquare } from 'lucide-react';

const SubtaskList = ({ subtasks = [] }) => {
  if (subtasks.length === 0) return null;

  return (
    <div className="mt-2 ml-6 space-y-1.5 border-l-2 border-gray-100 dark:border-gray-700 pl-3">
      {subtasks.map(subtask => (
        <div key={subtask.id} className="flex items-start gap-2 group">
          <button className="mt-[2px] text-gray-400 hover:text-green-500 transition-colors flex-shrink-0">
            {subtask.status === 'DONE' ? <CheckSquare size={14} className="text-green-500" /> : <Square size={14} />}
          </button>
          <div className={`text-[11px] leading-relaxed truncate px-1 ${subtask.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-600 dark:text-gray-300'}`}>
            {subtask.title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubtaskList;
