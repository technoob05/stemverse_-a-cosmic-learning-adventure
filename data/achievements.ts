import { Achievement, AchievementRequirement } from '../types/gamification';
import { PlanetId } from '../types';

// Achievement data configuration
export const ACHIEVEMENTS: Achievement[] = [
  // Exploration Category
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Welcome to STEMverse! Begin your cosmic learning journey.',
    icon: '👶',
    rarity: 'common',
    category: 'exploration',
    requirements: [
      {
        type: 'quests_completed',
        count: 1,
        description: 'Complete your first quest'
      }
    ],
    rewards: {
      tokens: 50,
      title: 'Cosmic Cadet'
    },
    isHidden: false
  },
  {
    id: 'planet_hopper',
    name: 'Planet Hopper',
    description: 'Explore all three cosmic realms in STEMverse.',
    icon: '🌍',
    rarity: 'rare',
    category: 'exploration',
    requirements: [
      {
        type: 'planets_unlocked',
        count: 3,
        description: 'Unlock all three planets'
      }
    ],
    rewards: {
      tokens: 200,
      title: 'Cosmic Explorer'
    },
    isHidden: false
  },
  {
    id: 'math_pioneer',
    name: 'Mathematical Pioneer',
    description: 'Complete your first adventure in the realm of Mathos.',
    icon: '🧮',
    rarity: 'common',
    category: 'exploration',
    requirements: [
      {
        type: 'quests_completed',
        planetId: PlanetId.MATH,
        count: 1,
        description: 'Complete one math adventure'
      }
    ],
    rewards: {
      tokens: 75,
      title: 'Number Seeker'
    },
    isHidden: false
  },
  {
    id: 'eco_guardian',
    name: 'Eco Guardian',
    description: 'Start healing Veridia by completing your first environmental quest.',
    icon: '🌱',
    rarity: 'common',
    category: 'exploration',
    requirements: [
      {
        type: 'quests_completed',
        planetId: PlanetId.ECO,
        count: 1,
        description: 'Complete one eco quest'
      }
    ],
    rewards: {
      tokens: 75,
      title: 'Planet Healer'
    },
    isHidden: false
  },
  {
    id: 'code_whisperer',
    name: 'Code Whisperer',
    description: 'Debug your first program in the digital realm of Cyberia.',
    icon: '💻',
    rarity: 'common',
    category: 'exploration',
    requirements: [
      {
        type: 'quests_completed',
        planetId: PlanetId.CODE,
        count: 1,
        description: 'Complete one coding challenge'
      }
    ],
    rewards: {
      tokens: 75,
      title: 'Logic Learner'
    },
    isHidden: false
  },

  // Mastery Category
  {
    id: 'math_master',
    name: 'Math Master',
    description: 'Restore complete harmony to the realm of Mathos.',
    icon: '🎓',
    rarity: 'epic',
    category: 'mastery',
    requirements: [
      {
        type: 'quests_completed',
        planetId: PlanetId.MATH,
        count: 5,
        description: 'Complete all math adventures'
      }
    ],
    rewards: {
      tokens: 500,
      title: 'Mathematical Sage',
      cosmetic: 'golden_calculator'
    },
    isHidden: false
  },
  {
    id: 'eco_savior',
    name: 'Eco Savior',
    description: 'Fully heal Veridia and restore its natural balance.',
    icon: '🌍',
    rarity: 'epic',
    category: 'mastery',
    requirements: [
      {
        type: 'quests_completed',
        planetId: PlanetId.ECO,
        count: 5,
        description: 'Complete all eco quests'
      }
    ],
    rewards: {
      tokens: 500,
      title: 'Environmental Champion',
      cosmetic: 'nature_crown'
    },
    isHidden: false
  },
  {
    id: 'code_architect',
    name: 'Code Architect',
    description: 'Rebuild the Core Logic of Cyberia completely.',
    icon: '⚡',
    rarity: 'epic',
    category: 'mastery',
    requirements: [
      {
        type: 'quests_completed',
        planetId: PlanetId.CODE,
        count: 5,
        description: 'Complete all coding challenges'
      }
    ],
    rewards: {
      tokens: 500,
      title: 'Digital Architect',
      cosmetic: 'cyber_wings'
    },
    isHidden: false
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Achieve perfect scores on multiple challenges.',
    icon: '⭐',
    rarity: 'rare',
    category: 'mastery',
    requirements: [
      {
        type: 'perfect_scores',
        count: 10,
        description: 'Get 10 perfect scores'
      }
    ],
    rewards: {
      tokens: 300,
      title: 'Precision Master'
    },
    isHidden: false
  },
  {
    id: 'speed_learner',
    name: 'Speed Learner',
    description: 'Complete challenges with lightning speed.',
    icon: '⚡',
    rarity: 'rare',
    category: 'mastery',
    requirements: [
      {
        type: 'quests_completed',
        count: 10,
        description: 'Complete 10 quests in record time'
      }
    ],
    rewards: {
      tokens: 250,
      title: 'Lightning Learner'
    },
    isHidden: false
  },

  // Social Category
  {
    id: 'helpful_explorer',
    name: 'Helpful Explorer',
    description: 'Help fellow cosmic explorers on their journey.',
    icon: '🤝',
    rarity: 'common',
    category: 'social',
    requirements: [
      {
        type: 'help_others',
        count: 5,
        description: 'Help 5 other learners'
      }
    ],
    rewards: {
      tokens: 100,
      title: 'Cosmic Helper'
    },
    isHidden: false
  },
  {
    id: 'study_buddy',
    name: 'Study Buddy',
    description: 'Maintain a learning streak and inspire others.',
    icon: '📚',
    rarity: 'rare',
    category: 'social',
    requirements: [
      {
        type: 'streak_days',
        count: 7,
        description: 'Maintain a 7-day learning streak'
      }
    ],
    rewards: {
      tokens: 200,
      title: 'Dedicated Scholar'
    },
    isHidden: false
  },

  // Special Category
  {
    id: 'cosmic_master',
    name: 'Cosmic Master',
    description: 'Achieve mastery across all three cosmic realms.',
    icon: '👑',
    rarity: 'legendary',
    category: 'special',
    requirements: [
      {
        type: 'planets_unlocked',
        count: 3,
        description: 'Master all three planets'
      },
      {
        type: 'tokens_earned',
        count: 2000,
        description: 'Earn 2000 total tokens'
      }
    ],
    rewards: {
      tokens: 1000,
      title: 'Supreme Cosmic Master',
      cosmetic: 'cosmic_crown'
    },
    isHidden: false
  },
  {
    id: 'secret_discoverer',
    name: 'Secret Discoverer',
    description: 'Uncover hidden mysteries in the STEMverse.',
    icon: '🔍',
    rarity: 'legendary',
    category: 'special',
    requirements: [
      {
        type: 'time_spent',
        count: 600, // 10 hours
        description: 'Spend significant time exploring'
      }
    ],
    rewards: {
      tokens: 750,
      title: 'Mystery Solver',
      cosmetic: 'detective_badge'
    },
    isHidden: true
  },
  {
    id: 'time_traveler',
    name: 'Time Traveler',
    description: 'Return to STEMverse after a long absence.',
    icon: '⏰',
    rarity: 'rare',
    category: 'special',
    requirements: [
      {
        type: 'streak_days',
        count: 1,
        description: 'Return after 30+ days absence'
      }
    ],
    rewards: {
      tokens: 150,
      title: 'Returning Explorer'
    },
    isHidden: true
  }
];

