import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../../../types/gamification';
import { getRarityColor, getRarityGlow } from '../../../data/achievements';
import './AchievementToast.css';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
  duration?: number;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ 
  achievement, 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [achievement, duration, onClose]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="achievement-toast"
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300 
          }}
          style={{
            boxShadow: getRarityGlow(achievement.rarity)
          }}
        >
          <div className="toast-content">
            <div className="toast-header">
              <div className="toast-title">
                <span className="celebration-icon">🎉</span>
                Achievement Unlocked!
              </div>
              <button 
                className="close-toast-btn"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="achievement-details">
              <div 
                className="achievement-icon-large"
                style={{ color: getRarityColor(achievement.rarity) }}
              >
                {achievement.icon}
              </div>
              
              <div className="achievement-text">
                <h3 className="achievement-name">{achievement.name}</h3>
                <p className="achievement-description">{achievement.description}</p>
                
                <div className="achievement-rewards">
                  <div className="reward-item">
                    <span className="reward-icon">🎯</span>
                    <span className="reward-text">+{achievement.rewards.tokens} Tokens</span>
                  </div>
                  
                  {achievement.rewards.title && (
                    <div className="reward-item">
                      <span className="reward-icon">👑</span>
                      <span className="reward-text">Title: {achievement.rewards.title}</span>
                    </div>
                  )}
                  
                  {achievement.rewards.cosmetic && (
                    <div className="reward-item">
                      <span className="reward-icon">✨</span>
                      <span className="reward-text">Cosmetic: {achievement.rewards.cosmetic}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div 
                className="rarity-badge"
                data-rarity={achievement.rarity}
                style={{ 
                  color: getRarityColor(achievement.rarity),
                  borderColor: getRarityColor(achievement.rarity)
                }}
              >
                {achievement.rarity.toUpperCase()}
              </div>
            </div>
          </div>
          
          {/* Animated particles for legendary achievements */}
          {achievement.rarity === 'legendary' && (
            <div className="particle-effects">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="particle"
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    x: Math.cos(i * 45 * Math.PI / 180) * 100,
                    y: Math.sin(i * 45 * Math.PI / 180) * 100
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
