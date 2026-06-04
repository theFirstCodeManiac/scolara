import React, { useEffect } from 'react';
import { X } from 'lucide-react';
// Button removed - unused

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 mx-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-text dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
