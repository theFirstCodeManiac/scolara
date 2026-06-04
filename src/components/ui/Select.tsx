import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-text dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
