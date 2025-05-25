import React, { useState, useEffect, useContext } from 'react';
import { GameContext } from '../gameContext';
import { Button } from './SharedUI';
import { Theme, PlanetId } from '../types';

// Particle animation for background
const ParticleBackground: React.FC = () => {
  return (
    <div className="particle-container absolute inset-0 z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="particle absolute rounded-full bg-white opacity-70"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `particleFloat ${Math.random() * 15 + 10}s infinite linear`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};

// Planet card for selection
const PlanetCard: React.FC<{
  name: string;
  icon: string;
  description: string;
  color: string;
  isUnlocked: boolean;
  onClick: () => void;
}> = ({ name, icon, description, color, isUnlocked, onClick }) => {
  return (
    <div 
      className={`relative group overflow-hidden rounded-2xl transition-all duration-500 ease-out transform hover:scale-105 hover:rotate-1 ${isUnlocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'} glass hover-card`}
      onClick={isUnlocked ? onClick : undefined}
    >
      {/* Gradient background with glassmorphism */}
      <div className={`absolute inset-0 ${color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
      <div className="absolute inset-0 backdrop-blur-lg bg-gradient-to-br from-white/10 to-black/20 border border-white/20"></div>
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-glow" style={{ background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)', animation: 'shimmer 3s infinite' }}></div>
      
      <div className="relative z-10 p-6 h-full flex flex-col min-h-[280px]">
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors duration-300">{name}</h3>
        <p className="text-sm text-gray-200 mb-6 flex-grow leading-relaxed">{description}</p>
        
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 rounded-2xl">
            <div className="glass-dark p-4 rounded-xl flex items-center shadow-lg">
              <span className="text-2xl mr-3 animate-pulse">🔒</span>
              <span className="text-white font-medium">Locked</span>
            </div>
          </div>
        )}
        
        <div className="mt-auto">
          <Button 
            variant={isUnlocked ? "primary" : "ghost"} 
            className={`w-full interactive-scale ${!isUnlocked && 'opacity-50 cursor-not-allowed'} ${isUnlocked && 'hover:shadow-lg hover:shadow-purple-500/25'}`}
            disabled={!isUnlocked}
          >
            {isUnlocked ? '🚀 Explore Now' : '🔒 Locked'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const gameCtx = useContext(GameContext);
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    // Trigger animations after component mounts
    setShowAnimation(true);
  }, []);

  if (!gameCtx) return null;
  
  const { gameState, startPlanet, setCurrentTheme } = gameCtx;

  const handleStartAdventure = () => {
    // Start with Math planet which is unlocked by default
    startPlanet(PlanetId.MATH);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
      {/* Enhanced particle background */}
      <ParticleBackground />
      
      {/* Orbital rings animation with glassmorphism */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className={`w-[150vw] h-[150vw] border border-cyan-500/30 rounded-full absolute transition-all duration-1000 ease-out animate-spin ${showAnimation ? 'opacity-100' : 'opacity-0 scale-75'}`} style={{ animationDuration: '60s', animationDelay: '0.5s' }}></div>
        <div className={`w-[120vw] h-[120vw] border border-purple-500/25 rounded-full absolute transition-all duration-1000 ease-out animate-spin ${showAnimation ? 'opacity-100' : 'opacity-0 scale-75'}`} style={{ animationDuration: '45s', animationDirection: 'reverse', animationDelay: '0.7s' }}></div>
        <div className={`w-[90vw] h-[90vw] border border-indigo-500/20 rounded-full absolute transition-all duration-1000 ease-out animate-spin ${showAnimation ? 'opacity-100' : 'opacity-0 scale-75'}`} style={{ animationDuration: '30s', animationDelay: '0.9s' }}></div>
        
        {/* Add floating cosmic elements */}
        <div className="absolute top-1/4 left-1/4 text-4xl animate-float">✨</div>
        <div className="absolute top-1/3 right-1/4 text-3xl animate-float" style={{ animationDelay: '2s' }}>🌟</div>
        <div className="absolute bottom-1/3 left-1/3 text-2xl animate-float" style={{ animationDelay: '4s' }}>💫</div>
        <div className="absolute bottom-1/4 right-1/3 text-3xl animate-float" style={{ animationDelay: '6s' }}>⭐</div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className={`transition-all duration-1000 transform ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                STEMverse
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Embark on a cosmic learning adventure through mathematics, ecology, and coding
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={handleStartAdventure}
                  className="!bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg px-8 py-3"
                >
                  Begin Your Journey
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-lg px-8 py-3 border-2 !border-indigo-500/50 hover:!bg-indigo-500/20"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
          
          {/* Planet selection */}
          <div className={`transition-all duration-1000 delay-300 transform ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Choose Your Cosmic Realm</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PlanetCard 
                name="Mathos - The Number Realm"
                icon="🌌"
                description="A world of fractured calculus and chaotic geometry. Thầy Euclid guides explorers through narrative adventures to restore mathematical harmony!"
                color="bg-purple-600"
                isUnlocked={gameState.unlockedPlanetIds.includes(PlanetId.MATH)}
                onClick={() => startPlanet(PlanetId.MATH)}
              />
              <PlanetCard 
                name="Veridia - The Living Planet"
                icon="🌳"
                description="This planet is suffering from industrial miasma. Giáo sư Gaia seeks a hero to design and implement solutions to heal it."
                color="bg-emerald-600"
                isUnlocked={gameState.unlockedPlanetIds.includes(PlanetId.ECO)}
                onClick={() => startPlanet(PlanetId.ECO)}
              />
              <PlanetCard 
                name="Cyberia - The Logic Sphere"
                icon="💡"
                description="The Core Logic of this digital world is fragmented by a rogue AI. Code Master Ada needs your skills to debug and restore order."
                color="bg-blue-600"
                isUnlocked={gameState.unlockedPlanetIds.includes(PlanetId.CODE)}
                onClick={() => startPlanet(PlanetId.CODE)}
              />
            </div>
          </div>
          
          {/* Theme selector */}
          <div className={`mt-16 text-center transition-all duration-1000 delay-500 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-gray-400 mb-4">Choose your cosmic theme:</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setCurrentTheme(Theme.DARK)} 
                className={`p-3 rounded-lg ${gameState.currentTheme === Theme.DARK ? 'bg-gray-700 ring-2 ring-purple-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                title="Dark Theme"
              >
                <span role="img" aria-label="Dark Theme" className="text-xl">🌙</span>
              </button>
              <button 
                onClick={() => setCurrentTheme(Theme.LIGHT)} 
                className={`p-3 rounded-lg ${gameState.currentTheme === Theme.LIGHT ? 'bg-gray-200 ring-2 ring-blue-500' : 'bg-gray-300 hover:bg-gray-200'}`}
                title="Light Theme"
              >
                <span role="img" aria-label="Light Theme" className="text-xl">☀️</span>
              </button>
              <button 
                onClick={() => setCurrentTheme(Theme.COSMIC_BLUE)} 
                className={`p-3 rounded-lg ${gameState.currentTheme === Theme.COSMIC_BLUE ? 'bg-indigo-900 ring-2 ring-cyan-400' : 'bg-indigo-800 hover:bg-indigo-700'}`}
                title="Cosmic Blue Theme"
              >
                <span role="img" aria-label="Cosmic Blue Theme" className="text-xl">✨</span>
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="mt-20 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} STEMverse - A Cosmic Learning Adventure</p>
            <p className="mt-1">Powered by React, Tailwind CSS, and the Gemini API</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
