import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold, Type, Modality } from "@google/genai";
import { 
    GEMINI_MODEL_TEXT, 
    GEMINI_MODEL_IMAGE, 
    PROMPT_TEMPLATES, 
    MATH_ADVENTURE_PROMPTS, 
    MATH_PROBLEM_SCHEMA,
    ECO_WATER_CYCLE_SCHEMA
} from '../constants';
import { 
    GeminiResponse, 
    GeminiEvaluationResult, // Generic, used by Code
    EcoWaterCycleEvaluationResult, // Specific for new Eco quest
    GeneratedProblem, 
    AnswerEvaluation, 
    MultipleChoiceOption,
    DynamicEcoScenario,
    DynamicCodeChallenge, // Import the new type
    LearningContent, // New type for learning content
    LearningCategory, // New type for learning categories
    Quiz // New type for quizzes
} from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("API_KEY environment variable is not set. Gemini functionality will be mocked or disabled.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Configuration for safety settings, can be adjusted
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const parseJsonFromMarkdown = <T extends object>(markdownString: string): T | null => {
  if (!markdownString) return null;
  try {
    let jsonStr = markdownString.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("Failed to parse JSON from markdown:", error, "Original string:", markdownString);
    try {
        // Attempt to parse directly if markdown stripping failed but it might be raw JSON
        return JSON.parse(markdownString.trim()) as T;
    } catch (e) {
        console.error("Secondary JSON parsing attempt failed:", e, "Original string:", markdownString);
        return null; 
    }
  }
};


export const generateText = async (prompt: string, systemInstruction?: string): Promise<GeminiResponse> => {
  if (!ai) {
    console.warn("Gemini AI not initialized. Returning mock response.");
    await new Promise(resolve => setTimeout(resolve, 500));
    return { text: `Mock response for prompt: "${prompt.substring(0,100)}..." (System: ${systemInstruction || "None"})` };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { 
        systemInstruction,
        safetySettings,
      },
    });
    return { text: response.text ?? "" };
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    return { text: "", error: (error as Error).message };
  }
};

export const generateImageFromPrompt = async (storySegment: string, adventureTitle: string, adventureTheme: string): Promise<string | null> => {
  if (!ai) {
    console.warn("Gemini AI not initialized. Cannot generate image. Returning mock image.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "https://picsum.photos/seed/geminiartmock/600/400"; 
  }
  try {
    const imagePrompt = MATH_ADVENTURE_PROMPTS.IMAGE_GENERATION_SCENE_FROM_STORY(storySegment, adventureTitle, adventureTheme);
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_IMAGE,
        contents: imagePrompt, 
        config: { 
            responseModalities: [Modality.TEXT, Modality.IMAGE],
            safetySettings,
        },
    });

    let base64ImageBytes: string | null = null;
    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                base64ImageBytes = part.inlineData.data;
                break; // Found the image data, no need to continue
            }
        }
    }

    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    console.warn("Image generation response did not contain image bytes for prompt:", imagePrompt);
    return "https://picsum.photos/seed/geminiartfallback/600/400"; 
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    return "https://picsum.photos/seed/geminiarterror/600/400"; 
  }
};

// --- Math Adventure Specific Functions ---

export const getInitialMathAdventureStory = async (adventureThemePrompt: string, adventureTitle: string): Promise<string> => {
  const prompt = MATH_ADVENTURE_PROMPTS.INTRO_STORY_FOR_ADVENTURE(adventureThemePrompt, adventureTitle);
  const response = await generateText(prompt, MATH_ADVENTURE_PROMPTS.SYSTEM_INSTRUCTION_EUCLID);
  return response.text || "Thầy Euclid seems lost in thought... (Error fetching initial story)";
};

