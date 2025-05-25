import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined' | 'glass';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const baseInputClasses = [
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-[var(--input-placeholder)]',
    fullWidth && 'w-full'
  ].filter(Boolean);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const variantClasses = {
    default: [
      'bg-[var(--input-bg)] text-[var(--input-text)]',
      'border border-[var(--input-border)]',
      'rounded-xl',
      'focus:border-[var(--input-border-focus)] focus:ring-[var(--input-border-focus)]'
    ].join(' '),
    
    filled: [
      'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
      'border-0 border-b-2 border-[var(--input-border)]',
      'rounded-t-xl rounded-b-none',
      'focus:border-[var(--input-border-focus)] focus:ring-[var(--input-border-focus)]'
    ].join(' '),
    
    outlined: [
      'bg-transparent text-[var(--text-primary)]',
      'border-2 border-[var(--input-border)]',
      'rounded-xl',
      'focus:border-[var(--input-border-focus)] focus:ring-[var(--input-border-focus)]'
    ].join(' '),
    
    glass: [
      'glass text-[var(--text-primary)]',
      'border border-[var(--glass-border)]',
      'rounded-xl',
      'focus:border-[var(--input-border-focus)] focus:ring-[var(--input-border-focus)]'
    ].join(' ')
  };

  const inputClasses = [
    ...baseInputClasses,
    sizeClasses[inputSize],
    variantClasses[variant],
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    error && 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]',
    className
  ].join(' ');

  return (
    <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-[var(--error)] flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-[var(--text-tertiary)]">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
