import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GameContext } from '../gameContext';
import { Achievement } from '../types/gamification';
import { ACHIEVEMENTS, getEarnableAchievements } from '../data/achievements';
import { PlanetId } from '../types';

interface GamificationContextType {
  earnedAchievements: Achievement[];
  pendingAchievement: Achievement | null;
  checkAndAwardAchievements: () => void;
  dismissAchievement: () => void;
  totalAchievements: number;
  achievementProgress: Record<string, { completed: boolean; progress: number; total: number }>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

interface GamificationProviderProps {
  children: React.ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const gameCtx = useContext(GameContext);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);
  const [earnedAchievementIds, setEarnedAchievementIds] = useState<string[]>([]);

  // Load earned achievements from localStorage
  useEffect(() => {
    const savedAchievements = localStorage.getItem('stemverse_earned_achievements');
    if (savedAchievements) {
      try {
        const achievementIds = JSON.parse(savedAchievements) as string[];
        setEarnedAchievementIds(achievementIds);
        
        const achievements = ACHIEVEMENTS.filter(achievement => 
          achievementIds.includes(achievement.id)
        );
        setEarnedAchievements(achievements);
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    }
  }, []);

  // Save earned achievements to localStorage
  useEffect(() => {
    localStorage.setItem('stemverse_earned_achievements', JSON.stringify(earnedAchievementIds));
  }, [earnedAchievementIds]);

  // Check for new achievements whenever game state changes
  const checkAndAwardAchievements = useCallback(() => {
    if (!gameCtx) return;

    const newlyEarnable = getEarnableAchievements({
      ...gameCtx.gameState,
      earnedAchievements: earnedAchievementIds
    });

    // Filter out already earned achievements
    const trulyNew = newlyEarnable.filter(achievement => 
      !earnedAchievementIds.includes(achievement.id)
    );

    if (trulyNew.length > 0) {
      // Award the first new achievement
      const newAchievement = trulyNew[0];
      
      // Update earned achievements
      setEarnedAchievementIds(prev => [...prev, newAchievement.id]);
      setEarnedAchievements(prev => [...prev, newAchievement]);
      
      // Show achievement toast
      setPendingAchievement(newAchievement);
      
      // Award tokens from achievement
      if (gameCtx.gameState.totalTokens !== undefined) {
        gameCtx.setGameState(prev => ({
          ...prev,
          totalTokens: prev.totalTokens + newAchievement.rewards.tokens
        }));
      }

      // Play achievement sound (if audio is enabled)
      try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        // Ignore audio errors
        console.log('Audio not available for achievement sound');
      }
    }
  }, [gameCtx, earnedAchievementIds]);

  // Auto-check achievements when game state changes
  useEffect(() => {
    if (gameCtx?.gameState) {
      checkAndAwardAchievements();
    }
  }, [
    gameCtx?.gameState.totalTokens,
    gameCtx?.gameState.unlockedPlanetIds?.length,
    gameCtx?.gameState.progress,
    checkAndAwardAchievements
  ]);

  const dismissAchievement = useCallback(() => {
    setPendingAchievement(null);
  }, []);

  // Calculate achievement progress for all achievements
  const achievementProgress = React.useMemo(() => {
    if (!gameCtx) return {};

    const progress: Record<string, { completed: boolean; progress: number; total: number }> = {};
    
    ACHIEVEMENTS.forEach(achievement => {
      let totalRequirements = achievement.requirements.length;
      let completedRequirements = 0;

      for (const req of achievement.requirements) {
        let playerValue = 0;

        switch (req.type) {
          case 'tokens_earned':
            playerValue = gameCtx.gameState.totalTokens || 0;
            break;
          case 'quests_completed':
            if (req.planetId) {
              playerValue = gameCtx.gameState.progress[req.planetId]?.completedQuestIds?.length || 0;
            } else {
              playerValue = Object.values(gameCtx.gameState.progress).reduce(
                (total: number, planet: any) => total + (planet?.completedQuestIds?.length || 0),
                0
              );
            }
            break;
          case 'planets_unlocked':
            playerValue = gameCtx.gameState.unlockedPlanetIds?.length || 0;
            break;
          case 'time_spent':
            // This would need to be tracked separately
            playerValue = 0;
            break;
          case 'streak_days':
            // This would need to be tracked separately
            playerValue = 0;
            break;
          case 'perfect_scores':
            // This would need to be tracked separately
            playerValue = 0;
            break;
          case 'help_others':
            // This would need to be tracked separately
            playerValue = 0;
            break;
        }

        if (playerValue >= req.count) {
          completedRequirements++;
        }
      }

      progress[achievement.id] = {
        completed: completedRequirements === totalRequirements,
        progress: completedRequirements,
        total: totalRequirements
      };
    });

    return progress;
  }, [gameCtx?.gameState]);

  const contextValue: GamificationContextType = {
    earnedAchievements,
    pendingAchievement,
    checkAndAwardAchievements,
    dismissAchievement,
    totalAchievements: ACHIEVEMENTS.length,
    achievementProgress
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
};

// Hook for easy achievement checking in components
export const useAchievementProgress = (achievementId: string) => {
  const { achievementProgress } = useGamification();
  return achievementProgress[achievementId] || { completed: false, progress: 0, total: 1 };
};

// Hook for checking if user has specific achievement
export const useHasAchievement = (achievementId: string) => {
  const { earnedAchievements } = useGamification();
  return earnedAchievements.some(achievement => achievement.id === achievementId);
};

// Hook for getting achievements by category
export const useAchievementsByCategory = (category: Achievement['category']) => {
  const { earnedAchievements } = useGamification();
  return {
    earned: earnedAchievements.filter(achievement => achievement.category === category),
    available: ACHIEVEMENTS.filter(achievement => achievement.category === category)
  };
};

// Hook for getting player's current title based on latest achievement
export const usePlayerTitle = () => {
  const { earnedAchievements } = useGamification();
  
  if (earnedAchievements.length === 0) return 'Star Explorer';
  
  // Return the title from the most recent achievement that has one
  for (let i = earnedAchievements.length - 1; i >= 0; i--) {
    const achievement = earnedAchievements[i];
    if (achievement.rewards.title) {
      return achievement.rewards.title;
    }
  }
  
  return 'Cosmic Adventurer';
};

export default GamificationContext;