export const generateMathProblemForAdventure = async (currentStoryContext: string, adventureTheme: string, stageNumber: number, totalStages: number): Promise<GeneratedProblem | null> => {
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const isMc = Math.random() > 0.5;
    const mockOptions: MultipleChoiceOption[] = [{id: 'opt_A', text: 'Answer A'}, {id: 'opt_B', text: 'Answer B (Correct)'}, {id: 'opt_C', text: 'Answer C'}];
    return { 
      problemText: `Mock Problem (Stage ${stageNumber}/${totalStages}): If x = ${stageNumber*2}, what is x + 5? (Context: ${currentStoryContext.substring(0,30)}...)`, 
      problemType: isMc ? 'multiple_choice' : 'text_input',
      answerFormatDescription: isMc ? "Select the correct option." : "A single number.", 
      options: isMc ? mockOptions : undefined,
      correctAnswer: isMc ? 'opt_B' : `${stageNumber*2 + 5}`,
      difficulty: "easy",
      topic: "algebra"
    };
  }
  const prompt = MATH_ADVENTURE_PROMPTS.GENERATE_PROBLEM(currentStoryContext, adventureTheme, stageNumber, totalStages);
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { 
        systemInstruction: MATH_ADVENTURE_PROMPTS.SYSTEM_INSTRUCTION_EUCLID, 
        responseMimeType: "application/json",
        responseSchema: MATH_PROBLEM_SCHEMA, 
        safetySettings,
      }
    });
    const parsed = parseJsonFromMarkdown<GeneratedProblem>(response.text ?? "");
    
    if (!parsed || !parsed.problemText || !parsed.problemType || !parsed.correctAnswer || !parsed.answerFormatDescription) {
        console.error("Failed to parse problem or essential fields are missing from Gemini response:", response.text, "Parsed:", parsed);
        return { problemText: "Thầy Euclid's astrolabe seems to be malfunctioning! He couldn't conjure a problem. Try advancing the story again.", problemType: 'text_input', answerFormatDescription: "Apologies from the cosmos.", correctAnswer: ""};
    }
    if (parsed.problemType === 'multiple_choice' && !parsed.options) {
      parsed.options = [];
    }
    return parsed;
  } catch (error) {
    console.error("Error generating math problem for adventure:", error, "Prompt:", prompt);
    return { problemText: "A cosmic hiccup! Thầy Euclid needs a moment to realign his thoughts for a problem. Please try again.", problemType: 'text_input', answerFormatDescription: "Error in generation.", correctAnswer: ""};
  }
};

export const evaluateMathAnswerForAdventure = async (problemText: string, userAnswer: string, problemType: 'text_input' | 'multiple_choice', correctAnswer: string, answerFormatDescription: string): Promise<AnswerEvaluation | null> => {
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 500));
    let isMockCorrect = false;
    if (problemType === 'text_input') {
        isMockCorrect = userAnswer.trim() === correctAnswer.trim();
    } else { 
        isMockCorrect = userAnswer === correctAnswer; 
    }
    return { 
        isCorrect: isMockCorrect, 
        feedbackText: isMockCorrect ? "Mock Correct! The hyperlanes open!" : `Mock Incorrect. (Expected: ${correctAnswer}, Got: ${userAnswer}). The starmap flickers. Try again.` 
    };
  }
  const prompt = MATH_ADVENTURE_PROMPTS.EVALUATE_ANSWER(problemText, userAnswer, problemType, correctAnswer, answerFormatDescription);
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { 
        systemInstruction: MATH_ADVENTURE_PROMPTS.SYSTEM_INSTRUCTION_EUCLID, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedbackText: { type: Type.STRING }
          },
          required: ["isCorrect", "feedbackText"]
        },
        safetySettings,
      }
    });
    const parsed = parseJsonFromMarkdown<AnswerEvaluation>(response.text ?? "");
     if (!parsed || typeof parsed.isCorrect === 'undefined' || !parsed.feedbackText) {
        console.error("Failed to parse evaluation or essential fields are missing:", response.text, "Parsed:", parsed);
        return { isCorrect: false, feedbackText: "Thầy Euclid is consulting the cosmic winds for that one... He seems unsure how to respond to your answer right now. Please try submitting again."};
    }
    return parsed;
  } catch (error) {
    console.error("Error evaluating math answer for adventure:", error);
    return { isCorrect: false, feedbackText: "A momentary disturbance in the mathematical ether! Thầy Euclid couldn't quite process that. Could you try once more?"};
  }
};

export const continueMathAdventureStory = async (adventureTheme: string, previousProblem: string, userAnswer: string, previousStoryContext: string, stageNumber: number, totalStages: number, isFinalStage: boolean, adventureTitle: string): Promise<string> => {
  const prompt = MATH_ADVENTURE_PROMPTS.CONTINUE_STORY_AFTER_CORRECT_ANSWER(adventureTheme, previousProblem, userAnswer, previousStoryContext, stageNumber, totalStages, isFinalStage, adventureTitle);
  const response = await generateText(prompt, MATH_ADVENTURE_PROMPTS.SYSTEM_INSTRUCTION_EUCLID);
  return response.text || "Thầy Euclid ponders the next step in your grand journey... (Error fetching next story segment)";
};


