import { SkillTree, SkillNode } from '../types/gamification';
import { PlanetId } from '../types';

// Math Planet Skill Tree
const mathSkillTree: SkillTree = {
  planetId: PlanetId.MATH,
  name: 'Mathematical Mastery',
  description: 'Unlock the secrets of numbers, patterns, and cosmic calculations',
  skills: [
    {
      id: 'math_basics',
      name: 'Number Fundamentals',
      description: 'Master basic arithmetic and number theory',
      icon: '🔢',
      planetId: PlanetId.MATH,
      prerequisites: [],
      cost: 50,
      benefits: ['Faster calculation', 'Bonus hints for basic problems'],
      isUnlocked: true,
      level: 1,
      maxLevel: 3,
      position: { x: 1, y: 1 },
      connections: ['algebra_foundation', 'pattern_recognition']
    },
    {
      id: 'algebra_foundation',
      name: 'Algebraic Thinking',
      description: 'Understand variables, equations, and algebraic relationships',
      icon: '📐',
      planetId: PlanetId.MATH,
      prerequisites: ['math_basics'],
      cost: 100,
      benefits: ['Equation solver tools', 'Variable manipulation hints'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 2, y: 1 },
      connections: ['advanced_algebra', 'function_mastery']
    },
    {
      id: 'geometry_explorer',
      name: 'Spatial Reasoning',
      description: 'Visualize shapes, angles, and geometric relationships',
      icon: '📏',
      planetId: PlanetId.MATH,
      prerequisites: ['math_basics'],
      cost: 100,
      benefits: ['3D visualization tools', 'Angle measurement aids'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 1, y: 2 },
      connections: ['advanced_geometry', 'trigonometry']
    },
    {
      id: 'pattern_recognition',
      name: 'Pattern Master',
      description: 'Identify sequences, series, and mathematical patterns',
      icon: '🔍',
      planetId: PlanetId.MATH,
      prerequisites: ['math_basics'],
      cost: 75,
      benefits: ['Pattern hints', 'Sequence completion tools'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 0, y: 2 },
      connections: ['statistics', 'probability']
    },
    {
      id: 'advanced_algebra',
      name: 'Advanced Equations',
      description: 'Solve complex polynomial and exponential equations',
      icon: '🧮',
      planetId: PlanetId.MATH,
      prerequisites: ['algebra_foundation'],
      cost: 200,
      benefits: ['Complex equation solver', 'Graphing capabilities'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 3, y: 1 },
      connections: ['calculus_basics']
    },
    {
      id: 'function_mastery',
      name: 'Function Analysis',
      description: 'Understand linear, quadratic, and other function types',
      icon: '📈',
      planetId: PlanetId.MATH,
      prerequisites: ['algebra_foundation'],
      cost: 150,
      benefits: ['Function graphing', 'Domain/range calculator'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 2, y: 2 },
      connections: ['calculus_basics']
    },
    {
      id: 'statistics',
      name: 'Data Analysis',
      description: 'Analyze data sets and understand statistical concepts',
      icon: '📊',
      planetId: PlanetId.MATH,
      prerequisites: ['pattern_recognition'],
      cost: 175,
      benefits: ['Statistical tools', 'Chart generation'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 0, y: 3 },
      connections: ['probability']
    },
    {
      id: 'probability',
      name: 'Chance & Probability',
      description: 'Calculate odds and understand random events',
      icon: '🎲',
      planetId: PlanetId.MATH,
      prerequisites: ['pattern_recognition'],
      cost: 150,
      benefits: ['Probability calculator', 'Risk assessment tools'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 1, y: 3 },
      connections: ['statistics']
    },
    {
      id: 'calculus_basics',
      name: 'Calculus Foundations',
      description: 'Understand limits, derivatives, and integrals',
      icon: '∫',
      planetId: PlanetId.MATH,
      prerequisites: ['advanced_algebra', 'function_mastery'],
      cost: 300,
      benefits: ['Derivative calculator', 'Integration tools'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 3, y: 2 },
      connections: []
    }
  ],
  totalNodes: 9,
  unlockedNodes: 1
};

