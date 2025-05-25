import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GameContext } from '../gameContext';
import ThemeSelector from './ThemeSelector';

// Modern animated logo component
const AnimatedLogo: React.FC = () => {
  return (
    <div className="relative w-10 h-10 mr-3">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl cosmic-title text-glow-subtle" role="img" aria-label="STEMverse Logo">🌠</span>
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-cyan-500/50 animate-pulse"></div>
      <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: '8s' }}></div>
    </div>
  );
};

// Icon component with hover effects
const NavIcon: React.FC<{ name: string, className?: string, tooltip?: string }> = ({ name, className, tooltip }) => {
  const iconMap: { [key: string]: string } = {
    logo: '🌠', // STEMverse logo
    hub: '🛰️',  // Space Hub
    star: '⭐',  // Star Tokens
    user: '👨‍🚀', // User profile
    settings: '⚙️', // Settings
    book: '📚', // Learning
  };
  
  return (
    <div className="relative group">
      <span 
        className={`inline-block transition-transform duration-300 ease-in-out group-hover:scale-110 ${className}`} 
        role="img" 
        aria-label={name}
      >
        {iconMap[name] || '❓'}
      </span>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const gameCtx = useContext(GameContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!gameCtx) return null;

  const { gameState, setActivePlanet } = gameCtx;
  const { firstTimeUser } = gameState;

  const handleGoToHub = (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePlanet(null);
    setMobileMenuOpen(false);
  };

  const navbarClasses = `w-full transition-all duration-300 ease-in-out ${
    scrolled 
      ? 'backdrop-blur-md shadow-lg' 
      : 'backdrop-blur-sm'
  } ${firstTimeUser ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`;

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <AnimatedLogo />
            <NavLink 
              to="/"
              onClick={handleGoToHub}
              className="text-2xl font-bold tracking-tight cosmic-title text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-500 hover:via-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              STEMverse
            </NavLink>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              onClick={handleGoToHub}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
            >
              <NavIcon name="hub" className="mr-1.5" tooltip="Return to Hub" /> Space Hub
            </NavLink>
            
            {/* Learning Link */}
            <NavLink
              to="/learn"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
            >
              <NavIcon name="book" className="mr-1.5" tooltip="Learn STEM" /> Learning
            </NavLink>

            {/* Cosmic AI Tutor Link */}
            <NavLink
              to="/cosmic-ai-tutor"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
            >
              <span className="mr-1.5 text-lg" role="img" aria-label="Cosmic AI Tutor">🤖</span> AI Tutor
            </NavLink>

            {/* Video to Learning App Link */}
            <NavLink
              to="/video-learning"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
            >
              <span className="mr-1.5 text-lg" role="img" aria-label="Video to Learning App">🎬</span> Video App
            </NavLink>

            {/* AI Storyteller Link */}
            <NavLink
              to="/ai-storyteller"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
            >
              <span className="mr-1.5 text-lg" role="img" aria-label="AI Storyteller">🐱</span> AI Storyteller
            </NavLink>

            {/* Token Display */}
            <div className="flex items-center p-2 bg-[var(--bg-tertiary)] rounded-lg transition-transform hover:scale-105 duration-300">
              <NavIcon name="star" className="text-xl text-yellow-400 mr-2" tooltip="Star Tokens" />
              <span className="font-semibold text-[var(--text-primary)]">{gameState.totalTokens}</span>
            </div>
            
            <ThemeSelector />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg 
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon when menu is open */}
              <svg 
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-[var(--bg-secondary)] border-t border-[var(--navbar-border)]`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink
            to="/"
            onClick={handleGoToHub}
             className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
          >
            <NavIcon name="hub" className="mr-2" /> Space Hub
          </NavLink>
          
          {/* Learning Link Mobile */}
           <NavLink
            to="/learn"
            onClick={() => setMobileMenuOpen(false)} // Close menu on click
             className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
          >
            <NavIcon name="book" className="mr-2" /> Learning
          </NavLink>

          {/* Cosmic AI Tutor Link Mobile */}
           <NavLink
            to="/cosmic-ai-tutor"
            onClick={() => setMobileMenuOpen(false)} // Close menu on click
             className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
          >
            <span className="mr-2 text-lg" role="img" aria-label="Cosmic AI Tutor">🤖</span> AI Tutor
          </NavLink>
          
          {/* AI Storyteller Link Mobile */}
           <NavLink
            to="/ai-storyteller"
            onClick={() => setMobileMenuOpen(false)} // Close menu on click
             className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
          >
            <span className="mr-2 text-lg" role="img" aria-label="AI Storyteller">🐱</span> AI Storyteller
          </NavLink>

          {/* Video to Learning App Link Mobile */}
           <NavLink
            to="/video-learning"
            onClick={() => setMobileMenuOpen(false)} // Close menu on click
             className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--navbar-link-active-bg)] text-[var(--navbar-link-active-text)]' 
                    : 'hover:bg-[var(--navbar-link-hover-bg)] hover:text-[var(--navbar-link-hover-text)]'
                }`
              }
          >
            <span className="mr-2 text-lg" role="img" aria-label="Video to Learning App">🎬</span> Video App
          </NavLink>
        </div>
        <div className="pt-4 pb-3 border-t border-[var(--navbar-border)]">
          <div className="flex items-center justify-between px-5">
            <div className="flex items-center">
              <NavIcon name="star" className="text-xl text-yellow-400 mr-2" />
              <span className="font-medium text-[var(--text-primary)]">{gameState.totalTokens} Star Tokens</span>
            </div>
            <ThemeSelector />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
