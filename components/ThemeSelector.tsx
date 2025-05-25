import React, { useContext } from 'react';
import { GameContext } from '../gameContext';
import { Theme } from '../types';

const ThemeSelector: React.FC = () => {
  const gameCtx = useContext(GameContext);

  if (!gameCtx) return null;

  const { gameState, setCurrentTheme } = gameCtx;
  const themes: { id: Theme; name: string; icon: string; color: string }[] = [
    { id: Theme.DARK, name: 'Dark', icon: '🌙', color: 'bg-gray-800 hover:bg-gray-700' },
    { id: Theme.LIGHT, name: 'Light', icon: '☀️', color: 'bg-gray-200 hover:bg-gray-300' },
    { id: Theme.COSMIC_BLUE, name: 'Cosmic', icon: '✨', color: 'bg-indigo-800 hover:bg-indigo-700' },
  ];

  return (
    <div className="relative group">
      <button 
        className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--button-ghost-hover-bg)] transition-colors duration-300"
        aria-label="Theme options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
        </svg>
      </button>
      
      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--card-bg)] ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="py-1 rounded-md bg-[var(--card-bg)]" role="menu" aria-orientation="vertical" aria-labelledby="theme-menu">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setCurrentTheme(theme.id)}
              className={`w-full flex items-center px-4 py-3 text-sm ${gameState.currentTheme === theme.id ? 'bg-[var(--accent-primary-transparent)]' : 'hover:bg-[var(--bg-tertiary)]'} transition-colors duration-200`}
              role="menuitem"
            >
              <span className="mr-3 text-lg">{theme.icon}</span>
              <span>{theme.name}</span>
              {gameState.currentTheme === theme.id && (
                <svg className="ml-auto h-4 w-4 text-[var(--accent-primary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
