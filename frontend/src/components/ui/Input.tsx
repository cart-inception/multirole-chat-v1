import { InputHTMLAttributes, forwardRef } from 'react';

// Props for the Input component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    // Base classes with improved text contrast
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    
    // Text and background colors with dark mode support - ensuring proper text contrast
    const textClasses = 'text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500'
    
    // Classes based on error state
    const borderClasses = error
      ? 'border-red-300 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
      : 'border-gray-300 dark:border-gray-600';
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              ${baseClasses}
              ${textClasses}
              ${borderClasses}
              ${className}
            `}
            autoComplete={props.autoComplete || 'off'}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" id={`${props.id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;