import React from 'react';

export enum PlanetId {
  MATH = 'math',
  ECO = 'eco',
  CODE = 'code',
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  COSMIC_BLUE = 'cosmic-blue',
  NEON_CYBERPUNK = 'neon-cyberpunk',
  OCEAN_DEEP = 'ocean-deep',
  SUNSET_FLAME = 'sunset-flame',
  FOREST_MATRIX = 'forest-matrix',
  ELECTRIC_STORM = 'electric-storm',
  GALACTIC_GOLD = 'galactic-gold',
  ARCTIC_AURORA = 'arctic-aurora',
  ROYAL_PURPLE = 'royal-purple',
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  uiComponent?: React.FC<QuestComponentProps>;
  geminiPromptGenerator?: (userInput?: any) => string;
  geminiHintPromptGenerator?: (userInput?: any) => string;
  validator?: (userInput: any, geminiResponse?: string) => boolean;
}

export interface QuestComponentProps {
  quest: Quest;
  onComplete: (data?: any) => void;
  getGeminiResponse: (prompt: string, systemInstruction?: string) => Promise<string>; // Simplified for basic chat
  isLoadingGemini: boolean; // Global loading state
}

// New types for Math Adventure Selection
export interface AdventureSelectionItem {
  id: string;
  title: string;
  description: string;
  themePrompt: string; // Initial prompt for Gemini to start this specific adventure
  estimatedStages: number; // For context, e.g. progress bar
}

export type AdventureMode = 'text_only' | 'text_and_image';

export interface MathAdventureConfig {
  adventures: AdventureSelectionItem[];
}

export interface Planet {
  id: PlanetId;
  name: string;
  description: string;
  icon: string;
  color: string; // Main accent color class, e.g., 'bg-purple-600' or a theme variable
  npcName: string;
  npcImage: string; // URL or path
  quests: Quest[]; // For Math, this will be empty as adventures are handled separately
  isUnlocked: boolean;
  completionTarget: number; // Number of quests/stages/adventures to complete
  adventureConfig?: MathAdventureConfig; // Specific to Math Planet
}

export interface GameState {
  currentPlanetId: PlanetId | null;
  unlockedPlanetIds: PlanetId[];
  progress: {
    [key in PlanetId]?: {
      completedQuestIds: string[];
      tokens: number;
      badges: string[];
      mathAdventure?: MathAdventureProgress;
    };
  };
  totalTokens: number;
  userName: string;
  masterBadgeEarned: boolean;
  firstTimeUser: boolean;
  currentTheme: Theme; // Added for theme management
}

export interface MathAdventureProgress {
  currentStageId: string | null; // Can be stage number or a descriptive ID
  storyLog: AdventureLogEntry[];
  completedStages: string[]; // Tracks completed stages within the current adventure
  
  // New fields for selected adventure
  selectedAdventureId: string | null;
  currentAdventureMode: AdventureMode | null;
  currentAdventureTotalStages: number; // Set when an adventure starts
  completedAdventures: string[]; // Tracks IDs of fully completed adventures
}

export interface AdventureLogEntry {
  type: 'story' | 'problem' | 'user_answer' | 'feedback' | 'image_prompt' | 'image_url' | 'npc_dialogue' | 'system_message';
  content: string;
  timestamp: number;
  isCorrect?: boolean;
  imageUrl?: string; // For story entries with images
  problemDetails?: GeneratedProblem; // For problem entries
}


export interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  unlockPlanet: (planetId: PlanetId) => void;
  completeQuest: (planetId: PlanetId, questId: string, tokensAwarded: number) => void;
  spendTokens: (amount: number) => boolean;
  startPlanet: (planetId: PlanetId) => void;
  getPlanetProgress: (planetId: PlanetId) => number;
  setActivePlanet: (planetId: PlanetId | null) => void;
  completeAdventureStage: (stageId: string, tokensAwarded: number) => void; // Simplified, assumes Math planet
  startMathAdventure: (adventureId: string, mode: AdventureMode, totalStages: number) => void;
  endMathAdventure: (completed: boolean) => void; // To reset selected adventure
  setCurrentTheme: (theme: Theme) => void; // Added for theme management
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: number;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

// Generic evaluation result, used by Code planet and potentially others
export interface GeminiEvaluationResult {
  evaluation?: string; // General evaluation text
  analysis?: string; // For code
  suggestions: string[];
  score?: number; // 0-100
}

// Specific evaluation result for Eco Water Cycle Quest
export interface EcoWaterCycleEvaluationResult {
  evaluation: string;
  suggestions: string[];
  score: number;
  strengths: string[];
  weaknesses: string[];
}

// New type for dynamically generated Eco scenarios
export interface DynamicEcoScenario {
  scenarioDescription: string; // Description of the ecological situation
  challengeQuestion: string; // The specific question or problem the user needs to address
  // Could add more fields later, e.g., expectedSolutionFormat, difficulty, location
}

// New type for dynamically generated Code challenges
export interface DynamicCodeChallenge {
  challengeTitle: string; // A concise title for the coding challenge
  problemDescription: string; // Detailed description of the coding problem
  requiredLanguage: string; // e.g., 'javascript', 'python', 'typescript'
  initialCode?: string; // Optional: starting code snippet
  testCases?: { input: string, output: string }[]; // Optional: simple test cases
}

// For Math Adventure
export interface AdventureStage { // This might be dynamically defined by Gemini's output more than a fixed structure now
  id: string; // e.g., "stage_1", "stage_2_branch_a"
  storyPrompt: string; 
  problemPrompt?: string; 
  imageCue?: string; 
  successFeedbackPrompt: string;
  failureFeedbackPrompt: string;
  nextStageId?: string;
  isBossStage?: boolean;
}

export interface MultipleChoiceOption {
  id: string; // e.g., "A", "B", "opt_1"
  text: string;
}

export interface GeneratedProblem {
  problemText: string;
  problemType: 'text_input' | 'multiple_choice';
  answerFormatDescription: string; // e.g., "a single number", "an equation", "select one option"
  options?: MultipleChoiceOption[]; // For multiple_choice
  correctAnswer: string; // For text_input, the direct answer. For MC, the ID of the correct option.
  difficulty?: 'easy' | 'medium' | 'hard'; // Optional, from Gemini
  topic?: string; // Optional, from Gemini e.g. "algebra", "geometry"
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  feedbackText: string;
}

// Learning page types
export type LearningCategory = 'math' | 'eco' | 'code' | 'general';

export interface LearningExample {
  description: string;
  solution: string;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
}

export interface LearningContent {
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  examples?: LearningExample[];
  practiceQuestions?: PracticeQuestion[];
  relatedTopics?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
}

export interface Quiz {
  questions: QuizQuestion[];
}
