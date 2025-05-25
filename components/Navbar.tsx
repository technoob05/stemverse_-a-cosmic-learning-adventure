import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GameContext } from '../gameContext';
import ThemeSelector from './ThemeSelector';
import { Button } from './ui';

// Modern animated logo component - Clean and clear, larger size
const AnimatedLogo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative w-16 h-16 mr-5 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Simple clean container - larger */}
      <div className="relative w-full h-full rounded-full bg-slate-800/50 border border-white/20 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300">
        
        {/* Logo emoji - larger and completely clear */}
        <span 
          className={`text-3xl transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
          role="img" 
          aria-label="STEMverse Logo"
        >
          🌠
        </span>
      </div>
      
      {/* Only subtle outer ring on hover */}
      <div className={`absolute inset-0 rounded-full border border-cyan-400/30 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
};

// Icon component with enhanced hover effects
const NavIcon: React.FC<{ name: string, className?: string, tooltip?: string }> = ({ name, className, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const iconMap: { [key: string]: string } = {
    logo: '🌠', // STEMverse logo
    hub: '🛰️',  // Space Hub
    star: '⭐',  // Star Tokens
    user: '👨‍🚀', // User profile
    settings: '⚙️', // Settings
    book: '📚', // Learning
    home: '🏠', // Home
  };
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span 
        className={`inline-block transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:drop-shadow-lg ${className}`} 
        role="img" 
        aria-label={name}
      >
        {iconMap[name] || '❓'}
      </span>
      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg border border-white/10 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 whitespace-nowrap pointer-events-none z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"></div>
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const gameCtx = useContext(GameContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tokenAnimate, setTokenAnimate] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate token display when value changes
  useEffect(() => {
    if (gameCtx?.gameState?.totalTokens) {
      setTokenAnimate(true);
      const timer = setTimeout(() => setTokenAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [gameCtx?.gameState?.totalTokens]);

  if (!gameCtx) return null;

  const { gameState, setActivePlanet } = gameCtx;

  const handleGoToHub = () => {
    setActivePlanet(null);
    setMobileMenuOpen(false);
  };

  // Enhanced navbar classes with glassmorphism - Navigation always visible
  const navbarClasses = `sticky top-0 z-50 w-full transition-all duration-500 ease-out ${
    scrolled 
      ? 'bg-gray-900/80 backdrop-blur-2xl shadow-2xl border-b border-white/10' 
      : 'bg-transparent'
  } pointer-events-auto opacity-100`;

  return (
    <nav className={navbarClasses}>
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-24">
          {/* Logo and Title - Enhanced */}
          <div className="flex items-center group">
            <AnimatedLogo />
            <div className="flex flex-col">
              <NavLink 
                to="/"
                className="text-3xl font-black tracking-tight cosmic-title text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:via-purple-400 hover:to-pink-400 transition-all duration-300 leading-none"
              >
                STEMverse
              </NavLink>
              <p className="text-xs text-gray-400 font-medium tracking-wider uppercase opacity-80">Learning Universe</p>
            </div>
          </div>

          {/* Desktop Navigation Links - Enhanced */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) => 
                `group relative flex items-center px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-105 active:scale-98 ${
                  isActive 
                    ? 'bg-gradient-to-br from-cyan-500/25 via-purple-500/20 to-pink-500/25 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-sm border border-white/25' 
                    : 'hover:bg-white/8 hover:text-white hover:shadow-lg hover:shadow-white/5 hover:backdrop-blur-sm hover:border hover:border-white/15 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <NavIcon name="home" className="mr-2.5 text-lg" tooltip="Home" />
                    <span className="relative font-medium">
                      Home
                      <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ${
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-70'
                      }`}></div>
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/3 scale-0 group-active:scale-100 transition-transform duration-200 ease-out rounded-2xl"></div>
                  </div>
                </>
              )}
            </NavLink>

            <NavLink
              to="/hub"
              onClick={handleGoToHub}
              className={({ isActive }) => 
                `group relative flex items-center px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-105 active:scale-98 ${
                  isActive 
                    ? 'bg-gradient-to-br from-cyan-500/25 via-purple-500/20 to-pink-500/25 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-sm border border-white/25' 
                    : 'hover:bg-white/8 hover:text-white hover:shadow-lg hover:shadow-white/5 hover:backdrop-blur-sm hover:border hover:border-white/15 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <NavIcon name="hub" className="mr-2.5 text-lg" tooltip="Game Hub" />
                    <span className="relative font-medium">
                      Hub
                      <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ${
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-70'
                      }`}></div>
                    </span>
                  </div>
                </>
              )}
            </NavLink>
            
            {/* Learning Link */}
            <NavLink
              to="/learn"
              className={({ isActive }) => 
                `group relative flex items-center px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-105 active:scale-98 ${
                  isActive 
                    ? 'bg-gradient-to-br from-cyan-500/25 via-purple-500/20 to-pink-500/25 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-sm border border-white/25' 
                    : 'hover:bg-white/8 hover:text-white hover:shadow-lg hover:shadow-white/5 hover:backdrop-blur-sm hover:border hover:border-white/15 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <NavIcon name="book" className="mr-2.5 text-lg" tooltip="Learn STEM" />
                    <span className="relative font-medium">
                      Learning
                      <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ${
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-70'
                      }`}></div>
                    </span>
                  </div>
                </>
              )}
            </NavLink>

            {/* Cosmic AI Tutor Link */}
            <NavLink
              to="/cosmic-ai-tutor"
              className={({ isActive }) => 
                `group relative flex items-center px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-105 active:scale-98 ${
                  isActive 
                    ? 'bg-gradient-to-br from-cyan-500/25 via-purple-500/20 to-pink-500/25 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-sm border border-white/25' 
                    : 'hover:bg-white/8 hover:text-white hover:shadow-lg hover:shadow-white/5 hover:backdrop-blur-sm hover:border hover:border-white/15 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <span className="mr-2.5 text-lg transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5" role="img" aria-label="Cosmic AI Tutor">🤖</span>
                    <span className="relative font-medium">
                      AI Tutor
                      <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ${
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-70'
                      }`}></div>
                    </span>
                  </div>
                </>
              )}
            </NavLink>

            {/* Video to Learning App Link */}
            <NavLink
              to="/video-to-learning"
              className={({ isActive }) => 
                `group relative flex items-center px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-105 active:scale-98 ${
                  isActive 
                    ? 'bg-gradient-to-br from-cyan-500/25 via-purple-500/20 to-pink-500/25 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-sm border border-white/25' 
                    : 'hover:bg-white/8 hover:text-white hover:shadow-lg hover:shadow-white/5 hover:backdrop-blur-sm hover:border hover:border-white/15 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <span className="mr-2.5 text-lg transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5" role="img" aria-label="Video to Learning App">🎬</span>
                    <span className="relative font-medium">
                      Video App
                      <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ${
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-70'
                      }`}></div>
                    </span>
                  </div>
                </>
              )}
            </NavLink>

            {/* AI Storyteller Link */}
            <NavLink
              to="/ai-storyteller"
              className={({ isActive }) => 
                `group relative flex items-center px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-105 active:scale-98 ${
                  isActive 
                    ? 'bg-gradient-to-br from-cyan-500/25 via-purple-500/20 to-pink-500/25 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-sm border border-white/25' 
                    : 'hover:bg-white/8 hover:text-white hover:shadow-lg hover:shadow-white/5 hover:backdrop-blur-sm hover:border hover:border-white/15 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <span className="mr-2.5 text-lg transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5" role="img" aria-label="AI Storyteller">🐱</span>
                    <span className="relative font-medium">
                      AI Storyteller
                      <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ${
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-70'
                      }`}></div>
                    </span>
                  </div>
                </>
              )}
            </NavLink>

            {/* Premium Divider */}
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/15 to-transparent mx-4"></div>

            {/* Enhanced Token Display */}
            <div className="group relative">
              {/* Premium glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 to-orange-500/15 blur-xl group-hover:blur-2xl transition-all duration-500 rounded-2xl"></div>
              
              {/* Main container with premium styling */}
              <div className="relative flex items-center px-5 py-3 bg-gradient-to-br from-yellow-500/8 via-orange-500/6 to-yellow-600/8 backdrop-blur-sm rounded-2xl border border-yellow-400/25 transition-all duration-300 hover:scale-105 hover:border-yellow-400/40 cursor-pointer shadow-lg shadow-yellow-500/5">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <NavIcon name="star" className={`text-xl text-yellow-400 drop-shadow-sm transition-all duration-300 ${tokenAnimate ? 'animate-bounce' : ''}`} tooltip="Star Tokens" />
                    {/* Premium sparkle effect */}
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping opacity-60"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-yellow-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-yellow-200/70 font-medium tracking-wide uppercase">Tokens</span>
                    <span className={`font-bold text-yellow-50 text-lg transition-all duration-300 ${tokenAnimate ? 'scale-110' : 'scale-100'}`}>
                      {gameState.totalTokens?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <ThemeSelector />
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-white overflow-hidden group focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              
              {/* Animated hamburger */}
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
              </div>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 bg-white/5 scale-0 group-active:scale-100 transition-transform duration-300 rounded-xl"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      <div className={`md:hidden transition-all duration-500 ease-out ${
        mobileMenuOpen 
          ? 'max-h-screen opacity-100 translate-y-0' 
          : 'max-h-0 opacity-0 -translate-y-4'
      } overflow-hidden`}>
        <div className="bg-gray-900/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
          <div className="px-4 py-6 space-y-3">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => 
                `group relative flex items-center px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'hover:bg-white/10 hover:text-white hover:shadow-lg hover:backdrop-blur-sm hover:border hover:border-white/20 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <NavIcon name="home" className="mr-3 text-lg" />
                    <span>Home</span>
                  </div>
                </>
              )}
            </NavLink>

            <NavLink
              to="/hub"
              onClick={handleGoToHub}
              className={({ isActive }) => 
                `group relative flex items-center px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'hover:bg-white/10 hover:text-white hover:shadow-lg hover:backdrop-blur-sm hover:border hover:border-white/20 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <NavIcon name="hub" className="mr-3 text-lg" />
                    <span>Hub</span>
                  </div>
                </>
              )}
            </NavLink>
            
            {/* Learning Link Mobile */}
            <NavLink
              to="/learn"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => 
                `group relative flex items-center px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'hover:bg-white/10 hover:text-white hover:shadow-lg hover:backdrop-blur-sm hover:border hover:border-white/20 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <NavIcon name="book" className="mr-3 text-lg" />
                    <span>Learning</span>
                  </div>
                </>
              )}
            </NavLink>

            {/* Cosmic AI Tutor Link Mobile */}
            <NavLink
              to="/cosmic-ai-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => 
                `group relative flex items-center px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'hover:bg-white/10 hover:text-white hover:shadow-lg hover:backdrop-blur-sm hover:border hover:border-white/20 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <span className="mr-3 text-lg transition-all duration-300 group-hover:scale-110" role="img" aria-label="Cosmic AI Tutor">🤖</span>
                    <span>AI Tutor</span>
                  </div>
                </>
              )}
            </NavLink>
            
            {/* AI Storyteller Link Mobile */}
            <NavLink
              to="/ai-storyteller"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => 
                `group relative flex items-center px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'hover:bg-white/10 hover:text-white hover:shadow-lg hover:backdrop-blur-sm hover:border hover:border-white/20 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <span className="mr-3 text-lg transition-all duration-300 group-hover:scale-110" role="img" aria-label="AI Storyteller">🐱</span>
                    <span>AI Storyteller</span>
                  </div>
                </>
              )}
            </NavLink>

            {/* Video to Learning App Link Mobile */}
            <NavLink
              to="/video-to-learning"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => 
                `group relative flex items-center px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'hover:bg-white/10 hover:text-white hover:shadow-lg hover:backdrop-blur-sm hover:border hover:border-white/20 text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 blur-xl"></div>}
                  <div className="relative flex items-center">
                    <span className="mr-3 text-lg transition-all duration-300 group-hover:scale-110" role="img" aria-label="Video to Learning App">🎬</span>
                    <span>Video App</span>
                  </div>
                </>
              )}
            </NavLink>
          </div>
          
          <div className="pt-6 pb-4 border-t border-white/10">
            <div className="flex items-center justify-between px-5">
              {/* Enhanced Mobile Token Display */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 blur-lg rounded-2xl"></div>
                <div className="relative flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-br from-yellow-500/8 via-orange-500/6 to-yellow-600/8 backdrop-blur-sm rounded-2xl border border-yellow-400/20">
                  <NavIcon name="star" className="text-xl text-yellow-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-yellow-200/70 font-medium tracking-wide uppercase">Tokens</span>
                    <span className="font-bold text-yellow-50 text-lg">{gameState.totalTokens}</span>
                  </div>
                </div>
              </div>
              <ThemeSelector />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
