import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '../../contexts/GamificationContext';
import CosmicPassport from './CosmicPassport/CosmicPassport';
import AchievementToast from './AchievementToast/AchievementToast';
import { Button } from '../ui';
import './GamificationHub.css';

interface GamificationHubProps {
  children: React.ReactNode;
}

const GamificationHub: React.FC<GamificationHubProps> = ({ children }) => {
  const [showPassport, setShowPassport] = useState(false);
  const { earnedAchievements, pendingAchievement, dismissAchievement, totalAchievements } = useGamification();

  // Calculate completion percentage
  const completionPercentage = (earnedAchievements.length / totalAchievements) * 100;

  return (
    <div className="gamification-hub">
      {children}
      
      {/* Floating Gamification Button */}
      <motion.div
        className="floating-gamification-btn"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          variant="primary"
          onClick={() => setShowPassport(true)}
          className="passport-trigger-btn"
          title="Open Cosmic Passport"
        >
          <div className="btn-content">
            <span className="passport-icon">🛸</span>
            <div className="progress-ring-mini">
              <svg viewBox="0 0 20 20" className="ring-svg">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.3"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray={`${completionPercentage * 0.5} ${50 - completionPercentage * 0.5}`}
                  strokeDashoffset="12.5"
                  className="progress-circle"
                />
              </svg>
              <span className="achievement-count">{earnedAchievements.length}</span>
            </div>
          </div>
        </Button>
        
        {/* New achievement indicator */}
        {pendingAchievement && (
          <motion.div
            className="new-achievement-indicator"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            !
          </motion.div>
        )}
      </motion.div>

      {/* Quick Stats Overlay */}
      <motion.div
        className="quick-stats-overlay"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="stat-item">
          <span className="stat-icon">🏆</span>
          <span className="stat-value">{earnedAchievements.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <span className="stat-value">{Math.round(completionPercentage)}%</span>
        </div>
      </motion.div>

      {/* Achievement Toast */}
      <AchievementToast
        achievement={pendingAchievement}
        onClose={dismissAchievement}
      />

      {/* Cosmic Passport Modal */}
      <AnimatePresence>
        {showPassport && (
          <CosmicPassport onClose={() => setShowPassport(false)} />
        )}
      </AnimatePresence>

      {/* Achievement unlock particles */}
      <AnimatePresence>
        {pendingAchievement && (
          <motion.div
            className="achievement-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                initial={{ 
                  scale: 0,
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                  opacity: 1
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: window.innerWidth / 2 + (Math.cos(i * 30 * Math.PI / 180) * 200),
                  y: window.innerHeight / 2 + (Math.sin(i * 30 * Math.PI / 180) * 200),
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamificationHub;
