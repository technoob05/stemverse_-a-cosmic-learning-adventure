import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";
import { 
    GEMINI_MODEL_TEXT,
    GEMINI_MODEL_IMAGE
} from '../constants';
import {
    LearningContent,
    LearningCategory,
    Quiz
} from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("API_KEY environment variable is not set. Gemini functionality will be mocked or disabled.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Configuration for safety settings
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

// Helper function to get the teacher name based on category
const getCategoryTeacherName = (category: LearningCategory): string => {
  switch(category) {
    case 'math': return "Thầy Euclid";
    case 'eco': return "Giáo sư Gaia";
    case 'code': return "Code Master Ada";
    default: return "Giáo sư Thông Thái";
  }
};

// Generate enhanced learning content
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