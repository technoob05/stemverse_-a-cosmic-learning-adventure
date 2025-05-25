import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContext } from '../../../gameContext';
import { PlanetId } from '../../../types';
import { ACHIEVEMENTS, checkAchievementProgress, getRarityColor, getRarityGlow } from '../../../data/achievements';
import { SKILL_TREES, getSkillTreeProgress } from '../../../data/skillTrees';
import { Card, Button } from '../../ui';
import './CosmicPassport.css';

interface CosmicPassportProps {
  onClose: () => void;
}

const CosmicPassport: React.FC<CosmicPassportProps> = ({ onClose }) => {
  const gameCtx = useContext(GameContext);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'skills' | 'journey'>('overview');

  if (!gameCtx) return null;

  const { gameState } = gameCtx;

  // Calculate player stats
  const playerStats = useMemo(() => {
    const totalQuests = Object.values(gameState.progress).reduce(
      (total, planet) => total + (planet?.completedQuestIds?.length || 0),
      0
    );

    const totalPlanets = gameState.unlockedPlanetIds.length;
    
    // Calculate earned achievements
    const earnedAchievements = ACHIEVEMENTS.filter(achievement => {
      const { completed } = checkAchievementProgress(achievement, gameState);
      return completed;
    });

    // Calculate level based on tokens (every 100 tokens = 1 level)
    const level = Math.floor(gameState.totalTokens / 100) + 1;
    const xpToNextLevel = 100 - (gameState.totalTokens % 100);

    // Calculate skill progress
    const skillProgress = Object.keys(SKILL_TREES).map(treeId => ({
      treeId: treeId as PlanetId | 'global',
      progress: getSkillTreeProgress(treeId as PlanetId | 'global', [])
    }));

    return {
      level,
      totalXP: gameState.totalTokens,
      xpToNextLevel,
      totalQuests,
      totalPlanets,
      earnedAchievements,
      skillProgress,
      joinDate: new Date('2024-01-01'), // Default join date
      title: earnedAchievements.length > 0 ? earnedAchievements[earnedAchievements.length - 1].rewards.title || 'Cosmic Explorer' : 'Star Explorer'
    };
  }, [gameState]);

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const OverviewTab = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="passport-overview"
    >
      {/* Player Card */}
      <div className="player-card">
        <div className="player-avatar">
          <span className="avatar-icon">👨‍🚀</span>
          <div className="level-badge">
            <span className="level-number">{playerStats.level}</span>
          </div>
        </div>
        <div className="player-info">
          <h2 className="player-name">{gameState.userName}</h2>
          <p className="player-title">{playerStats.title}</p>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${((100 - playerStats.xpToNextLevel) / 100) * 100}%` }}></div>
            <span className="xp-text">{playerStats.totalXP} XP</span>
          </div>
          <p className="xp-next">Next level: {playerStats.xpToNextLevel} XP</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{playerStats.earnedAchievements.length}</div>
          <div className="stat-label">Achievements</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{playerStats.totalQuests}</div>
          <div className="stat-label">Quests Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-value">{playerStats.totalPlanets}</div>
          <div className="stat-label">Planets Explored</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{gameState.totalTokens}</div>
          <div className="stat-label">Total Tokens</div>
        </div>
      </div>

      {/* Planet Progress */}
      <div className="planet-progress">
        <h3>Cosmic Realm Progress</h3>
        <div className="planet-grid">
          {Object.values(PlanetId).map(planetId => {
            const planetProgress = gameState.progress[planetId];
            const isUnlocked = gameState.unlockedPlanetIds.includes(planetId);
            const completedQuests = planetProgress?.completedQuestIds?.length || 0;
            
            let planetInfo = {
              name: 'Unknown',
              icon: '❓',
              color: 'var(--accent-tertiary)'
            };

            switch (planetId) {
              case PlanetId.MATH:
                planetInfo = { name: 'Mathos', icon: '🌌', color: 'var(--accent-primary)' };
                break;
              case PlanetId.ECO:
                planetInfo = { name: 'Veridia', icon: '🌳', color: 'var(--accent-secondary)' };
                break;
              case PlanetId.CODE:
                planetInfo = { name: 'Cyberia', icon: '💡', color: 'var(--accent-tertiary)' };
                break;
            }

            return (
              <div key={planetId} className={`planet-card ${!isUnlocked ? 'locked' : ''}`}>
                <div className="planet-icon" style={{ color: planetInfo.color }}>
                  {planetInfo.icon}
                </div>
                <h4>{planetInfo.name}</h4>
                <div className="progress-ring">
                  <svg className="progress-svg" viewBox="0 0 36 36">
                    <path
                      className="progress-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--card-border)"
                      strokeWidth="2"
                    />
                    <path
                      className="progress-fill"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={planetInfo.color}
                      strokeWidth="2"
                      strokeDasharray={`${completedQuests * 20}, 100`}
                    />
                  </svg>
                  <div className="progress-text">{completedQuests}</div>
                </div>
                {!isUnlocked && <div className="lock-overlay">🔒</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="recent-achievements">
        <h3>Recent Achievements</h3>
        <div className="achievement-list">
          {playerStats.earnedAchievements.slice(-3).map(achievement => (
            <div key={achievement.id} className="achievement-item">
              <div className="achievement-icon" style={{ color: getRarityColor(achievement.rarity) }}>
                {achievement.icon}
              </div>
              <div className="achievement-info">
                <h4>{achievement.name}</h4>
                <p>{achievement.description}</p>
              </div>
              <div className="achievement-rarity" data-rarity={achievement.rarity}>
                {achievement.rarity}
              </div>
            </div>
          ))}
          {playerStats.earnedAchievements.length === 0 && (
            <p className="no-achievements">Start your journey to earn your first achievement!</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const AchievementsTab = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="achievements-tab"
    >
      <div className="achievements-header">
        <h3>Achievement Gallery</h3>
        <div className="achievement-stats">
          <span>{playerStats.earnedAchievements.length} / {ACHIEVEMENTS.length} Unlocked</span>
        </div>
      </div>

      <div className="achievement-categories">
        {['all', 'exploration', 'mastery', 'social', 'special'].map(category => (
          <button key={category} className="category-tab active">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="achievements-grid">
        {ACHIEVEMENTS.map(achievement => {
          const { completed, progress, total } = checkAchievementProgress(achievement, gameState);
          const isEarned = completed;
          
          return (
            <div
              key={achievement.id}
              className={`achievement-card ${isEarned ? 'earned' : 'locked'} ${achievement.isHidden && !isEarned ? 'hidden' : ''}`}
              style={{
                boxShadow: isEarned ? getRarityGlow(achievement.rarity) : 'none'
              }}
            >
              <div className="achievement-icon" style={{ color: getRarityColor(achievement.rarity) }}>
                {achievement.isHidden && !isEarned ? '❓' : achievement.icon}
              </div>
              <h4>{achievement.isHidden && !isEarned ? 'Hidden Achievement' : achievement.name}</h4>
              <p>{achievement.isHidden && !isEarned ? 'Complete more challenges to reveal this achievement.' : achievement.description}</p>
              
              {!isEarned && !achievement.isHidden && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(progress / total) * 100}%` }}></div>
                  <span className="progress-text">{progress} / {total}</span>
                </div>
              )}
              
              <div className="achievement-rarity" data-rarity={achievement.rarity}>
                {achievement.rarity}
              </div>
              
              {isEarned && (
                <div className="earned-badge">✓</div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const SkillsTab = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="skills-tab"
    >
      <div className="skills-header">
        <h3>Skill Development</h3>
        <p>Enhance your cosmic abilities across all realms</p>
      </div>

      <div className="skill-trees">
        {Object.entries(SKILL_TREES).map(([treeId, tree]) => {
          const progress = getSkillTreeProgress(treeId as PlanetId | 'global', []);
          
          return (
            <div key={treeId} className="skill-tree-card">
              <div className="tree-header">
                <h4>{tree.name}</h4>
                <p>{tree.description}</p>
              </div>
              
              <div className="tree-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-percentage">{Math.round(progress)}%</span>
              </div>
              
              <div className="skill-preview">
                {tree.skills.slice(0, 3).map(skill => (
                  <div key={skill.id} className={`skill-node ${skill.isUnlocked ? 'unlocked' : 'locked'}`}>
                    <span className="skill-icon">{skill.icon}</span>
                    <span className="skill-name">{skill.name}</span>
                  </div>
                ))}
              </div>
              
              <Button
                variant="tertiary"
                size="sm"
                className="view-tree-btn"
                onClick={() => setActiveTab('skills')}
              >
                View Full Tree
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const JourneyTab = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="journey-tab"
    >
      <div className="journey-header">
        <h3>Learning Journey</h3>
        <p>Track your cosmic adventure timeline</p>
      </div>

      <div className="journey-timeline">
        <div className="timeline-item">
          <div className="timeline-icon">🚀</div>
          <div className="timeline-content">
            <h4>Journey Begins</h4>
            <p>Welcome to STEMverse! Your cosmic learning adventure starts here.</p>
            <span className="timeline-date">{playerStats.joinDate.toLocaleDateString()}</span>
          </div>
        </div>
        
        {gameState.unlockedPlanetIds.map((planetId, index) => {
          let planetInfo = { name: 'Unknown', icon: '❓' };
          
          switch (planetId) {
            case PlanetId.MATH:
              planetInfo = { name: 'Mathos', icon: '🌌' };
              break;
            case PlanetId.ECO:
              planetInfo = { name: 'Veridia', icon: '🌳' };
              break;
            case PlanetId.CODE:
              planetInfo = { name: 'Cyberia', icon: '💡' };
              break;
          }
          
          return (
            <div key={planetId} className="timeline-item">
              <div className="timeline-icon">{planetInfo.icon}</div>
              <div className="timeline-content">
                <h4>Planet {planetInfo.name} Unlocked</h4>
                <p>You've gained access to a new cosmic realm of learning!</p>
                <span className="timeline-date">Recently</span>
              </div>
            </div>
          );
        })}

        {playerStats.earnedAchievements.map((achievement, index) => (
          <div key={achievement.id} className="timeline-item">
            <div className="timeline-icon">{achievement.icon}</div>
            <div className="timeline-content">
              <h4>Achievement: {achievement.name}</h4>
              <p>{achievement.description}</p>
              <span className="timeline-date">Recently</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="cosmic-passport"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card variant="glass" className="passport-container">
        <div className="passport-header">
          <h1 className="passport-title">
            <span className="title-icon">🛸</span>
            Cosmic Passport
          </h1>
          <Button variant="ghost" onClick={onClose} className="close-btn">
            ✕
          </Button>
        </div>

        <div className="passport-tabs">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' },
            { id: 'skills', label: 'Skills', icon: '🌟' },
            { id: 'journey', label: 'Journey', icon: '🗺️' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="passport-content">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab key="overview" />}
            {activeTab === 'achievements' && <AchievementsTab key="achievements" />}
            {activeTab === 'skills' && <SkillsTab key="skills" />}
            {activeTab === 'journey' && <JourneyTab key="journey" />}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

export default CosmicPassport;
