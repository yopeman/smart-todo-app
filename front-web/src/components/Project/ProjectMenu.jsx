import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Bot, FileText, Users, Clock, Info } from 'lucide-react';
import PlaceholderModal from '../Modals/PlaceholderModal';

const ProjectMenu = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: <Bot size={16} />, label: 'Edit with AI', color: 'text-purple-600 dark:text-purple-400', hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
    { icon: <FileText size={16} />, label: 'Generate Report', color: 'text-blue-600 dark:text-blue-400', hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { icon: <Users size={16} />, label: 'Owners', color: 'text-gray-700 dark:text-gray-300', hover: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
    { icon: <Users size={16} />, label: 'Members', color: 'text-gray-700 dark:text-gray-300', hover: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
    { icon: <Clock size={16} />, label: 'Histories', color: 'text-gray-700 dark:text-gray-300', hover: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
    { icon: <Info size={16} />, label: 'Details', color: 'text-gray-700 dark:text-gray-300', hover: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
  ];

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MoreVertical size={18} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
            {menuItems.map((item, i) => (
              <button 
                key={i} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setModalConfig({ title: item.label, message: `The ${item.label} feature is under development.` });
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-4 py-2.5 text-sm ${item.color} ${item.hover} transition-colors text-left`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <PlaceholderModal 
        isOpen={!!modalConfig} 
        onClose={() => setModalConfig(null)} 
        title={modalConfig?.title}
        message={modalConfig?.message}
      />
    </>
  );
};

export default ProjectMenu;