// Eco Planet Skill Tree
const ecoSkillTree: SkillTree = {
  planetId: PlanetId.ECO,
  name: 'Environmental Wisdom',
  description: 'Learn to heal planets and understand ecological systems',
  skills: [
    {
      id: 'ecosystem_basics',
      name: 'Ecosystem Understanding',
      description: 'Learn how living and non-living components interact',
      icon: '🌿',
      planetId: PlanetId.ECO,
      prerequisites: [],
      cost: 50,
      benefits: ['Ecosystem analyzer', 'Species identification guide'],
      isUnlocked: true,
      level: 1,
      maxLevel: 3,
      position: { x: 1, y: 1 },
      connections: ['biodiversity', 'water_cycle']
    },
    {
      id: 'water_cycle',
      name: 'Hydrological Systems',
      description: 'Master the water cycle and aquatic ecosystems',
      icon: '💧',
      planetId: PlanetId.ECO,
      prerequisites: ['ecosystem_basics'],
      cost: 100,
      benefits: ['Water quality testing', 'Precipitation tracker'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 0, y: 2 },
      connections: ['climate_science', 'pollution_control']
    },
    {
      id: 'biodiversity',
      name: 'Species Conservation',
      description: 'Protect and nurture biological diversity',
      icon: '🦋',
      planetId: PlanetId.ECO,
      prerequisites: ['ecosystem_basics'],
      cost: 100,
      benefits: ['Species tracker', 'Conservation planner'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 2, y: 2 },
      connections: ['conservation', 'habitat_restoration']
    },
    {
      id: 'energy_flow',
      name: 'Energy Systems',
      description: 'Understand food webs and energy transfer',
      icon: '⚡',
      planetId: PlanetId.ECO,
      prerequisites: ['ecosystem_basics'],
      cost: 75,
      benefits: ['Energy flow diagrams', 'Food web analyzer'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 1, y: 2 },
      connections: ['renewable_energy', 'carbon_cycle']
    },
    {
      id: 'climate_science',
      name: 'Climate Dynamics',
      description: 'Study weather patterns and climate change',
      icon: '🌡️',
      planetId: PlanetId.ECO,
      prerequisites: ['water_cycle'],
      cost: 150,
      benefits: ['Climate modeling', 'Weather prediction'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 0, y: 3 },
      connections: ['sustainable_living']
    },
    {
      id: 'renewable_energy',
      name: 'Clean Energy',
      description: 'Harness solar, wind, and other renewable sources',
      icon: '☀️',
      planetId: PlanetId.ECO,
      prerequisites: ['energy_flow'],
      cost: 175,
      benefits: ['Energy calculator', 'Efficiency optimizer'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 1, y: 3 },
      connections: ['sustainable_living']
    },
    {
      id: 'pollution_control',
      name: 'Environmental Cleanup',
      description: 'Reduce and remediate environmental pollution',
      icon: '🧹',
      planetId: PlanetId.ECO,
      prerequisites: ['water_cycle'],
      cost: 125,
      benefits: ['Pollution monitor', 'Cleanup strategies'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 0, y: 4 },
      connections: ['sustainable_living']
    },
    {
      id: 'habitat_restoration',
      name: 'Ecosystem Repair',
      description: 'Restore damaged habitats and ecosystems',
      icon: '🌳',
      planetId: PlanetId.ECO,
      prerequisites: ['biodiversity'],
      cost: 200,
      benefits: ['Restoration planner', 'Success predictor'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 2, y: 3 },
      connections: ['sustainable_living']
    },
    {
      id: 'sustainable_living',
      name: 'Planetary Stewardship',
      description: 'Master sustainable practices for long-term health',
      icon: '🌍',
      planetId: PlanetId.ECO,
      prerequisites: ['climate_science', 'renewable_energy', 'pollution_control', 'habitat_restoration'],
      cost: 300,
      benefits: ['Sustainability calculator', 'Impact assessor'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 1, y: 4 },
      connections: []
    }
  ],
  totalNodes: 9,
  unlockedNodes: 1
};