export const getMathAdventureHint = async (problemText: string, currentStoryContext: string, problemType: 'text_input' | 'multiple_choice', options?: MultipleChoiceOption[]): Promise<string> => {
   if (!ai) {
     await new Promise(resolve => setTimeout(resolve, 500)); 
    return `Mock Hint for "${problemText.substring(0,30)}...": Remember the ancient theorem of inverse proportions! Or was it direct? Thầy Euclid chuckles. (Problem Type: ${problemType})`;
  }
  const prompt = MATH_ADVENTURE_PROMPTS.GET_HINT(problemText, currentStoryContext, problemType, options);
   try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        systemInstruction: MATH_ADVENTURE_PROMPTS.SYSTEM_INSTRUCTION_EUCLID,
        safetySettings,
      }
    });
    return response.text || "Thầy Euclid offers a thoughtful silence... and a cosmic cookie. (Hint not available)";
  } catch (error) {
    console.error("Error getting math adventure hint:", error);
    return "Apologies, Star Explorer, my connection to the Cosmic Muses of Mathematics is fuzzy right now. No hint available.";
  }
};


// --- Eco Planet Service Functions ---

// Define a schema for the dynamic Eco scenario response
const ECO_SCENARIO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scenarioDescription: { type: Type.STRING },
    challengeQuestion: { type: Type.STRING }
  },
  required: ["scenarioDescription", "challengeQuestion"]
};

// New function to generate a dynamic Eco scenario
export const generateDynamicEcoScenario = async (ecoTheme: string): Promise<DynamicEcoScenario | null> => {
    if (!ai) {
        console.warn("Gemini AI not initialized. Returning mock Eco scenario.");
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            scenarioDescription: "Mock Scenario: A small pond on Econia is shrinking due to unusual heatwaves.",
            challengeQuestion: "Propose a simple, sustainable method to replenish and maintain the pond's water level."
        };
    }

    const prompt = `Generate a unique ecological scenario related to ${ecoTheme}. Include a description of the situation and a specific challenge question for a Star Explorer to solve. Format the response as JSON matching the DynamicEcoScenario interface.\n\nInterface: ${JSON.stringify(ECO_SCENARIO_SCHEMA)}`;
    const systemInstruction = "You are Giáo sư Gaia, the wise and knowledgeable AI guide of Econia. Provide clear and concise ecological scenarios.";

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: ECO_SCENARIO_SCHEMA,
                safetySettings,
            }
        });

        const parsed = parseJsonFromMarkdown<DynamicEcoScenario>(response.text ?? "");

        if (!parsed || !parsed.scenarioDescription || !parsed.challengeQuestion) {
            console.error("Failed to parse dynamic Eco scenario or essential fields are missing:", response.text, "Parsed:", parsed);
            return { scenarioDescription: "Giáo sư Gaia is contemplating the complexities of Econia...", challengeQuestion: "A temporary cosmic anomaly prevents a new challenge from being generated." };
        }
        return parsed;

    } catch (error) {
        console.error("Error generating dynamic Eco scenario:", error, "Prompt:", prompt);
        return { scenarioDescription: "Econia's ecosystems are fluctuating unexpectedly.", challengeQuestion: "Giáo sư Gaia is unable to generate a scenario at this time." };
    }
};

