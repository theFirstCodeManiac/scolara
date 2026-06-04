import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glass = false,
  hoverable = false,
  ...props 
}) => {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden';
  const glassStyles = glass ? 'glass' : '';
  const hoverStyles = hoverable ? 'transition-transform hover:-translate-y-1 hover:shadow-md' : '';

  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
