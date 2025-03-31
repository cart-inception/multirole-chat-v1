import { InputHTMLAttributes, forwardRef } from 'react';

// Props for the Input component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    // Base classes for all inputs
    const baseClasses = 'block px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    
    // Classes based on error state
    const borderClasses = error
      ? 'border-red-300 text-red-900 placeholder-red-300'
      : 'border-gray-300';
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          <input
            ref={ref}
            className={`
              ${baseClasses}
              ${borderClasses}
              ${widthClasses}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;