export const evaluateEcoWaterCycleDesign = async (
  scenario: DynamicEcoScenario,
  userSolution: string
): Promise<EcoWaterCycleEvaluationResult | null> => {
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock response for Eco Water Cycle
    return { 
      evaluation: `Mock evaluation for scenario: "${scenario.scenarioDescription.substring(0, 50)}..." and solution: "${userSolution.substring(0, 50)}...". Your proposal is interesting! Consider the energy cost.`,
      suggestions: [
        "Explore geothermal energy sources for purification.", 
        "Detail your wastewater sludge management.",
        "Add redundancy for critical pumps."
      ],
      score: 65 + Math.floor(Math.random()*20), // Random score between 65-84
      strengths: ["Good consideration of water sources.", "Basic purification steps outlined."],
      weaknesses: ["Energy requirements not fully addressed.", "Waste management details are sparse."]
    };
  }
  // Craft a detailed prompt including the scenario and the user's solution
  const prompt = `Evaluate the following ecological solution proposed by a Star Explorer based on the provided scenario and challenge.\n\nScenario: ${scenario.scenarioDescription}\nChallenge: ${scenario.challengeQuestion}\n\nStar Explorer's Proposed Solution:\n${userSolution}\n\nProvide a detailed evaluation in JSON format according to the EcoWaterCycleEvaluationResult schema. Include a score from 0-100, identify strengths, weaknesses (areas for improvement), and offer constructive suggestions. Your tone should be encouraging and knowledgeable, as Giáo sư Gaia.\n\nSchema: ${JSON.stringify(ECO_WATER_CYCLE_SCHEMA)}\n\nEvaluation:`;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { 
        systemInstruction: "You are Giáo sư Gaia, an expert environmental scientist specializing in closed-loop systems for off-world habitats. Your tone is encouraging, knowledgeable, and slightly formal.", // Specific system instruction
        responseMimeType: "application/json",
        responseSchema: ECO_WATER_CYCLE_SCHEMA, // Use the defined schema for this quest
        safetySettings,
      }
    });
    const parsed = parseJsonFromMarkdown<EcoWaterCycleEvaluationResult>(response.text ?? "");
     if (!parsed || !parsed.evaluation || !parsed.suggestions || typeof parsed.score === 'undefined' || !parsed.strengths || !parsed.weaknesses) {
        console.error("Failed to parse Eco water cycle evaluation or essential fields are missing:", response.text, "Parsed:", parsed);
        return { 
            evaluation: "Giáo sư Gaia is currently recalibrating her environmental sensors. She couldn't fully process your design right now. Please try submitting again.",
            suggestions: ["Double-check if your proposal is detailed enough for a full analysis."],
            score: 0,
            strengths: [],
            weaknesses: ["Unable to parse AI response."]
        };
    }
    return parsed;
  } catch (error) {
    console.error("Error evaluating Eco water cycle design:", error, "Prompt:", prompt);
    return { 
        evaluation: "A solar flare seems to have interfered with Giáo sư Gaia's communication array! She was unable to review your design. Please try again after the cosmic weather clears.",
        suggestions: [],
        score: 0,
        strengths: [],
        weaknesses: ["AI generation error."]
    };
  }
};


// --- Code Planet Service Functions ---
// Define a schema for the dynamic Code challenge response
const CODE_CHALLENGE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        challengeTitle: { type: Type.STRING },
        problemDescription: { type: Type.STRING },
        requiredLanguage: { type: Type.STRING },
        initialCode: { type: Type.STRING, nullable: true },
        testCases: { 
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    input: { type: Type.STRING },
                    output: { type: Type.STRING }
                },
                required: ["input", "output"]
            },
            nullable: true
        }
    },
    required: ["challengeTitle", "problemDescription", "requiredLanguage"]
};

// New function to generate a dynamic Code challenge
export const generateDynamicCodeChallenge = async (language: string, topic?: string, difficulty?: 'easy' | 'medium' | 'hard'): Promise<DynamicCodeChallenge | null> => {
    if (!ai) {
        console.warn("Gemini AI not initialized. Returning mock Code challenge.");
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            challengeTitle: "Mock Code Challenge: Sum Array Elements",
            problemDescription: `Write a function in ${language} that takes an array of numbers and returns their sum.`,
            requiredLanguage: language,
            initialCode: language === 'python' ? "def sum_array(arr):\n  # Your code here\n  pass" : language === 'javascript' ? "function sumArray(arr) {\n  // Your code here\n  return 0;\n}" : "",
            testCases: [
                { input: '[1, 2, 3, 4]', output: '10' },
                { input: '[5, -5]', output: '0' }
            ]
        };
    }

    let prompt = `Generate a coding challenge in ${language}.`;
    if (topic) prompt += ` The challenge should be related to the topic: ${topic}.`;
    if (difficulty) prompt += ` The difficulty should be ${difficulty}.`;
    prompt += ` Include a clear challenge title, a detailed problem description, the required programming language, and optionally an initial code snippet and a few simple test cases.\nFormat the response as JSON matching the DynamicCodeChallenge interface.\n\nSchema: ${JSON.stringify(CODE_CHALLENGE_SCHEMA)}`;

    const systemInstruction = "You are AI Mentor, an expert coding tutor on Codia. Provide clear, solvable coding challenges.";

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: CODE_CHALLENGE_SCHEMA,
                safetySettings,
            }
        });

        const parsed = parseJsonFromMarkdown<DynamicCodeChallenge>(response.text ?? "");

        if (!parsed || !parsed.challengeTitle || !parsed.problemDescription || !parsed.requiredLanguage) {
            console.error("Failed to parse dynamic Code challenge or essential fields are missing:", response.text, "Parsed:", parsed);
            return { challengeTitle: "Code Challenge Error", problemDescription: "AI Mentor is experiencing a syntax error...", requiredLanguage: language };
        }
        return parsed;

    } catch (error) {
        console.error("Error generating dynamic Code challenge:", error, "Prompt:", prompt);
        return { challengeTitle: "Code Challenge Generation Failed", problemDescription: "AI Mentor is offline. Unable to generate a coding challenge at this time.", requiredLanguage: language };
    }
};

