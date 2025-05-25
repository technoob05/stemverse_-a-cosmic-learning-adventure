import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrawingCanvas } from './DrawingCanvas';
import { VoiceVisualizer } from './VoiceVisualizer';
import { ChatInterface } from './ChatInterface';
import { LearningDashboard } from './LearningDashboard';
import { VideoInterface } from './VideoInterface';
import { useLiveAPI } from '../live-api-web-console-demos-genexplainer/src/hooks/use-live-api';
import type { Part } from '@google/generative-ai';
import AudioPulse from './AudioPulse';
import './CosmicAiTutor.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const HOST = "generativelanguage.googleapis.com";
const URI = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  audioData?: ArrayBuffer;
  canvasData?: string;
}

// Safe base64 conversion for large ArrayBuffers
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // Process in smaller chunks to avoid stack overflow
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  
  return btoa(binary);
};

const CosmicAiTutor: React.FC = () => {
  const { client, connected, connect, disconnect, volume, setConfig } = useLiveAPI({
    url: URI,
    apiKey: API_KEY,
  });
  // State management
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMode, setCurrentMode] = useState<'voice' | 'draw' | 'chat' | 'video'>('voice');
  const [learningTopic, setLearningTopic] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((type: 'user' | 'ai', content: string, audioData?: ArrayBuffer, canvasData?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      audioData,
      canvasData,
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set initial config for LiveAPI
  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
    });
  }, [setConfig]);
  
  // Handle AI text responses
  useEffect(() => {
    if (!client) return;

    const handleContentResponse = (contentResponse: any) => {
      setIsThinking(false);
      if (contentResponse.modelTurn?.parts) {
        const textParts = contentResponse.modelTurn.parts.filter((part: Part) => part.text);
        if (textParts.length > 0) {
          const aiText = textParts.map((p: Part) => p.text).join("\n");
          addMessage('ai', aiText);
        }
      } else if (contentResponse.text) { 
         addMessage('ai', contentResponse.text);
      }
    };
    
    const handleTurnComplete = () => {
        setIsThinking(false); 
    };

    const handleInterrupted = () => {
        setIsThinking(false);
        addMessage('ai', "My apologies, my previous response was interrupted. Could you please repeat or rephrase?");
    };
    
    const handleSetupComplete = () => {
        console.log("Live API Setup Complete");        if (messages.length === 0) { 
             const initPrompt = `You are a Cosmic AI Tutor in the STEMverse learning adventure designed specifically for middle school students (ages 11-14). You're a wise, encouraging, and engaging teacher who helps students learn through interactive conversations. 

Key guidelines for teaching middle schoolers:
- Use age-appropriate language and examples they can relate to
- Break complex concepts into smaller, digestible parts
- Use analogies and real-world connections they understand
- Encourage hands-on learning and experimentation
- Be patient and provide positive reinforcement
- Ask questions to check understanding
- Make learning fun and interactive

You can see what students draw, hear their voice, and when they share their camera or screen, you can provide real-time visual guidance. Keep responses conversational, encouraging, and educational. The current learning topic is: ${learningTopic || 'General Learning'}. 

Please introduce yourself briefly as their friendly AI tutor and ask what they'd like to explore today!`;
            client.send([{ text: initPrompt }]);
        }
    };

    client.on('content', handleContentResponse);
    client.on('turncomplete', handleTurnComplete);
    client.on('interrupted', handleInterrupted);
    client.on('setupcomplete', handleSetupComplete);

    return () => {
      client.off('content', handleContentResponse);
      client.off('turncomplete', handleTurnComplete);
      client.off('interrupted', handleInterrupted);
      client.off('setupcomplete', handleSetupComplete);
    };
  }, [client, addMessage, learningTopic, messages.length]);

  const startConversation = async () => {
    if (!API_KEY) {
      addMessage('ai', "API Key is missing. Please configure VITE_GEMINI_API_KEY.");
      return;
    }
    if (connected) return;

    setIsThinking(true); 
    try {
      await connect(); 
      setIsListening(true); 
    } catch (error) {
      console.error("Failed to connect:", error);
      addMessage('ai', "Sorry, I couldn't connect to the learning servers. Please try again.");
      setIsThinking(false);
    }
  };

  const stopConversation = async () => {
    if (!connected) return;
    try {
      await disconnect();
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
    setIsListening(false);
  };

  const handleVoiceInput = useCallback(async (audioData: ArrayBuffer) => {
    if (!connected || !client) {
      console.warn('Cannot send voice input: not connected or client unavailable');
      return;
    }
    
    try {
      setIsThinking(true);
      addMessage('user', '🎤 Voice message sent', audioData);
      
      // Use safe base64 conversion to avoid stack overflow
      const base64Audio = arrayBufferToBase64(audioData);
      
      // Send audio data to the API
      client.send([{ inlineData: { mimeType: 'audio/webm', data: base64Audio } }]);
    } catch (error) {
      console.error('Error processing voice input:', error);
      setIsThinking(false);
      addMessage('ai', 'Sorry, there was an error processing your voice input. Please try again.');
    }
  }, [connected, client, addMessage]);

  const handleCanvasSubmit = useCallback((canvasData: string) => {
    if (!connected || !client) return;
    
    try {
      setIsThinking(true);
      addMessage('user', '🎨 Drawing submitted', undefined, canvasData);
      
      const base64Image = canvasData.split(',')[1];
      const promptText = `Please analyze this drawing. The student is learning about: ${learningTopic || 'the provided image'}. Provide educational feedback or ask clarifying questions.`;
      
      client.send([
        { text: promptText },
        { inlineData: { mimeType: 'image/png', data: base64Image } }
      ]);
    } catch (error) {
      console.error('Error processing canvas input:', error);
      setIsThinking(false);
      addMessage('ai', 'Sorry, there was an error processing your drawing. Please try again.');
    }
  }, [connected, client, addMessage, learningTopic]);
  const handleTextMessage = useCallback((text: string) => {
    if (!connected || !client) return;
    
    try {
      setIsThinking(true);
      addMessage('user', text);
      client.send([{ text }]);
    } catch (error) {
      console.error('Error processing text input:', error);
      setIsThinking(false);
      addMessage('ai', 'Sorry, there was an error processing your message. Please try again.');
    }
  }, [connected, client, addMessage]);

  const handleVideoFrame = useCallback((frameData: string) => {
    if (!connected || !client) return;
    
    try {
      const base64Image = frameData.split(',')[1];
      const promptText = `I can see your ${currentMode === 'video' ? 'camera view' : 'screen'}. How can I help you with what you're showing me? Topic: ${learningTopic || 'what I see in the image'}`;
      
      client.send([
        { text: promptText },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
      ]);
    } catch (error) {
      console.error('Error processing video frame:', error);
    }
  }, [connected, client, learningTopic, currentMode]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="cosmic-ai-tutor"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header className="tutor-header" variants={itemVariants}>
        <div className="header-content">
          <div className="title-section">
            <h1 className="cosmic-title">
              <span className="title-icon">🤖</span>
              Cosmic AI Tutor
              <span className="title-sparkle">✨</span>
            </h1>
            <p className="subtitle">Your personal AI learning companion in the STEMverse</p>
          </div>
          
          <div className="connection-status">
            <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              {connected ? 'Connected' : 'Disconnected'}
            </div>
            
            {connected && (
              <div className="voice-activity">
                <AudioPulse 
                  active={connected}
                  volume={volume}
                  hover={isThinking}
                />
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Learning Topic Input */}
      {!connected && (
        <motion.div className="topic-setup" variants={itemVariants}>
          <div className="setup-card">
            <h3>What would you like to learn today?</h3>
            <p className="topic-description">
              Choose a subject that interests you! I can help with math, science, coding, and much more.
            </p>
            <div className="topic-suggestions">
              <button 
                className="topic-suggestion"
                onClick={() => setLearningTopic('Math - Algebra Basics')}
              >
                📊 Algebra
              </button>
              <button 
                className="topic-suggestion"
                onClick={() => setLearningTopic('Science - Solar System')}
              >
                🌌 Space
              </button>
              <button 
                className="topic-suggestion"
                onClick={() => setLearningTopic('Coding - Python Basics')}
              >
                💻 Coding
              </button>
              <button 
                className="topic-suggestion"
                onClick={() => setLearningTopic('Biology - Human Body')}
              >
                🧬 Biology
              </button>
            </div>            <div className="topic-input-group">
              <input
                type="text"
                value={learningTopic}
                onChange={(e) => setLearningTopic(e.target.value)}
                placeholder="Or type your own topic (e.g., 'fractions', 'planets', 'Python loops')"
                className="topic-input"
              />
              <button 
                onClick={startConversation}
                className="start-button"
                disabled={!API_KEY || isThinking || !learningTopic.trim()}
              >
                <span className="button-icon">🚀</span>
                {isThinking ? 'Connecting...' : 'Start Learning Adventure'}
              </button>
            </div>
            {!API_KEY && (
              <p className="api-warning">
                ⚠️ Add VITE_GEMINI_API_KEY to your environment variables for full AI functionality
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Interface */}
      {connected && (
        <motion.div className="main-interface" variants={itemVariants}>
          {/* Mode Selector */}
          <div className="mode-selector">
            <button 
              className={`mode-button ${currentMode === 'voice' ? 'active' : ''}`}
              onClick={() => setCurrentMode('voice')}
            >
              <span className="mode-icon">🎤</span>
              Voice Chat
            </button>
            <button 
              className={`mode-button ${currentMode === 'draw' ? 'active' : ''}`}
              onClick={() => setCurrentMode('draw')}
            >
              <span className="mode-icon">🎨</span>
              Draw & Learn
            </button>            <button 
              className={`mode-button ${currentMode === 'video' ? 'active' : ''}`}
              onClick={() => setCurrentMode('video')}
            >
              <span className="mode-icon">📹</span>
              Video Chat
            </button>
            <button 
              className={`mode-button ${currentMode === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentMode('chat')}
            >
              <span className="mode-icon">💬</span>
              Text Chat
            </button>
            <button 
              className="dashboard-toggle"
              onClick={() => setShowDashboard(!showDashboard)}
            >
              <span className="mode-icon">📊</span>
              Dashboard
            </button>
          </div>

          {/* Content Area */}
          <div className="content-grid">
            {/* Left Panel - Interactive Tools */}
            <div className="tool-panel">
              <AnimatePresence mode="wait">
                {currentMode === 'voice' && (
                  <motion.div
                    key="voice"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="voice-interface"
                  >
                    <VoiceVisualizer 
                      isListening={isListening} 
                      volume={0} 
                      onVoiceData={handleVoiceInput}
                    />
                  </motion.div>
                )}

                {currentMode === 'draw' && (
                  <motion.div
                    key="draw"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="drawing-interface"
                  >
                    <DrawingCanvas
                      ref={canvasRef}
                      onSubmit={handleCanvasSubmit}
                    />
                  </motion.div>
                )}

                {currentMode === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-interface"
                  >
                    <ChatInterface
                      onSendMessage={handleTextMessage}
                      disabled={isThinking}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Panel - Conversation & Dashboard */}
            <div className="conversation-panel">
              {!showDashboard ? (
                <div className="messages-container">
                  <div className="messages-list">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`message ${message.type}`}
                      >
                        <div className="message-avatar">
                          {message.type === 'ai' ? '🤖' : '👨‍🚀'}
                        </div>
                        <div className="message-content">
                          <div className="message-text">{message.content}</div>
                          {message.canvasData && (
                            <img 
                              src={message.canvasData} 
                              alt="User drawing" 
                              className="message-image"
                            />
                          )}
                          {message.audioData && message.type === 'user' && (
                            <audio 
                              controls 
                              src={URL.createObjectURL(new Blob([message.audioData], {type: 'audio/webm'}))} 
                              className="message-audio-playback" 
                            />
                          )}
                          <div className="message-time">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isThinking && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="message ai thinking"
                      >
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                          <div className="thinking-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                <LearningDashboard
                  messages={messages}
                  topic={learningTopic}
                  onClose={() => setShowDashboard(false)}
                />
              )}
            </div>
          </div>

          {/* Control Bar */}
          <div className="control-bar">
            <button 
              onClick={stopConversation}
              className="stop-button"
            >
              <span className="button-icon">⏹️</span>
              End Session
            </button>
            
            <div className="session-info">
              <span className="topic-tag">Topic: {learningTopic || "General"}</span>
              <span className="message-count">{messages.length} messages</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CosmicAiTutor;
