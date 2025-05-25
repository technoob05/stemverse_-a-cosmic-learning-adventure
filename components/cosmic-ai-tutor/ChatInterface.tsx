import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ChatInterface.css';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const quickPrompts = [
    "Explain this concept",
    "What are the key points?",
    "Give me an example",
    "How does this work?",
    "What's the next step?",
    "Can you simplify this?",
  ];

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>💬 Text Chat</h3>
        <p>Type your questions or thoughts</p>
      </div>

      <div className="quick-prompts">
        <h4>Quick Questions:</h4>
        <div className="prompt-buttons">
          {quickPrompts.map((prompt, index) => (
            <motion.button
              key={index}
              className="prompt-button"
              onClick={() => !disabled && onSendMessage(prompt)}
              disabled={disabled}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your learning topic..."
            className="message-input"
            rows={4}
            disabled={disabled}
          />
          <motion.button
            type="submit"
            className="send-button"
            disabled={!message.trim() || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="send-icon">📨</span>
            Send
          </motion.button>
        </div>
      </form>

      <div className="chat-tips">
        <h4>💡 Chat Tips:</h4>
        <ul>
          <li>Ask specific questions for better answers</li>
          <li>Request examples or analogies</li>
          <li>Ask for step-by-step explanations</li>
          <li>Use "Explain like I'm 5" for simple explanations</li>
        </ul>
      </div>
    </div>
  );
};
