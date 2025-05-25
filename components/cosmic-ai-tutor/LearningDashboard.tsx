import React from 'react';
import { motion } from 'framer-motion';
import './LearningDashboard.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  audioData?: ArrayBuffer;
  canvasData?: string;
}

interface LearningDashboardProps {
  messages: Message[];
  topic: string;
  onClose: () => void;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  messages,
  topic,
  onClose,
}) => {
  const userMessages = messages.filter(m => m.type === 'user');
  const aiMessages = messages.filter(m => m.type === 'ai');
  const sessionDuration = messages.length > 0 
    ? Math.round((Date.now() - messages[0].timestamp.getTime()) / 1000 / 60)
    : 0;

  const messagesByType = {
    voice: userMessages.filter(m => m.audioData).length,
    drawing: userMessages.filter(m => m.canvasData).length,
    text: userMessages.filter(m => !m.audioData && !m.canvasData).length,
  };

  const learningInsights = [
    `You've been actively learning about ${topic} for ${sessionDuration} minutes`,
    `Great job using multiple interaction modes! This helps with better understanding`,
    `You've asked ${userMessages.length} questions - curiosity is key to learning`,
    `The AI has provided ${aiMessages.length} responses to guide your learning journey`,
  ];

  return (
    <div className="learning-dashboard">
      <div className="dashboard-header">
        <h3>📊 Learning Dashboard</h3>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>

      <div className="stats-grid">
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon">🕒</div>
          <div className="stat-content">
            <div className="stat-value">{sessionDuration}m</div>
            <div className="stat-label">Session Time</div>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{messages.length}</div>
            <div className="stat-label">Total Messages</div>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{topic}</div>
            <div className="stat-label">Learning Topic</div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="interaction-breakdown"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4>Interaction Breakdown</h4>
        <div className="interaction-stats">
          <div className="interaction-item">
            <span className="interaction-icon">🎤</span>
            <span className="interaction-label">Voice Messages</span>
            <span className="interaction-count">{messagesByType.voice}</span>
          </div>
          <div className="interaction-item">
            <span className="interaction-icon">🎨</span>
            <span className="interaction-label">Drawings</span>
            <span className="interaction-count">{messagesByType.drawing}</span>
          </div>
          <div className="interaction-item">
            <span className="interaction-icon">💬</span>
            <span className="interaction-label">Text Messages</span>
            <span className="interaction-count">{messagesByType.text}</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="learning-insights"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4>💡 Learning Insights</h4>
        <div className="insights-list">
          {learningInsights.map((insight, index) => (
            <motion.div
              key={index}
              className="insight-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <span className="insight-bullet">✨</span>
              <span className="insight-text">{insight}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="progress-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h4>🎯 Learning Progress</h4>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, sessionDuration * 2)}%` }} />
        </div>
        <p className="progress-text">
          Keep going! Active learning sessions help build stronger understanding.
        </p>
      </motion.div>
    </div>
  );
};
