import React from 'react';
import ModalWrapper from './ModalWrapper';

const PlaceholderModal = ({ isOpen, onClose, title, message }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center py-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message || "This feature is coming soon!"}</p>
        <button 
          onClick={onClose}
          className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </ModalWrapper>
  );
};

export default PlaceholderModal;
