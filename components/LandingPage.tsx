import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../gameContext';
import { Button, Card } from './ui';
import ThemeSelector from './ThemeSelector';
import { Theme, PlanetId } from '../types';

// Particle animation for background
const ParticleBackground: React.FC = () => {
  return (
    <div className="particle-container absolute inset-0 z-0 overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <div 
          key={i}
          className="particle absolute rounded-full opacity-30 animate-float"
          style={{
            background: 'var(--accent-primary)',
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `particleFloat ${Math.random() * 15 + 10}s infinite linear`,
            animationDelay: `${Math.random() * 5}s`,
            filter: 'blur(0.5px)'
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
    <Card
      variant="glass"
      hover={isUnlocked}
      glow={isUnlocked}
      className={`relative group h-80 overflow-hidden transition-all duration-500 hover-lift ${
        isUnlocked ? 'cursor-pointer hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'
      }`}
      onClick={isUnlocked ? onClick : undefined}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 group-hover:from-[var(--accent-primary)]/20 group-hover:to-[var(--accent-secondary)]/20 transition-all duration-500`}></div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div className={`text-5xl mb-4 animate-float ${isUnlocked ? 'animate-glow' : ''}`}>{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-gradient">{name}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6 flex-grow leading-relaxed">{description}</p>
        
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center glass rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-tertiary)]/80 rounded-full border border-[var(--card-border)]">
              <span className="text-2xl animate-pulse">🔒</span>
              <span className="text-[var(--text-primary)] font-medium">Complete other realms to unlock</span>
            </div>
          </div>
        )}
        
        <div className="mt-auto">
          <Button 
            variant={isUnlocked ? "primary" : "tertiary"} 
            fullWidth
            glow={isUnlocked}
            disabled={!isUnlocked}
            className="transition-all duration-300 hover-lift"
          >
            {isUnlocked ? '🚀 Explore Now' : '🔒 Locked'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const LandingPage: React.FC = () => {
  const gameCtx = useContext(GameContext);
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    // Trigger animations after component mounts
    setShowAnimation(true);
  }, []);

  if (!gameCtx) return null;
  
  const { gameState, startPlanet } = gameCtx;

  const handleStartAdventure = () => {
    // Navigate to Hub page
    navigate('/hub');
  };

  const handlePlanetClick = (planetId: PlanetId) => {
    startPlanet(planetId);
    navigate('/hub');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] relative overflow-hidden theme-transition">
      {/* Particle background */}
      <ParticleBackground />
      
      {/* Orbital rings animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className={`w-[150vw] h-[150vw] border border-[var(--accent-primary)]/20 rounded-full absolute transition-all duration-1000 ease-out animate-wave ${showAnimation ? 'opacity-100' : 'opacity-0 scale-75'}`} style={{ animationDelay: '0.5s' }}></div>
        <div className={`w-[120vw] h-[120vw] border border-[var(--accent-secondary)]/20 rounded-full absolute transition-all duration-1000 ease-out animate-wave ${showAnimation ? 'opacity-100' : 'opacity-0 scale-75'}`} style={{ animationDelay: '0.7s' }}></div>
        <div className={`w-[90vw] h-[90vw] border border-[var(--accent-tertiary)]/20 rounded-full absolute transition-all duration-1000 ease-out animate-wave ${showAnimation ? 'opacity-100' : 'opacity-0 scale-75'}`} style={{ animationDelay: '0.9s' }}></div>
      </div>
      
      {/* Theme Selector in top right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeSelector />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className={`transition-all duration-1000 transform ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-gradient animate-glow">
                STEMverse
              </h1>
              <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
                Embark on a cosmic learning adventure through mathematics, ecology, and coding
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={handleStartAdventure}
                  size="lg"
                  glow
                  className="cosmic-gradient hover:scale-105 transition-transform duration-300"
                >
                  🚀 Begin Your Journey
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="border-2 border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/20 hover-lift"
                >
                  📚 Learn More
                </Button>
              </div>
            </div>
          </div>
          
          {/* Planet selection */}
          <div className={`transition-all duration-1000 delay-300 transform ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl font-bold text-center mb-8 text-[var(--text-primary)] animate-shimmer">Choose Your Cosmic Realm</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PlanetCard 
                name="Mathos - The Number Realm"
                icon="🌌"
                description="A world of fractured calculus and chaotic geometry. Thầy Euclid guides explorers through narrative adventures to restore mathematical harmony!"
                color="from-purple-600 to-indigo-600"
                isUnlocked={gameState.unlockedPlanetIds.includes(PlanetId.MATH)}
                onClick={() => handlePlanetClick(PlanetId.MATH)}
              />
              <PlanetCard 
                name="Veridia - The Living Planet"
                icon="🌳"
                description="This planet is suffering from industrial miasma. Giáo sư Gaia seeks a hero to design and implement solutions to heal it."
                color="from-emerald-600 to-green-600"
                isUnlocked={gameState.unlockedPlanetIds.includes(PlanetId.ECO)}
                onClick={() => handlePlanetClick(PlanetId.ECO)}
              />
              <PlanetCard 
                name="Cyberia - The Logic Sphere"
                icon="💡"
                description="The Core Logic of this digital world is fragmented by a rogue AI. Code Master Ada needs your skills to debug and restore order."
                color="from-blue-600 to-cyan-600"
                isUnlocked={gameState.unlockedPlanetIds.includes(PlanetId.CODE)}
                onClick={() => handlePlanetClick(PlanetId.CODE)}
              />
            </div>
          </div>
          
          {/* Features Section */}
          <div className={`mt-20 transition-all duration-1000 delay-500 transform ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--text-primary)]">Explore Our Universe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card variant="glass" hover className="text-center p-6 hover-lift group">
                <div className="text-4xl mb-4 group-hover:animate-bounce">🤖</div>
                <h3 className="text-lg font-semibold mb-2 text-gradient">AI Tutor</h3>
                <p className="text-sm text-[var(--text-secondary)]">Personal AI assistant for interactive learning</p>
              </Card>
              
              <Card variant="glass" hover className="text-center p-6 hover-lift group">
                <div className="text-4xl mb-4 group-hover:animate-pulse">🎬</div>
                <h3 className="text-lg font-semibold mb-2 text-gradient">Video Learning</h3>
                <p className="text-sm text-[var(--text-secondary)]">Transform any video into interactive lessons</p>
              </Card>
              
              <Card variant="glass" hover className="text-center p-6 hover-lift group">
                <div className="text-4xl mb-4 group-hover:animate-bounce">🐱</div>
                <h3 className="text-lg font-semibold mb-2 text-gradient">AI Storyteller</h3>
                <p className="text-sm text-[var(--text-secondary)]">Engaging stories that teach STEM concepts</p>
              </Card>
              
              <Card variant="glass" hover className="text-center p-6 hover-lift group">
                <div className="text-4xl mb-4 group-hover:animate-pulse">📚</div>
                <h3 className="text-lg font-semibold mb-2 text-gradient">Interactive Learning</h3>
                <p className="text-sm text-[var(--text-secondary)]">Hands-on exercises and real-time feedback</p>
              </Card>
            </div>
          </div>
          
          {/* Theme showcase section */}
          <div className={`mt-20 text-center transition-all duration-1000 delay-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Experience Multiple Cosmic Themes</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
              Choose from 11 stunning themes to customize your learning environment - from cyberpunk neon to arctic aurora!
            </p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <span className="text-[var(--text-tertiary)]">🎨 Current theme:</span>
              <div className="px-4 py-2 rounded-full bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] font-medium animate-pulse-glow">
                {gameState.currentTheme.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="mt-20 text-center text-[var(--text-quaternary)] text-sm">
            <p>&copy; {new Date().getFullYear()} STEMverse - A Cosmic Learning Adventure</p>
            <p className="mt-1">Powered by React, Tailwind CSS, and the Gemini API</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="animate-spark">✨</span>
              <span className="text-[var(--text-tertiary)]">Built with love for hackathons</span>
              <span className="animate-spark">✨</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
