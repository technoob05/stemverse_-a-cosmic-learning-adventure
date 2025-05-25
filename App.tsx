import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, GameContext } from './gameContext';
import { SpaceHub, PlanetScreen } from './components/PlanetScreens';
import { LoadingSpinner } from './components/SharedUI';
import Navbar from './components/Navbar'; // Import Navbar
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import { PLANETS_CONFIG } from './constants'; 
import { PlanetId } from './types'; // Corrected import path if needed
import EnhancedLearningPage from './components/learning/EnhancedLearningPage'; // Import the enhanced learning page
import AiStoryteller from './components/learning/ai-storyteller/AiStoryteller'; // Import the AI Storyteller component
import VideoToLearningApp from './components/learning/VideoToLearningApp'; // Import the Video to Learning App component
import CosmicAiTutor from './components/cosmic-ai-tutor/CosmicAiTutor'; // Import the Cosmic AI Tutor component
// import UnifiedHomePage from './components/UnifiedHomePage'; // Import the new unified home page
// import NotFound from './components/NotFound'; // Import 404 page
import { motion, AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const gameCtx = useContext(GameContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for a smoother experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !gameCtx) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="mb-8 transform animate-bounce">
          <span className="text-6xl cosmic-title text-glow-subtle">🌠</span>
        </div>
        <LoadingSpinner message="Initializing STEMverse..." />
      </div>
    );
  }

  const { gameState, setActivePlanet } = gameCtx;
  const { currentPlanetId, unlockedPlanetIds } = gameState;

  if (currentPlanetId) {
    const currentPlanetConfig = PLANETS_CONFIG.find(p => p.id === currentPlanetId);
    if (currentPlanetConfig && unlockedPlanetIds.includes(currentPlanetConfig.id)) {
      // If navigating away from Math planet while an adventure is active, PlanetScreen handles it.
      // No direct cleanup needed here from AppContent itself.
      return <PlanetScreen />;
    } else {
      console.warn(`Attempted to navigate to invalid/locked planet: ${currentPlanetId}. Redirecting to Hub.`);
      setActivePlanet(null); 
      return <SpaceHub />;
    }
  }

  return <SpaceHub />;
};

// Page transition variants
const pageVariants = {
  initial: { 
    opacity: 0, 
    x: 20,
    scale: 0.98
  },
  in: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.25, 0, 1]
    }
  },
  out: { 
    opacity: 0, 
    x: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.25, 0, 1]
    }
  }
};

// Enhanced page wrapper with transitions
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
          {/* Glassmorphism navbar */}
          <div className="navbar-glass sticky top-0 z-50">
            <Navbar />
          </div>
          
          {/* Main content with enhanced transitions */}
          <main className="flex-grow relative"> 
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <PageWrapper>
                    <AppContent />
                  </PageWrapper>
                } />
                <Route path="/hub" element={
                  <PageWrapper>
                    <AppContent />
                  </PageWrapper>
                } />
                <Route path="/learn" element={
                  <PageWrapper>
                    <EnhancedLearningPage />
                  </PageWrapper>
                } />
                <Route path="/ai-storyteller" element={
                  <PageWrapper>
                    <AiStoryteller />
                  </PageWrapper>
                } />
                <Route path="/video-learning" element={
                  <PageWrapper>
                    <VideoToLearningApp />
                  </PageWrapper>
                } />
                <Route path="/cosmic-ai-tutor" element={
                  <PageWrapper>
                    <CosmicAiTutor />
                  </PageWrapper>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
          
          {/* Floating scroll to top button */}
          <motion.button
            className="fab focus-ring"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <span className="text-white text-lg">↑</span>
          </motion.button>
        </div>
      </BrowserRouter>
    </GameProvider>
  );
};

export default App;
