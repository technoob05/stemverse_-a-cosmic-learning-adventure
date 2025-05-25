import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { marked } from 'marked';
// Use a CSS import without type checking
// @ts-ignore
import styles from './AiStoryteller.module.css';

// Add ImportMeta interface augmentation for Vite's env
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

const AiStoryteller: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [modelOutput, setModelOutput] = useState<string>('');
  const [slideshow, setSlideshow] = useState<Array<{text: string, imgSrc: string}>>([]);
  const [error, setError] = useState<string>('');

  const additionalInstructions = `
    Use a fun story about lots of tiny cats as a metaphor.
    Keep sentences short but conversational, casual, and engaging.
    Generate a cute, minimal illustration for each sentence with black ink on white background.
    No commentary, just begin your explanation.
    Keep going until you're done.`;

  const parseError = (error: string) => {
    const regex = /{"error":(.*)}/gm;
    const m = regex.exec(error);
    try {
      if (m && m[1]) {
        const e = m[1];
        const err = JSON.parse(e);
        return err.message;
      }
      return error;
    } catch (e) {
      return error;
    }
  };

  const addSlide = (text: string, imgSrc: string) => {
    setSlideshow(prev => [...prev, { text, imgSrc }]);
  };

  const generate = async (message: string) => {
    setIsGenerating(true);
    setModelOutput('');
    setSlideshow([]);
    setError('');

    try {
      // Initialize the Gemini API client
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Create a chat instance with image generation capability
      const chat = ai.chats.create({
        model: 'gemini-2.0-flash-preview-image-generation',
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
        history: [],
      });

      // Display user input
      setModelOutput(message);
      setUserInput('');

      // Send message to Gemini
      const result = await chat.sendMessageStream({
        message: message + additionalInstructions,
      });

      let text = '';
      let img = null;

      // Process the streaming response
      for await (const chunk of result) {
        for (const candidate of chunk.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.text) {
              text += part.text;
            } else {
              try {
                const data = part.inlineData;
                if (data) {
                  img = `data:image/png;base64,${data.data}`;
                }
              } catch (e) {
                console.error('Error processing image data:', e);
              }
            }
            
            if (text && img) {
              addSlide(text, img);
              text = '';
              img = null;
            }
          }
        }
      }
      
      // Handle any remaining text
      if (text && img) {
        addSlide(text, img);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Something went wrong: ${parseError(msg)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Example prompts
  const examples = [
    "Explain how neural networks work.",
    "Explain how The Matrix works.",
    "Explain how spaghettification works.",
    "Explain how photosynthesis works.",
    "Explain how the water cycle works.",
    "Explain how coding algorithms work."
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Storyteller: Explain with Tiny Cats</h1>
        <p className={styles.subtitle}>
          Learn complex concepts through fun stories with adorable cat illustrations
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.inputSection}>
          <h2>Choose a topic to explore:</h2>
          
          <div className={styles.examples}>
            {examples.map((example, index) => (
              <button 
                key={index} 
                className={styles.exampleButton}
                onClick={() => generate(example)}
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
          
          <div className={styles.customInput}>
            <h2>Or enter your own topic:</h2>
            <div className={styles.inputWrapper}>
              <textarea
                id="input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter a topic you want to learn about..."
                disabled={isGenerating}
                className={styles.textarea}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (userInput.trim()) {
                      generate(userInput);
                    }
                  }
                }}
              />
              <button 
                onClick={() => userInput.trim() && generate(userInput)}
                disabled={isGenerating || !userInput.trim()}
                className={styles.generateButton}
              >
                {isGenerating ? 'Generating...' : 'Generate Story'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {modelOutput && (
          <div className={styles.userQuery}>
            <strong>Your topic:</strong> {modelOutput}
          </div>
        )}

        {isGenerating && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>The tiny cats are working on your story...</p>
          </div>
        )}

        {slideshow.length > 0 && (
          <div className={styles.slideshowContainer}>
            <h2>Your Cat-Explained Story</h2>
            <div className={styles.slideshow}>
              {slideshow.map((slide, index) => (
                <div key={index} className={styles.slide}>
                  <img src={slide.imgSrc} alt={`Illustration for slide ${index + 1}`} />
                  <div 
                    className={styles.caption}
                    dangerouslySetInnerHTML={{ __html: marked.parse(slide.text) }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiStoryteller; 