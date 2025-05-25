// Main Gamification Components
export { default as GamificationHub } from './GamificationHub';
export { default as CosmicPassport } from './CosmicPassport/CosmicPassport';
export { default as AchievementToast } from './AchievementToast/AchievementToast';

// Context and Hooks
export { 
  GamificationProvider, 
  useGamification, 
  useAchievementProgress,
  useHasAchievement,
  useAchievementsByCategory,
  usePlayerTitle
} from '../../contexts/GamificationContext';

// Types and Data
export type { 
  Achievement, 
  SkillNode, 
  SkillTree, 
  CosmicPassport as CosmicPassportType,
  JourneyMilestone,
  LeaderboardEntry,
  PlayerStats
} from '../../types/gamification';

export { 
  ACHIEVEMENTS, 
  checkAchievementProgress, 
  getEarnableAchievements,
  getRarityColor,
  getRarityGlow
} from '../../data/achievements';

export { 
  SKILL_TREES, 
  getSkillById, 
  getUnlockableSkills,
  calculateSkillCost,
  getSkillTreeProgress,
  getConnectedSkills
} from '../../data/skillTrees';