// Code Planet Skill Tree
const codeSkillTree: SkillTree = {
  planetId: PlanetId.CODE,
  name: 'Digital Mastery',
  description: 'Build programs and solve computational problems',
  skills: [
    {
      id: 'programming_basics',
      name: 'Code Fundamentals',
      description: 'Learn variables, loops, and basic programming concepts',
      icon: '💻',
      planetId: PlanetId.CODE,
      prerequisites: [],
      cost: 50,
      benefits: ['Code editor', 'Syntax highlighting'],
      isUnlocked: true,
      level: 1,
      maxLevel: 3,
      position: { x: 1, y: 1 },
      connections: ['logic_structures', 'data_types']
    },
    {
      id: 'logic_structures',
      name: 'Control Flow',
      description: 'Master if-statements, loops, and decision making',
      icon: '🔀',
      planetId: PlanetId.CODE,
      prerequisites: ['programming_basics'],
      cost: 100,
      benefits: ['Flow chart generator', 'Logic debugger'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 0, y: 2 },
      connections: ['algorithms', 'problem_solving']
    },
    {
      id: 'data_types',
      name: 'Data Management',
      description: 'Work with numbers, strings, arrays, and objects',
      icon: '📦',
      planetId: PlanetId.CODE,
      prerequisites: ['programming_basics'],
      cost: 100,
      benefits: ['Data inspector', 'Type checker'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 2, y: 2 },
      connections: ['databases', 'data_structures']
    },
    {
      id: 'functions',
      name: 'Code Organization',
      description: 'Create reusable functions and modular code',
      icon: '⚙️',
      planetId: PlanetId.CODE,
      prerequisites: ['programming_basics'],
      cost: 75,
      benefits: ['Function library', 'Code templates'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 1, y: 2 },
      connections: ['algorithms', 'object_oriented']
    },
    {
      id: 'algorithms',
      name: 'Problem Solving',
      description: 'Design efficient algorithms and solutions',
      icon: '🧩',
      planetId: PlanetId.CODE,
      prerequisites: ['logic_structures', 'functions'],
      cost: 150,
      benefits: ['Algorithm visualizer', 'Complexity analyzer'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 1, y: 3 },
      connections: ['advanced_algorithms']
    },
    {
      id: 'data_structures',
      name: 'Data Organization',
      description: 'Use lists, stacks, queues, and trees effectively',
      icon: '🗂️',
      planetId: PlanetId.CODE,
      prerequisites: ['data_types'],
      cost: 175,
      benefits: ['Structure visualizer', 'Performance optimizer'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 2, y: 3 },
      connections: ['advanced_algorithms']
    },
    {
      id: 'debugging',
      name: 'Error Detective',
      description: 'Find and fix bugs in code systematically',
      icon: '🐛',
      planetId: PlanetId.CODE,
      prerequisites: ['logic_structures'],
      cost: 125,
      benefits: ['Advanced debugger', 'Error predictor'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 0, y: 3 },
      connections: ['testing']
    },
    {
      id: 'web_development',
      name: 'Web Creation',
      description: 'Build websites and web applications',
      icon: '🌐',
      planetId: PlanetId.CODE,
      prerequisites: ['functions'],
      cost: 200,
      benefits: ['HTML/CSS tools', 'Live preview'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 3, y: 2 },
      connections: ['advanced_algorithms']
    },
    {
      id: 'advanced_algorithms',
      name: 'Computational Mastery',
      description: 'Implement complex algorithms and optimizations',
      icon: '🚀',
      planetId: PlanetId.CODE,
      prerequisites: ['algorithms', 'data_structures', 'web_development'],
      cost: 300,
      benefits: ['AI assistant', 'Performance profiler'],
      isUnlocked: false,
      level: 0,
      maxLevel: 3,
      position: { x: 2, y: 4 },
      connections: []
    }
  ],
  totalNodes: 9,
  unlockedNodes: 1
};

