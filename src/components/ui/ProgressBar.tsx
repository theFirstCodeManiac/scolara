import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  color = 'primary', 
  showLabel = false,
  className = ''
}) => {
  const safeValue = Math.max(0, Math.min(100, value));
  
  const colors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary-dark',
    accent: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>Progress</span>
          <span>{Math.round(safeValue)}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};