// Update analysis function to take challenge context
export const analyzeCodeSnippet = async (
  challenge: DynamicCodeChallenge, // Accept the challenge context
  userCode: string
): Promise<GeminiEvaluationResult | null> => {
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { analysis: `Mock analysis for challenge: "${challenge.challengeTitle.substring(0, 30)}..."\nYour code seems okay!`, suggestions: ["Consider edge cases.", "Add comments for clarity."] };
  }
  // Craft a detailed prompt including the challenge and the user's code
  const prompt = `Evaluate the following code provided by a Star Explorer based on the coding challenge described.\n\nCoding Challenge:\nTitle: ${challenge.challengeTitle}\nDescription: ${challenge.problemDescription}\nRequired Language: ${challenge.requiredLanguage}\n${challenge.initialCode ? 'Initial Code: ' + challenge.initialCode + '\n' : ''}\n${challenge.testCases && challenge.testCases.length > 0 ? 'Test Cases: ' + JSON.stringify(challenge.testCases) + '\n' : ''}\n\nStar Explorer's Code:\n${userCode}\n\nProvide a detailed code analysis in JSON format according to the GeminiEvaluationResult schema. Focus on correctness, efficiency, adherence to requirements, and best practices in ${challenge.requiredLanguage}. Include an overall analysis and a list of specific suggestions for improvement.\n\nSchema: ${JSON.stringify({
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["analysis", "suggestions"]
  })}\n\nAnalysis:`; // Use a simplified schema for this response
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: { // Define schema for code analysis if not already global
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["analysis", "suggestions"]
        },
        safetySettings,
      }
    });
    const parsed = parseJsonFromMarkdown<GeminiEvaluationResult>(response.text ?? "");
    return parsed;
  } catch (error) {
    console.error("Error analyzing code snippet:", error);
    return null;
  }
};

// Update the hint function to work with challenge context
export const getCodeDebuggingHint = async (
  challenge: DynamicCodeChallenge,
  userCode: string,
  evaluationResult?: GeminiEvaluationResult
): Promise<string> => {
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Mock Hint for challenge: "${challenge.challengeTitle.substring(0, 30)}..."\nConsider checking your logic for edge cases.`;
  }

  // Craft a detailed prompt including the challenge and user's code
  const prompt = `As Code Master Ada, provide a helpful debugging hint for this coding challenge:\n\nChallenge Title: ${challenge.challengeTitle}\nProblem Description: ${challenge.problemDescription}\n\nUser's Current Code:\n${userCode}\n\n${evaluationResult?.analysis ? `Previous Analysis: ${evaluationResult.analysis}\n` : ''}\nProvide a specific hint to guide the Star Explorer toward solving the problem. Focus on one key area for improvement or a common pitfall. Do NOT give away the solution directly.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        systemInstruction: "You are Code Master Ada, a patient and encouraging coding mentor. Provide hints that guide without giving away answers directly.",
        safetySettings,
      }
    });
    return response.text || "Code Master Ada is currently recalibrating her debugger. Try again later.";
  } catch (error) {
    console.error("Error getting code debugging hint:", error);
    return "A cosmic glitch disrupted Code Master Ada's hint generator. Please try again.";
  }
};

