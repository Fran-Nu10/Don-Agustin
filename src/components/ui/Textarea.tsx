import React, { TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          className={clsx(
            'block w-full px-3 py-2 bg-white border rounded-md text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
            {
              'w-full': fullWidth,
              'border-red-500 focus:ring-red-500 focus:border-red-500': error,
              'border-secondary-300': !error,
              'resize-none': props.rows,
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

Textarea.displayName = 'Textarea';