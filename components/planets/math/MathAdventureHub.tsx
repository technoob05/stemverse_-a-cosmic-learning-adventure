
import React, { useState, useContext } from 'react';
import { AdventureSelectionItem, AdventureMode } from '../../../types';
import { Button, Modal } from '../../SharedUI'; 
import { GameContext } from '../../../gameContext';

interface MathAdventureHubProps {
  adventures: AdventureSelectionItem[];
  onStartAdventure: (adventureId: string, mode: AdventureMode, totalStages: number) => void;
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className, style }) => {
  const iconMap: { [key: string]: string } = {
    book: '📚', 
    image: '🖼️', 
    text: '📜',  
    play: '▶️',  
    math: '🌌',
    star: '⭐',
    check: '✔️',
  };
  return <span className={className} role="img" aria-label={name} style={style}>{iconMap[name] || '❓'}</span>;
};


const MathAdventureHub: React.FC<MathAdventureHubProps> = ({ adventures, onStartAdventure }) => {
  const [selectedAdventure, setSelectedAdventure] = useState<AdventureSelectionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gameCtx = useContext(GameContext);

  const handleSelectAdventure = (adventure: AdventureSelectionItem) => {
    setSelectedAdventure(adventure);
    setIsModalOpen(true);
  };

  const handleStart = (mode: AdventureMode) => {
    if (selectedAdventure) {
      onStartAdventure(selectedAdventure.id, mode, selectedAdventure.estimatedStages);
      setIsModalOpen(false);
      setSelectedAdventure(null);
    }
  };

  if (!gameCtx) return <div className="flex items-center justify-center min-h-screen"><p className="text-[var(--text-primary)]">Loading game context...</p></div>;
  const mathProgress = gameCtx.gameState.progress['math']?.mathAdventure;

  return (
    <div className="p-4 md:p-8 text-[var(--text-primary)]">
      <div className="text-center mb-10">
        <Icon name="math" className="text-6xl mb-3 mx-auto" style={{color: 'var(--planet-math-color)'}} />
        <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[var(--planet-math-color)] via-[var(--accent-pink-hub)] to-[var(--accent-sky)]"> {/* Use a pinkish accent for variety if defined */}
          Thầy Euclid's Adventure Archives
        </h2>
        <p className="text-[var(--text-secondary)] text-lg">
          Choose a legendary mathematical quest to embark upon. Each journey offers unique challenges and cosmic wisdom.
        </p>
      </div>

      {mathProgress?.completedAdventures && mathProgress.completedAdventures.length > 0 && (
        <div className="mb-8 p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]">
          <h3 className="text-xl font-semibold text-[var(--text-success)] mb-2">Completed Adventures:</h3>
          <ul className="list-disc list-inside text-[var(--text-secondary)]">
            {mathProgress.completedAdventures.map(advId => {
              const completedAdv = adventures.find(a => a.id === advId);
              return <li key={advId}>{completedAdv?.title || advId} <Icon name="star" className="text-yellow-400 ml-1" /></li>;
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {adventures.map((adventure) => {
          const isCompleted = mathProgress?.completedAdventures.includes(adventure.id);
          return (
            <div
              key={adventure.id}
              className={`bg-[var(--card-bg)] p-6 rounded-xl shadow-xl transform transition-all duration-300 hover:shadow-[var(--planet-math-color)]/40 flex flex-col justify-between border ${isCompleted ? 'border-2 border-[var(--text-success)] opacity-80' : 'border-[var(--card-border)] hover:scale-105 hover:border-[var(--planet-math-color)]'}`}
            >
              <div>
                <div className="flex items-center mb-3">
                  <Icon name="book" className="text-3xl mr-3" style={{color: 'var(--planet-math-color)'}} />
                  <h3 className="text-2xl font-semibold" style={{color: 'var(--accent-sky)'}}>{adventure.title}</h3>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-4 min-h-[60px]">{adventure.description}</p>
                <p className="text-xs text-[var(--text-muted)] mb-1">Estimated Stages: {adventure.estimatedStages}</p>
                {isCompleted && <p className="text-sm font-semibold text-[var(--text-success)] mb-3"><Icon name="check" className="mr-1"/>Completed!</p>}
              </div>
              <Button
                onClick={() => handleSelectAdventure(adventure)}
                className="w-full mt-4 !bg-[var(--planet-math-color)] hover:opacity-80"
                // disabled={isCompleted && false} // Allow replaying
              >
                {isCompleted ? 'Replay Adventure' : 'Embark on Adventure'} <Icon name="play" className="ml-2"/>
              </Button>
            </div>
          );
        })}
      </div>

      {selectedAdventure && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Prepare for: ${selectedAdventure.title}`}>
          <p className="text-[var(--text-secondary)] mb-6">{selectedAdventure.description}</p>
          <p className="text-[var(--text-primary)] font-semibold mb-3">Choose your exploration style:</p>
          <div className="space-y-4">
            <Button onClick={() => handleStart('text_only')} className="w-full !bg-[var(--accent-sky)] hover:opacity-80 flex items-center justify-center">
              <Icon name="text" className="mr-2 text-xl"/> Text-Only Saga
            </Button>
            <Button onClick={() => handleStart('text_and_image')} className="w-full !bg-[var(--accent-teal)] hover:opacity-80 flex items-center justify-center">
              <Icon name="image" className="mr-2 text-xl"/> Illustrated Epic (Text + Images)
            </Button>
          </div>
        </Modal>
      )}
       <p className="text-center text-[var(--text-muted)] mt-12 text-sm">
        Mathos awaits your intellect, Star Explorer. May your calculations be true!
      </p>
    </div>
  );
};

export default MathAdventureHub;