// Global Cross-Planet Skills
const globalSkillTree: SkillTree = {
  planetId: 'global',
  name: 'Cosmic Wisdom',
  description: 'Universal skills that enhance learning across all domains',
  skills: [
    {
      id: 'critical_thinking',
      name: 'Critical Analysis',
      description: 'Evaluate information and make logical decisions',
      icon: '🧠',
      planetId: 'global',
      prerequisites: [],
      cost: 100,
      benefits: ['Better problem analysis', 'Improved reasoning'],
      isUnlocked: false,
      level: 0,
      maxLevel: 5,
      position: { x: 1, y: 1 },
      connections: ['research_skills', 'creativity']
    },
    {
      id: 'research_skills',
      name: 'Information Mastery',
      description: 'Find, evaluate, and synthesize information effectively',
      icon: '🔍',
      planetId: 'global',
      prerequisites: ['critical_thinking'],
      cost: 150,
      benefits: ['Research assistant', 'Source validator'],
      isUnlocked: false,
      level: 0,
      maxLevel: 5,
      position: { x: 0, y: 2 },
      connections: ['communication']
    },
    {
      id: 'creativity',
      name: 'Innovation Spark',
      description: 'Think outside the box and generate novel solutions',
      icon: '💡',
      planetId: 'global',
      prerequisites: ['critical_thinking'],
      cost: 150,
      benefits: ['Idea generator', 'Creative challenges'],
      isUnlocked: false,
      level: 0,
      maxLevel: 5,
      position: { x: 2, y: 2 },
      connections: ['communication']
    },
    {
      id: 'communication',
      name: 'Expression Master',
      description: 'Communicate ideas clearly and persuasively',
      icon: '💬',
      planetId: 'global',
      prerequisites: ['research_skills', 'creativity'],
      cost: 200,
      benefits: ['Presentation tools', 'Writing assistant'],
      isUnlocked: false,
      level: 0,
      maxLevel: 5,
      position: { x: 1, y: 3 },
      connections: ['leadership']
    },
    {
      id: 'collaboration',
      name: 'Team Synergy',
      description: 'Work effectively with others to achieve common goals',
      icon: '🤝',
      planetId: 'global',
      prerequisites: ['communication'],
      cost: 175,
      benefits: ['Team tools', 'Conflict resolution'],
      isUnlocked: false,
      level: 0,
      maxLevel: 5,
      position: { x: 0, y: 4 },
      connections: ['leadership']
    },
    {
      id: 'time_management',
      name: 'Efficiency Expert',
      description: 'Organize time and resources for maximum productivity',
      icon: '⏰',
      planetId: 'global',
      prerequisites: ['communication'],
      cost: 125,
      benefits: ['Schedule optimizer', 'Priority matrix'],
      isUnlocked: false,
      level: 0,
      maxLevel: 5,
      position: { x: 2, y: 4 },
      connections: ['leadership']
    },
    {
      id: 'leadership',
      name: 'Cosmic Leader',
      description: 'Inspire and guide others on their learning journey',
      icon: '👑',
      planetId: 'global',
      prerequisites: ['collaboration', 'time_management'],
      cost: 300,
      benefits: ['Mentoring tools', 'Leadership dashboard'],
      isUnlocked: false,
      level: 0,
      maxLevel: 5,
      position: { x: 1, y: 5 },
      connections: []
    }
  ],
  totalNodes: 7,
  unlockedNodes: 0
};

export const SKILL_TREES: Record<PlanetId | 'global', SkillTree> = {
  [PlanetId.MATH]: mathSkillTree,
  [PlanetId.ECO]: ecoSkillTree,
  [PlanetId.CODE]: codeSkillTree,
  'global': globalSkillTree
};

// Helper functions for skill tree management
export const getSkillById = (skillId: string, treeId: PlanetId | 'global'): SkillNode | undefined => {
  return SKILL_TREES[treeId]?.skills.find(skill => skill.id === skillId);
};

export const getUnlockableSkills = (treeId: PlanetId | 'global', unlockedSkills: string[]): SkillNode[] => {
  const tree = SKILL_TREES[treeId];
  if (!tree) return [];

  return tree.skills.filter(skill => {
    if (skill.isUnlocked) return false;
    if (skill.prerequisites.length === 0) return true;
    return skill.prerequisites.every(prereq => unlockedSkills.includes(prereq));
  });
};

export const calculateSkillCost = (skill: SkillNode, currentLevel: number): number => {
  return skill.cost * (currentLevel + 1);
};

export const getSkillTreeProgress = (treeId: PlanetId | 'global', unlockedSkills: string[]): number => {
  const tree = SKILL_TREES[treeId];
  if (!tree) return 0;

  const totalSkills = tree.skills.length;
  const unlockedCount = tree.skills.filter(skill => 
    unlockedSkills.includes(skill.id) || skill.isUnlocked
  ).length;

  return totalSkills > 0 ? (unlockedCount / totalSkills) * 100 : 0;
};

export const getConnectedSkills = (skillId: string, treeId: PlanetId | 'global'): SkillNode[] => {
  const tree = SKILL_TREES[treeId];
  if (!tree) return [];

  const skill = tree.skills.find(s => s.id === skillId);
  if (!skill) return [];

  return tree.skills.filter(s => skill.connections.includes(s.id));
};
