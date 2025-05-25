import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, GameContext } from './gameContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { SpaceHub, PlanetScreen } from './components/PlanetScreens';
import { LoadingSpinner } from './components/SharedUI';
import Navbar from './components/Navbar'; // Import Navbar
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import GamificationHub from './components/gamification/GamificationHub';
import { PLANETS_CONFIG } from './constants'; 
import { PlanetId } from './types'; // Corrected import path if needed
import EnhancedLearningPage from './components/learning/EnhancedLearningPage'; // Import the enhanced learning page
import AiStoryteller from './components/learning/ai-storyteller/AiStoryteller'; // Import the AI Storyteller component
import VideoToLearningApp from './components/learning/VideoToLearningApp'; // Import the Video to Learning App component
import CosmicAiTutor from './components/cosmic-ai-tutor/CosmicAiTutor'; // Import the Cosmic AI Tutor component

// Space Hub Component with Game Context
const HubPage: React.FC = () => {
  const gameCtx = useContext(GameContext);

  if (!gameCtx) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="mb-8 transform animate-bounce">
          <span className="text-6xl cosmic-title text-glow">🌠</span>
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
      return (
        <GamificationHub>
          <PlanetScreen />
        </GamificationHub>
      );
    } else {
      console.warn(`Attempted to navigate to invalid/locked planet: ${currentPlanetId}. Redirecting to Hub.`);
      setActivePlanet(null); 
      return (
        <GamificationHub>
          <SpaceHub />
          <Footer />
        </GamificationHub>
      );
    }
  }

  return (
    <GamificationHub>
      <SpaceHub />
      <Footer />
    </GamificationHub>
  );
};

// Main Landing Page Component
const HomePage: React.FC = () => {
  return (
    <>
      <LandingPage />
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <GamificationProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
            <Navbar /> {/* Navbar rendered here */}
            <main className="flex-grow"> {/* main content area */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/hub" element={<HubPage />} />
                <Route path="/learn" element={
                  <GamificationHub>
                    <EnhancedLearningPage />
                  </GamificationHub>
                } />
                <Route path="/ai-storyteller" element={
                  <GamificationHub>
                    <AiStoryteller />
                  </GamificationHub>
                } />
                <Route path="/video-to-learning" element={
                  <GamificationHub>
                    <VideoToLearningApp />
                  </GamificationHub>
                } />
                <Route path="/cosmic-ai-tutor" element={
                  <GamificationHub>
                    <CosmicAiTutor />
                  </GamificationHub>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </GamificationProvider>
    </GameProvider>
  );
};

export default App;