// Mock Speech-to-Text (remains unchanged)
export const mockSpeechToText = async (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const phrases = [
        "Explain this problem.", "What is a variable?", "How do I filter water?",
        "Give me a hint.", "Validate my code.", "Tell me more about this place.",
        "What should I do next, Thầy Euclid?", "Is this correct?"
      ];
      resolve(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 1500);
  });
};

// Define a schema for the enhanced Learning content response
const LEARNING_CONTENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING },
    summary: { type: Type.STRING },
    keyPoints: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    examples: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          solution: { type: Type.STRING }
        }
      } 
    },
    practiceQuestions: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        }
      } 
    },
    relatedTopics: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    }
  },
  required: ["title", "content", "summary", "keyPoints"]
};

// New function to generate enhanced learning content
export const generateEnhancedLearningContent = async (
  topic: string, 
  category: LearningCategory
): Promise<LearningContent | null> => {
    if (!ai) {
        console.warn("Gemini AI not initialized. Returning mock learning content.");
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            title: `Mock Learning: Introduction to ${topic}`,
            content: `This is a mock explanation about ${topic} in the ${category} category.`,
            summary: `Quick summary about ${topic}.`,
            keyPoints: [`Key point 1 about ${topic}`, `Key point 2 about ${topic}`],
            examples: [
              { description: "Example problem", solution: "Example solution" }
            ],
            practiceQuestions: [
              { question: "Practice question?", answer: "Practice answer" }
            ],
            relatedTopics: [`Topic related to ${topic}`]
        };
    }

    // Customize the prompt based on the category
    let systemInstruction = "";
    let prompt = "";
    
    switch(category) {
      case 'math':
        systemInstruction = "You are Thầy Euclid, a brilliant mathematician and educator. Provide clear, engaging mathematical explanations with visual examples when possible.";
        prompt = `Generate an educational lesson about the mathematical topic: "${topic}". Include a clear title, detailed content with explanations of concepts, a brief summary, key points to remember, mathematical examples with solutions, practice questions, and related topics for further exploration. Format the response as JSON matching the following schema.`;
        break;
      case 'eco':
        systemInstruction = "You are Giáo sư Gaia, an expert environmental scientist. Provide engaging, informative content about ecological systems and environmental science.";
        prompt = `Generate an educational lesson about the environmental topic: "${topic}". Include a clear title, detailed content with explanations of concepts, a brief summary, key points to remember, real-world examples with explanations, practice questions to test understanding, and related topics for further exploration. Format the response as JSON matching the following schema.`;
        break;
      case 'code':
        systemInstruction = "You are Code Master Ada, an expert programmer and computer scientist. Provide clear, practical coding explanations with code examples.";
        prompt = `Generate an educational lesson about the programming topic: "${topic}". Include a clear title, detailed content with explanations of concepts, a brief summary, key points to remember, code examples with explanations, practice coding challenges, and related topics for further exploration. Format the response as JSON matching the following schema.`;
        break;
      default:
        systemInstruction = "You are Giáo sư Thông Thái, a wise and friendly AI guide for learning.";
        prompt = `Generate an educational lesson about the topic: "${topic}". Include a clear title, detailed content, a brief summary, key points to remember, examples, practice questions, and related topics. Format the response as JSON matching the following schema.`;
    }

    prompt += `\n\nSchema: ${JSON.stringify(LEARNING_CONTENT_SCHEMA)}`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: LEARNING_CONTENT_SCHEMA,
                safetySettings,
            }
        });

        const parsed = parseJsonFromMarkdown<LearningContent>(response.text ?? "");

        if (!parsed || !parsed.title || !parsed.content || !parsed.summary || !parsed.keyPoints) {
            console.error("Failed to parse enhanced learning content or essential fields are missing:", response.text, "Parsed:", parsed);
            return { 
                title: "Learning Content Error", 
                content: `The ${getCategoryTeacherName(category)} seems to be thinking very deeply...`,
                summary: "Unable to generate content at this time.",
                keyPoints: ["Please try again later."]
            };
        }
        return parsed;

    } catch (error) {
        console.error("Error generating enhanced learning content:", error, "Prompt:", prompt);
        return { 
            title: "Learning Content Generation Failed", 
            content: `${getCategoryTeacherName(category)} is currently reviewing the universal library. Please try again.`,
            summary: "An error occurred while generating content.",
            keyPoints: ["Please try again later."]
        };
    }
};

