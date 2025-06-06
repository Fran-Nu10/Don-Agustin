import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className,
      fullWidth = false,
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600',
          {
            // Variant styles
            'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800':
              variant === 'primary',
            'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 active:bg-secondary-400':
              variant === 'secondary',
            'border border-primary-600 bg-transparent text-primary-600 hover:bg-primary-50':
              variant === 'outline',
            'bg-transparent text-secondary-900 hover:bg-secondary-100 active:bg-secondary-200':
              variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 active:bg-red-800':
              variant === 'danger',
            
            // Size styles
            'text-sm px-3 py-1.5 h-8': size === 'sm',
            'text-base px-4 py-2 h-10': size === 'md',
            'text-lg px-5 py-2.5 h-12': size === 'lg',
            
            // Width styles
            'w-full': fullWidth,
            
            // Disabled styles
            'opacity-50 cursor-not-allowed': disabled || isLoading,
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';