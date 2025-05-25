import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  className = '',
  leftIcon,
  rightIcon,
  ...props 
}) => {
  const baseStyle = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
  
  // Using CSS variables for theming
  const variantStyles = {
    primary: 'bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover-bg)] text-[var(--button-primary-text)] focus:ring-[var(--accent-primary)] shadow-md hover:shadow-lg',
    secondary: 'bg-[var(--button-secondary-bg)] hover:bg-[var(--button-secondary-hover-bg)] text-[var(--button-secondary-text)] focus:ring-[var(--text-muted)] shadow-sm hover:shadow',
    danger: 'bg-[var(--button-danger-bg)] hover:bg-[var(--button-danger-hover-bg)] text-[var(--button-danger-text)] focus:ring-[var(--text-danger)] shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-[var(--button-ghost-hover-bg)] text-[var(--button-ghost-text)] focus:ring-[var(--text-muted)] border border-[var(--button-ghost-border)] hover:border-transparent',
    success: 'bg-[var(--button-success-bg)] hover:bg-[var(--button-success-hover-bg)] text-[var(--button-primary-text)] focus:ring-[var(--text-success)] shadow-md hover:shadow-lg',
    gradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white focus:ring-purple-500 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--button-primary-text)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-[var(--modal-overlay-bg)] flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`bg-[var(--modal-bg)] p-6 rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto border border-[var(--card-border)]`} 
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--card-border)]">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">{title}</h2>
            <button 
              onClick={onClose} 
              className="p-1 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{size?: 'sm' | 'md' | 'lg', message?: string}> = ({size = 'md', message}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        <svg 
          className={`animate-spin text-[var(--accent-primary)] ${sizeClasses[size]}`} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`rounded-full bg-[var(--bg-primary)] ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`}></div>
        </div>
      </div>
      {message && <p className="mt-3 text-[var(--text-secondary)] text-center animate-pulse">{message}</p>}
    </div>
  );
};

export const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow-md ${
          isUser ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] rounded-br-none' : 
          isAI ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-bl-none' :
          'bg-amber-600 text-white text-sm italic text-center w-full rounded-none' // System message style can be themed too
        }`}
      >
        {isAI && <span className="font-bold text-[var(--text-accent)] mr-2">AI:</span>}
        {message.text.split('\\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < message.text.split('\\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string; // CSS variable for the fill color, e.g., 'var(--planet-math-color)'
  label?: string;
  size?: 'sm' | 'md';
  showValue?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'var(--accent-primary)', 
  label, 
  size = 'md',
  showValue = true,
  animated = true
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const labelSizeClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <p className={`${labelSizeClass} text-[var(--text-muted)]`}>{label}</p>
          {showValue && <p className={`${labelSizeClass} font-semibold text-[var(--text-secondary)]`}>{clampedProgress.toFixed(0)}%</p>}
        </div>
      )}
      <div className={`w-full bg-[var(--bg-tertiary)] bg-opacity-50 rounded-full ${heightClass} shadow-inner overflow-hidden`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-700 ease-out flex items-center justify-center relative ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${clampedProgress}%`, backgroundColor: color }}
        >
           <div className="absolute inset-0 bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

interface SpeechInputProps {
  onSpeechResult: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  mockedSpeechToText: () => Promise<string>;
  disabled?: boolean;
}

export const SpeechInputButton: React.FC<SpeechInputProps> = ({ onSpeechResult, isListening, setIsListening, mockedSpeechToText, disabled }) => {
  const handleMicClick = async () => {
    setIsListening(true);
    try {
      const result = await mockedSpeechToText();
      onSpeechResult(result);
    } catch (error) {
      console.error("Speech recognition error:", error);
      onSpeechResult(""); 
    } finally {
      setIsListening(false);
    }
  };

  return (
    <Button 
      onClick={handleMicClick} 
      isLoading={isListening} 
      variant="ghost" 
      className={`ml-2 relative ${isListening ? 'ring-2 ring-red-500 animate-pulse' : ''}`} 
      disabled={disabled}
      leftIcon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c-2.485 0-4.5-2.015-4.5-4.5V5.25c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5v5.25c0 2.485-2.015 4.5-4.5 4.5z" />
        </svg>
      }
    >
      {isListening ? 'Listening...' : 'Ask AI'}
    </Button>
  );
};

// Card component for consistent styling
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--card-border)] shadow-lg ${hover ? 'hover-card' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Badge component for status indicators
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const variantClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};