// Helper function to get the teacher name based on category
const getCategoryTeacherName = (category: LearningCategory): string => {
  switch(category) {
    case 'math': return "Thầy Euclid";
    case 'eco': return "Giáo sư Gaia";
    case 'code': return "Code Master Ada";
    default: return "Giáo sư Thông Thái";
  }
};

// Get suggested topics for a category
export const getSuggestedTopics = async (category: LearningCategory): Promise<string[]> => {
  if (!ai) {
    console.warn("Gemini AI not initialized. Returning mock suggested topics.");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch(category) {
      case 'math':
        return ["Calculus Basics", "Linear Algebra", "Probability Theory", "Geometry Fundamentals", "Number Theory"];
      case 'eco':
        return ["Water Cycle", "Climate Change", "Biodiversity", "Renewable Energy", "Sustainable Agriculture"];
      case 'code':
        return ["Python Basics", "Data Structures", "Web Development", "Algorithms", "Object-Oriented Programming"];
      default:
        return ["General Knowledge", "Scientific Method", "Critical Thinking", "Research Skills"];
    }
  }

  const prompt = `Generate a list of 8-10 interesting educational topics related to ${category} that would be engaging for students to learn about. These should be specific enough to generate detailed content but broad enough to be meaningful learning subjects. Return only the list of topics as a JSON array of strings.`;
  
  const systemInstruction = `You are ${getCategoryTeacherName(category)}, suggesting interesting topics for students to explore in the field of ${category}.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        safetySettings,
      }
    });

    const parsed = parseJsonFromMarkdown<string[]>(response.text ?? "");
    
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      console.error("Failed to parse suggested topics:", response.text);
      return getDefaultTopics(category);
    }
    
    return parsed;
  } catch (error) {
    console.error("Error generating suggested topics:", error);
    return getDefaultTopics(category);
  }
};

// Default topics if API call fails
const getDefaultTopics = (category: LearningCategory): string[] => {
  switch(category) {
    case 'math':
      return ["Calculus Basics", "Linear Algebra", "Probability Theory", "Geometry Fundamentals", "Number Theory"];
    case 'eco':
      return ["Water Cycle", "Climate Change", "Biodiversity", "Renewable Energy", "Sustainable Agriculture"];
    case 'code':
      return ["Python Basics", "Data Structures", "Web Development", "Algorithms", "Object-Oriented Programming"];
    default:
      return ["General Knowledge", "Scientific Method", "Critical Thinking", "Research Skills"];
  }
};

// Generate a quiz based on learning content
export const generateQuizFromContent = async (
  content: LearningContent, 
  category: LearningCategory,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Quiz | null> => {
  if (!ai) {
    console.warn("Gemini AI not initialized. Returning mock quiz.");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      questions: [
        {
          question: `Mock ${difficulty} question about ${content.title}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 1
        },
        {
          question: `Another mock ${difficulty} question about ${content.title}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 2
        }
      ]
    };
  }

  const prompt = `Based on the following learning content about "${content.title}", generate a ${difficulty} difficulty quiz with 3-5 multiple-choice questions. Each question should have 4 options with only one correct answer.

Content summary: ${content.summary}

Key points:
${content.keyPoints.join('\n')}

Return the quiz as a JSON object with a "questions" array. Each question object should have "question" (string), "options" (array of strings), and "correctAnswer" (number - index of correct option, 0-based).`;

  const systemInstruction = `You are ${getCategoryTeacherName(category)}, creating an engaging quiz to test understanding of the topic "${content.title}".`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.NUMBER }
                },
                required: ["question", "options", "correctAnswer"]
              }
            }
          },
          required: ["questions"]
        },
        safetySettings,
      }
    });

    const parsed = parseJsonFromMarkdown<Quiz>(response.text ?? "");
    
    if (!parsed || !parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      console.error("Failed to parse quiz questions:", response.text);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return null;
  }
};

// Keep the old function for backward compatibility
export const generateLearningContent = async (topic: string): Promise<{ title: string, content: string } | null> => {
  const result = await generateEnhancedLearningContent(topic, 'general');
  if (result) {
    return {
      title: result.title,
      content: result.content
    };
  }
  return null;
};