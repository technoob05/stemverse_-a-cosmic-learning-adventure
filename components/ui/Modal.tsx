import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'glass' | 'cosmic';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  const variantClasses = {
    default: [
      'bg-[var(--card-bg)] border border-[var(--card-border)]',
      'shadow-2xl backdrop-blur-sm'
    ].join(' '),
    
    glass: [
      'glass',
      'border border-[var(--glass-border)]',
      'shadow-[var(--glass-shadow)]'
    ].join(' '),
    
    cosmic: [
      'cosmic-gradient p-[1px] relative overflow-hidden',
      'before:absolute before:inset-0 before:bg-[var(--bg-primary)] before:m-[1px] before:rounded-2xl'
    ].join(' ')
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleOverlayClick}
      />
      
      {/* Modal Content */}
      <div className={`
        relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden
        rounded-2xl animate-in zoom-in-95 fade-in duration-200
        ${variantClasses[variant]}
        ${className}
      `}>
        {variant === 'cosmic' ? (
          <div className="relative z-10 h-full">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
                {title && (
                  <h2 className="text-2xl font-bold text-gradient">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-[var(--surface-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              {children}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
                {title && (
                  <h2 className="text-2xl font-bold text-gradient">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-[var(--surface-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
