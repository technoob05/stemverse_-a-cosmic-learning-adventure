import React, { useContext } from 'react';
import { GameContext } from '../gameContext';
import { Theme } from '../types';

const ThemeSelector: React.FC = () => {
  const gameCtx = useContext(GameContext);

  if (!gameCtx) return null;

  const { gameState, setCurrentTheme } = gameCtx;
  const themes: { id: Theme; name: string; icon: string; color: string; description: string }[] = [
    { id: Theme.DARK, name: 'Dark', icon: '🌙', color: 'bg-gray-800 hover:bg-gray-700', description: 'Classic dark theme' },
    { id: Theme.LIGHT, name: 'Light', icon: '☀️', color: 'bg-gray-200 hover:bg-gray-300', description: 'Clean light theme' },
    { id: Theme.COSMIC_BLUE, name: 'Cosmic', icon: '✨', color: 'bg-indigo-800 hover:bg-indigo-700', description: 'Space odyssey' },
    { id: Theme.NEON_CYBERPUNK, name: 'Cyberpunk', icon: '🌆', color: 'bg-pink-600 hover:bg-pink-500', description: 'Neon cyberpunk vibes' },
    { id: Theme.OCEAN_DEEP, name: 'Ocean', icon: '🌊', color: 'bg-cyan-700 hover:bg-cyan-600', description: 'Deep ocean depths' },
    { id: Theme.SUNSET_FLAME, name: 'Sunset', icon: '🔥', color: 'bg-orange-600 hover:bg-orange-500', description: 'Warm sunset flames' },
    { id: Theme.FOREST_MATRIX, name: 'Matrix', icon: '🌲', color: 'bg-green-600 hover:bg-green-500', description: 'Digital forest matrix' },
    { id: Theme.ELECTRIC_STORM, name: 'Storm', icon: '⚡', color: 'bg-purple-700 hover:bg-purple-600', description: 'Electric storm energy' },
    { id: Theme.GALACTIC_GOLD, name: 'Gold', icon: '🌟', color: 'bg-yellow-600 hover:bg-yellow-500', description: 'Galactic gold luxury' },
    { id: Theme.ARCTIC_AURORA, name: 'Aurora', icon: '❄️', color: 'bg-teal-600 hover:bg-teal-500', description: 'Arctic aurora borealis' },
    { id: Theme.ROYAL_PURPLE, name: 'Royal', icon: '👑', color: 'bg-violet-700 hover:bg-violet-600', description: 'Royal purple elegance' },
  ];

  return (
    <div className="relative group">
      <button 
        className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--button-ghost-hover-bg)] transition-colors duration-300 hover-lift"
        aria-label="Theme options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
        </svg>
      </button>
      
      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto rounded-xl shadow-2xl bg-[var(--card-bg)] ring-1 ring-[var(--card-border)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 glass">
        <div className="py-2 rounded-xl bg-[var(--card-bg)]" role="menu" aria-orientation="vertical" aria-labelledby="theme-menu">
          <div className="px-4 py-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider border-b border-[var(--card-border)]">
            Choose Theme
          </div>
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setCurrentTheme(theme.id)}
              className={`w-full flex items-center px-4 py-3 text-sm hover-lift transition-all duration-200 ${
                gameState.currentTheme === theme.id 
                  ? 'bg-[var(--accent-primary-transparent)] text-[var(--accent-primary)] animate-pulse-glow' 
                  : 'hover:bg-[var(--button-ghost-hover-bg)] text-[var(--text-primary)]'
              }`}
              role="menuitem"
            >
              <span className={`mr-3 text-xl ${gameState.currentTheme === theme.id ? 'animate-glow' : ''}`}>
                {theme.icon}
              </span>
              <div className="flex flex-col items-start flex-1">
                <span className="font-medium">{theme.name}</span>
                <span className="text-xs text-[var(--text-tertiary)] opacity-75">
                  {theme.description}
                </span>
              </div>
              {gameState.currentTheme === theme.id && (
                <svg className="ml-auto h-4 w-4 text-[var(--accent-primary)] animate-spark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
          <div className="px-4 py-2 mt-2 border-t border-[var(--card-border)]">
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              ✨ Premium themes for amazing demos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
