import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'bordered' | 'cosmic';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  glow = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = [
    'rounded-2xl transition-all duration-300',
    hover && 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl',
    glow && 'hover:shadow-xl hover:shadow-current/10',
    onClick && 'cursor-pointer'
  ].filter(Boolean);

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const variantClasses = {
    default: [
      'bg-[var(--card-bg)] border border-[var(--card-border)]',
      'shadow-lg backdrop-blur-sm'
    ].join(' '),
    
    glass: [
      'glass',
      'border border-[var(--glass-border)]',
      'shadow-[var(--glass-shadow)]'
    ].join(' '),
    
    elevated: [
      'bg-[var(--card-bg)] border border-[var(--card-border)]',
      'shadow-2xl shadow-black/20'
    ].join(' '),
    
    bordered: [
      'bg-[var(--surface-primary)] border-2 border-[var(--accent-primary)]',
      'shadow-lg shadow-[var(--accent-primary)]/10'
    ].join(' '),
    
    cosmic: [
      'cosmic-gradient',
      'p-[1px] relative overflow-hidden',
      'before:absolute before:inset-0 before:bg-[var(--bg-primary)] before:m-[1px] before:rounded-2xl'
    ].join(' ')
  };

  const combinedClasses = [
    ...baseClasses,
    paddingClasses[padding],
    variantClasses[variant],
    className
  ].join(' ');

  if (variant === 'cosmic') {
    return (
      <div className={combinedClasses} onClick={onClick} {...props}>
        <div className={`relative z-10 ${paddingClasses[padding]} h-full`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={combinedClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