// Helper functions for achievement checking
export const checkAchievementProgress = (
  achievement: Achievement,
  playerProgress: any
): { completed: boolean; progress: number; total: number } => {
  let totalRequirements = achievement.requirements.length;
  let completedRequirements = 0;

  for (const req of achievement.requirements) {
    let playerValue = 0;

    switch (req.type) {
      case 'tokens_earned':
        playerValue = playerProgress.totalTokens || 0;
        break;
      case 'quests_completed':
        if (req.planetId) {
          playerValue = playerProgress.progress[req.planetId]?.completedQuestIds?.length || 0;
        } else {
          playerValue = Object.values(playerProgress.progress).reduce(
            (total: number, planet: any) => total + (planet?.completedQuestIds?.length || 0),
            0
          );
        }
        break;
      case 'planets_unlocked':
        playerValue = playerProgress.unlockedPlanetIds?.length || 0;
        break;
      case 'time_spent':
        playerValue = playerProgress.stats?.totalTimeSpent || 0;
        break;
      case 'streak_days':
        playerValue = playerProgress.stats?.streakDays || 0;
        break;
      case 'perfect_scores':
        playerValue = playerProgress.stats?.perfectScores || 0;
        break;
      case 'help_others':
        playerValue = playerProgress.stats?.helpfulActions || 0;
        break;
    }

    if (playerValue >= req.count) {
      completedRequirements++;
    }
  }

  return {
    completed: completedRequirements === totalRequirements,
    progress: completedRequirements,
    total: totalRequirements
  };
};

export const getEarnableAchievements = (playerProgress: any): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => {
    const { completed } = checkAchievementProgress(achievement, playerProgress);
    const alreadyEarned = playerProgress.earnedAchievements?.includes(achievement.id);
    return completed && !alreadyEarned;
  });
};

export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'var(--accent-tertiary)';
    case 'rare':
      return 'var(--accent-secondary)';
    case 'epic':
      return 'var(--accent-primary)';
    case 'legendary':
      return '#FFD700';
    default:
      return 'var(--text-tertiary)';
  }
};

export const getRarityGlow = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return '0 0 10px var(--accent-tertiary)';
    case 'rare':
      return '0 0 15px var(--accent-secondary)';
    case 'epic':
      return '0 0 20px var(--accent-primary)';
    case 'legendary':
      return '0 0 25px #FFD700, 0 0 35px #FFD700';
    default:
      return 'none';
  }
};
