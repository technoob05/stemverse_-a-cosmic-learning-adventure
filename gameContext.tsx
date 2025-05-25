
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { GameState, GameContextType, PlanetId, MathAdventureProgress, AdventureMode, Theme } from './types';
import { PLANETS_CONFIG, TOKENS_PER_ADVENTURE_COMPLETION, MATH_ADVENTURES_LIST } from './constants';

const initialMathAdventureProgress: MathAdventureProgress = {
  currentStageId: null,
  storyLog: [],
  completedStages: [],
  selectedAdventureId: null,
  currentAdventureMode: null,
  currentAdventureTotalStages: 0,
  completedAdventures: [],
};

const initialGameState: GameState = {
  currentPlanetId: null,
  unlockedPlanetIds: [PlanetId.MATH, PlanetId.ECO, PlanetId.CODE], // All planets unlocked by default
  progress: {
    [PlanetId.MATH]: { completedQuestIds: [], tokens: 0, badges: [], mathAdventure: { ...initialMathAdventureProgress } },
    [PlanetId.ECO]: { completedQuestIds: [], tokens: 0, badges: [] },
    [PlanetId.CODE]: { completedQuestIds: [], tokens: 0, badges: [] },
  },
  totalTokens: 0,
  userName: 'Star Explorer',
  masterBadgeEarned: false,
  firstTimeUser: true,
  currentTheme: Theme.DARK, // Default theme
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('stemverseGameState');
    let loadedState: GameState;
    if (savedState) {
      loadedState = JSON.parse(savedState) as GameState;
      // Ensure mathAdventure progress exists and has new fields
      if (!loadedState.progress[PlanetId.MATH]) {
        loadedState.progress[PlanetId.MATH] = { completedQuestIds: [], tokens: 0, badges: [] };
      }
      loadedState.progress[PlanetId.MATH]!.mathAdventure = {
        ...initialMathAdventureProgress, 
        ...(loadedState.progress[PlanetId.MATH]!.mathAdventure || {}), 
      };
      if (!loadedState.progress[PlanetId.ECO]) {
        loadedState.progress[PlanetId.ECO] = { completedQuestIds: [], tokens: 0, badges: [] };
      }
      if (!loadedState.progress[PlanetId.CODE]) {
        loadedState.progress[PlanetId.CODE] = { completedQuestIds: [], tokens: 0, badges: [] };
      }
      // Ensure currentTheme exists
      if (!loadedState.currentTheme) {
        loadedState.currentTheme = initialGameState.currentTheme;
      }
      return loadedState;
    }
    return initialGameState;
  });

  useEffect(() => {
    localStorage.setItem('stemverseGameState', JSON.stringify(gameState));
    // Apply theme class to body
    document.body.className = `theme-${gameState.currentTheme}`;
  }, [gameState]);

  const setCurrentTheme = useCallback((theme: Theme) => {
    setGameState(prev => ({ ...prev, currentTheme: theme }));
  }, []);

  const unlockPlanet = useCallback((planetId: PlanetId) => {
    setGameState(prev => {
      if (!prev.unlockedPlanetIds.includes(planetId)) {
        const newProgress = { ...prev.progress };
        if (!newProgress[planetId]) {
          newProgress[planetId] = { completedQuestIds: [], tokens: 0, badges: [] };
        }
        if (planetId === PlanetId.MATH && !newProgress[PlanetId.MATH]?.mathAdventure) {
            newProgress[PlanetId.MATH]!.mathAdventure = { ...initialMathAdventureProgress };
        }
        return {
          ...prev,
          unlockedPlanetIds: [...prev.unlockedPlanetIds, planetId],
          progress: newProgress,
        };
      }
      return prev;
    });
  }, []);

  const completeQuest = useCallback((planetId: PlanetId, questId: string, tokensAwarded: number) => {
    setGameState(prev => {
      const planetProgress = prev.progress[planetId] || { completedQuestIds: [], tokens: 0, badges: [] };
      if (planetProgress.completedQuestIds.includes(questId) && planetId !== PlanetId.MATH) return prev;

      const newCompletedQuests = [...planetProgress.completedQuestIds, questId];
      const newPlanetTokens = planetProgress.tokens + tokensAwarded;
      const newTotalTokens = prev.totalTokens + tokensAwarded;

      let updatedProgress = {
        ...prev.progress,
        [planetId]: {
          ...planetProgress,
          completedQuestIds: newCompletedQuests,
          tokens: newPlanetTokens,
        },
      };
      
      if (planetId === PlanetId.MATH && !updatedProgress[PlanetId.MATH]?.mathAdventure) {
        updatedProgress[PlanetId.MATH]!.mathAdventure = { ...initialMathAdventureProgress };
      }

      const currentPlanetConfig = PLANETS_CONFIG.find(p => p.id === planetId);
      let newUnlockedPlanetIds = [...prev.unlockedPlanetIds];

      if (currentPlanetConfig && newCompletedQuests.length >= currentPlanetConfig.completionTarget) {
        if (planetId === PlanetId.MATH && !newUnlockedPlanetIds.includes(PlanetId.ECO)) {
          newUnlockedPlanetIds.push(PlanetId.ECO);
           if (!updatedProgress[PlanetId.ECO]) {
            updatedProgress[PlanetId.ECO] = { completedQuestIds: [], tokens: 0, badges: [] };
          }
        } else if (planetId === PlanetId.ECO && !newUnlockedPlanetIds.includes(PlanetId.CODE)) {
          newUnlockedPlanetIds.push(PlanetId.CODE);
          if (!updatedProgress[PlanetId.CODE]) {
            updatedProgress[PlanetId.CODE] = { completedQuestIds: [], tokens: 0, badges: [] };
          }
        }
      }
      
      const allPlanetsFullyCompleted = PLANETS_CONFIG.every(p_conf => {
        const progress = updatedProgress[p_conf.id];
        if (!progress) return false;
        if (p_conf.id === PlanetId.MATH) {
          return (progress.mathAdventure?.completedAdventures.length || 0) >= p_conf.completionTarget;
        }
        return (progress.completedQuestIds.length || 0) >= p_conf.completionTarget;
      });
      const newMasterBadgeEarned = allPlanetsFullyCompleted;

      return {
        ...prev,
        progress: updatedProgress,
        totalTokens: newTotalTokens,
        unlockedPlanetIds: newUnlockedPlanetIds, 
        masterBadgeEarned: newMasterBadgeEarned,
      };
    });
  }, []);
  
  const startMathAdventure = useCallback((adventureId: string, mode: AdventureMode, totalStages: number) => {
    setGameState(prev => {
      const mathProgress = prev.progress[PlanetId.MATH]?.mathAdventure || initialMathAdventureProgress;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [PlanetId.MATH]: {
            ...(prev.progress[PlanetId.MATH]!),
            mathAdventure: {
              ...mathProgress,
              selectedAdventureId: adventureId,
              currentAdventureMode: mode,
              currentStageId: 'stage_0', 
              completedStages: [],
              storyLog: [],
              currentAdventureTotalStages: totalStages,
            }
          }
        }
      };
    });
  }, []);

  const completeAdventureStage = useCallback((stageId: string, tokensAwarded: number) => {
    setGameState(prev => {
      const mathProgress = prev.progress[PlanetId.MATH]?.mathAdventure;
      if (!mathProgress || !mathProgress.selectedAdventureId) return prev; 
      if (mathProgress.completedStages.includes(stageId)) return prev; 

      const newCompletedStages = [...mathProgress.completedStages, stageId];
      const newPlanetTokens = (prev.progress[PlanetId.MATH]?.tokens || 0) + tokensAwarded;
      const newTotalTokens = prev.totalTokens + tokensAwarded;

      const updatedMathAdventureProgress: MathAdventureProgress = {
        ...mathProgress,
        completedStages: newCompletedStages,
        currentStageId: stageId, 
      };
      
      const updatedProgress = {
        ...prev.progress,
        [PlanetId.MATH]: {
          ...(prev.progress[PlanetId.MATH]!),
          mathAdventure: updatedMathAdventureProgress,
          tokens: newPlanetTokens,
        },
      };
      return { ...prev, progress: updatedProgress, totalTokens: newTotalTokens };
    });
  }, []);

  const endMathAdventure = useCallback((completedSuccessfully: boolean) => {
    setGameState(prev => {
      const mathProgress = prev.progress[PlanetId.MATH]?.mathAdventure;
      if (!mathProgress || !mathProgress.selectedAdventureId) return prev;

      let newCompletedAdventures = [...mathProgress.completedAdventures];
      let newPlanetTokens = prev.progress[PlanetId.MATH]?.tokens || 0;
      let newTotalTokens = prev.totalTokens;

      if (completedSuccessfully && !newCompletedAdventures.includes(mathProgress.selectedAdventureId)) {
        newCompletedAdventures.push(mathProgress.selectedAdventureId);
        newPlanetTokens += TOKENS_PER_ADVENTURE_COMPLETION;
        newTotalTokens += TOKENS_PER_ADVENTURE_COMPLETION;
      }
      
      const updatedMathAdventureProgress: MathAdventureProgress = {
        ...mathProgress,
        selectedAdventureId: null,
        currentAdventureMode: null,
        currentStageId: null,
        completedStages: [],
        storyLog: [], 
        currentAdventureTotalStages: 0,
        completedAdventures: newCompletedAdventures,
      };

      const updatedProgress = {
        ...prev.progress,
        [PlanetId.MATH]: {
          ...(prev.progress[PlanetId.MATH]!),
          mathAdventure: updatedMathAdventureProgress,
          tokens: newPlanetTokens,
          completedQuestIds: newCompletedAdventures, 
        },
      };
      
      const mathPlanetConfig = PLANETS_CONFIG.find(p => p.id === PlanetId.MATH);
      let newUnlockedPlanetIds = [...prev.unlockedPlanetIds];

      if (mathPlanetConfig && newCompletedAdventures.length >= mathPlanetConfig.completionTarget) {
        if (!newUnlockedPlanetIds.includes(PlanetId.ECO)) { 
          newUnlockedPlanetIds.push(PlanetId.ECO); 
           if (!updatedProgress[PlanetId.ECO]) {
            updatedProgress[PlanetId.ECO] = { completedQuestIds: [], tokens: 0, badges: [] };
          }
        }
      }
      
      const allPlanetsFullyCompleted = PLANETS_CONFIG.every(p_conf => {
        const progress = updatedProgress[p_conf.id];
        if (!progress) return false;
        if (p_conf.id === PlanetId.MATH) {
          return (progress.mathAdventure?.completedAdventures.length || 0) >= p_conf.completionTarget;
        }
        return (progress.completedQuestIds.length || 0) >= p_conf.completionTarget;
      });
      const newMasterBadgeEarned = allPlanetsFullyCompleted;


      return { 
        ...prev, 
        progress: updatedProgress, 
        totalTokens: newTotalTokens,
        unlockedPlanetIds: newUnlockedPlanetIds, 
        masterBadgeEarned: newMasterBadgeEarned,
      };
    });
  }, []);


  const spendTokens = useCallback((amount: number) => {
    if (gameState.totalTokens >= amount) {
      setGameState(prev => ({ ...prev, totalTokens: prev.totalTokens - amount }));
      return true;
    }
    return false;
  }, [gameState.totalTokens]);

  const startPlanet = useCallback((planetId: PlanetId) => {
    setGameState(prev => ({...prev, currentPlanetId: planetId, firstTimeUser: false }));
  }, []);
  
  const setActivePlanet = useCallback((planetId: PlanetId | null) => {
    if (gameState.currentPlanetId === PlanetId.MATH && planetId !== PlanetId.MATH) {
        const mathAdventure = gameState.progress[PlanetId.MATH]?.mathAdventure;
        if (mathAdventure?.selectedAdventureId) {
          // UI should call endMathAdventure.
        }
    }
    setGameState(prev => ({ ...prev, currentPlanetId: planetId }));
  }, [gameState.currentPlanetId, gameState.progress]);
  
  const getPlanetProgress = useCallback((planetId: PlanetId) => {
    const planetConfig = PLANETS_CONFIG.find(p => p.id === planetId);
    if (!planetConfig) return 0;
    
    let completedCount = 0;
    if (planetId === PlanetId.MATH) {
      completedCount = gameState.progress[PlanetId.MATH]?.mathAdventure?.completedAdventures.length || 0;
    } else {
      completedCount = gameState.progress[planetId]?.completedQuestIds.length || 0;
    }
    
    return planetConfig.completionTarget > 0 ? Math.min(100, (completedCount / planetConfig.completionTarget) * 100) : 0;
  }, [gameState.progress]);


  return (
    <GameContext.Provider value={{ 
        gameState, 
        setGameState, 
        unlockPlanet, 
        completeQuest, 
        spendTokens, 
        startPlanet, 
        getPlanetProgress, 
        setActivePlanet, 
        completeAdventureStage,
        startMathAdventure,
        endMathAdventure,
        setCurrentTheme // Provide setCurrentTheme
    }}>
      {children}
    </GameContext.Provider>
  );
};
