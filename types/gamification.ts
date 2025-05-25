import { PlanetId } from '../types';

// Achievement System Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'exploration' | 'mastery' | 'social' | 'special';
  requirements: AchievementRequirement[];
  rewards: {
    tokens: number;
    title?: string;
    cosmetic?: string;
  };
  isHidden: boolean; // For secret achievements
  dateEarned?: Date;
}

export interface AchievementRequirement {
  type: 'tokens_earned' | 'quests_completed' | 'planets_unlocked' | 'time_spent' | 'streak_days' | 'perfect_scores' | 'help_others';
  planetId?: PlanetId;
  count: number;
  description: string;
}

// Skill Tree System Types
export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  planetId: PlanetId | 'global';
  prerequisites: string[];
  cost: number; // Token cost to unlock
  benefits: string[];
  isUnlocked: boolean;
  level: number;
  maxLevel: number;
  position: { x: number; y: number }; // For tree layout
  connections: string[]; // Connected skill IDs
}

export interface SkillTree {
  planetId: PlanetId | 'global';
  name: string;
  description: string;
  skills: SkillNode[];
  totalNodes: number;
  unlockedNodes: number;
}

// Progress Tracking Types
export interface PlayerStats {
  totalTimeSpent: number; // in minutes
  questsCompleted: number;
  perfectScores: number;
  helpfulActions: number;
  streakDays: number;
  lastActiveDate: Date;
  joinDate: Date;
  favoriteSubject: PlanetId | null;
}

export interface PlanetProgress {
  planetId: PlanetId;
  completionPercentage: number;
  totalTokens: number;
  questsCompleted: number;
  timeSpent: number;
  averageScore: number;
  lastActive: Date;
}

// Leaderboard Types
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  totalScore: number;
  planetScores: Record<PlanetId, number>;
  achievements: string[];
  rank: number;
  change: number; // Rank change from previous period
  isCurrentUser?: boolean;
}

export interface LeaderboardFilter {
  type: 'global' | 'planet' | 'weekly' | 'monthly';
  planetId?: PlanetId;
  timeframe?: 'all_time' | 'this_week' | 'this_month' | 'today';
}

// Cosmic Passport Types
export interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'planet_unlocked' | 'achievement_earned' | 'skill_unlocked' | 'quest_completed' | 'milestone_reached';
  planetId?: PlanetId;
  achievementId?: string;
  skillId?: string;
  questId?: string;
  icon: string;
  color: string;
}

export interface CosmicPassport {
  playerId: string;
  playerName: string;
  avatar: string;
  level: number;
  totalXP: number;
  xpToNextLevel: number;
  title: string;
  joinDate: Date;
  stats: PlayerStats;
  achievements: Achievement[];
  skillTrees: SkillTree[];
  planetProgress: PlanetProgress[];
  journey: JourneyMilestone[];
  rank: number;
}

// Notification Types
export interface GameNotification {
  id: string;
  type: 'achievement_earned' | 'skill_unlocked' | 'level_up' | 'challenge_available' | 'friend_activity';
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  data?: any;
}

// Extended Game State for Gamification
export interface GamificationState {
  passport: CosmicPassport;
  availableAchievements: Achievement[];
  earnedAchievements: string[];
  skillTrees: Record<PlanetId | 'global', SkillTree>;
  unlockedSkills: string[];
  notifications: GameNotification[];
  leaderboardCache: {
    global: LeaderboardEntry[];
    planets: Record<PlanetId, LeaderboardEntry[]>;
    lastUpdated: Date;
  };
  preferences: {
    showLeaderboard: boolean;
    allowSocialFeatures: boolean;
    notificationSettings: {
      achievements: boolean;
      levelUp: boolean;
      challenges: boolean;
    };
  };
}

// Events and Analytics
export interface GameEvent {
  type: string;
  timestamp: Date;
  userId: string;
  data: Record<string, any>;
}

export interface LearningAnalytics {
  subjectStrengths: Record<string, number>;
  learningPatterns: {
    preferredTime: string;
    sessionLength: number;
    focusAreas: string[];
  };
  progressTrends: {
    weekly: number[];
    monthly: number[];
  };
  recommendations: string[];
}
