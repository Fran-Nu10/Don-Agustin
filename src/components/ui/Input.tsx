import React, { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, fullWidth = false, ...props }, ref) => {
    return (
      <div className={clsx('mb-4', { 'w-full': fullWidth })}>
        {label && (
          <label
            htmlFor={props.id}
            className="block mb-1 text-sm font-medium text-secondary-900"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'block px-3 py-2 bg-white border rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
            {
              'w-full': fullWidth,
              'border-red-500 focus:ring-red-500 focus:border-red-500': error,
              'border-secondary-300': !error,
            },
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';