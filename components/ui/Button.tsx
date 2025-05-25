import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  glow?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = false,
  glow = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = [
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    'hover:shadow-lg active:scale-95',
    fullWidth && 'w-full',
    rounded ? 'rounded-full' : 'rounded-xl',
    glow && 'hover:shadow-xl hover:shadow-current/25'
  ].filter(Boolean);

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs gap-1',
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-base gap-2',
    lg: 'px-8 py-3 text-lg gap-2.5',
    xl: 'px-10 py-4 text-xl gap-3'
  };

  const variantClasses = {
    primary: [
      'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]',
      'text-white border-transparent',
      'hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-secondary)]',
      'focus:ring-[var(--accent-primary)]',
      'shadow-lg shadow-[var(--accent-primary)]/25'
    ].join(' '),
    
    secondary: [
      'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
      'border border-[var(--card-border)]',
      'hover:bg-[var(--surface-tertiary)] hover:border-[var(--accent-primary)]',
      'focus:ring-[var(--accent-primary)]'
    ].join(' '),
    
    tertiary: [
      'bg-transparent text-[var(--text-secondary)]',
      'border border-[var(--card-border)]',
      'hover:bg-[var(--surface-primary)] hover:text-[var(--text-primary)]',
      'focus:ring-[var(--accent-primary)]'
    ].join(' '),
    
    ghost: [
      'bg-transparent text-[var(--text-primary)]',
      'hover:bg-[var(--surface-primary)]',
      'focus:ring-[var(--accent-primary)]'
    ].join(' '),
    
    danger: [
      'bg-gradient-to-r from-[var(--error)] to-red-600',
      'text-white border-transparent',
      'hover:from-red-600 hover:to-red-700',
      'focus:ring-[var(--error)]',
      'shadow-lg shadow-[var(--error)]/25'
    ].join(' '),
    
    success: [
      'bg-gradient-to-r from-[var(--success)] to-emerald-600',
      'text-white border-transparent',
      'hover:from-emerald-600 hover:to-emerald-700',
      'focus:ring-[var(--success)]',
      'shadow-lg shadow-[var(--success)]/25'
    ].join(' ')
  };

  const combinedClasses = [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  ].join(' ');

  return (
    <button
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className={`flex items-center gap-inherit ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {children}
        
        {rightIcon && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </div>
    </button>
  );
};

export default Button;
