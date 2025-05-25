import React from 'react';
import { AdventureLogEntry, AdventureMode, GeneratedProblem } from '../../../types'; // Import necessary types
import { LoadingSpinner } from '../../SharedUI'; // Import LoadingSpinner if used

// Helper Icon (can be moved to a shared location - duplicating for now) 
// NOTE: If this Icon component is used elsewhere, consider creating a shared file for it.
const Icon: React.FC<{ name: string, className?: string }> = ({ name, className }) => {
  const iconMap: { [key: string]: string } = {
    send: '✉️', hint: '💡', euclid: '🤔', scroll: '📜', retry: '🔄', next: '➡️', check: '✔️', cross: '❌', image_loading: '🎨'
  };
  return <span className={className} role="img" aria-label={name}>{iconMap[name] || '❓'}</span>;
};

export interface AdventureLogProps { // Export the interface
  storyLog: AdventureLogEntry[];
  isLoading: 'story' | 'problem' | 'evaluation' | 'hint' | 'image' | false;
  mode: AdventureMode;
  npcName: string;
}

const AdventureLog: React.FC<AdventureLogProps> = ({ storyLog, isLoading, mode, npcName }) => {
  const storyLogRef = React.useRef<HTMLDivElement>(null); // Add ref

  React.useEffect(() => { // Add useEffect for scrolling
    if (storyLogRef.current) {
      storyLogRef.current.scrollTop = storyLogRef.current.scrollHeight;
    }
  }, [storyLog]);

  return (
    <div ref={storyLogRef} className="flex-grow overflow-y-auto mb-4 p-3 bg-slate-900 rounded-md scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 space-y-3"> {/* Add ref and styles */}
      {storyLog.map((entry, index) => (
        <div key={index} className={`p-2 rounded-md ${
          entry.type === 'story' ? 'bg-[var(--adventure-log-story-bg)] text-[var(--adventure-log-story-text)]' :
          entry.type === 'problem' ? 'bg-[var(--adventure-log-problem-bg)] text-[var(--adventure-log-problem-text)] font-mono' :
          entry.type === 'user_answer' ? 'text-right' : 
          entry.type === 'feedback' ? (entry.isCorrect ? 'bg-[var(--adventure-log-feedback-correct-bg)] text-[var(--adventure-log-feedback-correct-text)]' : 'bg-[var(--adventure-log-feedback-incorrect-bg)] text-[var(--adventure-log-feedback-incorrect-text)]') :
          'text-[var(--text-muted)] italic text-xs' /* system_message, image_prompt, image_url */
        }`}>
          {entry.type === 'user_answer' && <span className="px-3 py-1 bg-[var(--accent-primary)] text-[var(--accent-primary-text)] rounded-lg ml-auto inline-block">{entry.content}</span>}
          {entry.type !== 'user_answer' && <p className="whitespace-pre-wrap">{entry.content}</p>}

          {entry.type === 'story' && entry.imageUrl && (
            <img src={entry.imageUrl} alt={`Scene for "${entry.content.substring(0, 30)}..."`} className="mt-2 rounded-md max-w-full h-auto md:max-h-80 mx-auto shadow-lg border-2 border-[var(--adventure-image-border)]" />
          )}
          {entry.type === 'story' && mode === 'text_and_image' && !entry.imageUrl && typeof isLoading === 'string' && isLoading === 'image' && storyLog.indexOf(entry) === storyLog.length -1 && ( // Check if last entry for loading indicator
               <div className="flex items-center justify-center mt-2 text-[var(--text-muted)]">
                  <Icon name="image_loading" className="animate-pulse mr-2" /> {npcName} is sketching the scene...
               </div>
          )}

          {entry.type === 'problem' && entry.problemDetails && ( // Use problemDetails prop
            <div className="mt-1">
              <p className="text-xs text-[var(--adventure-log-problem-details-text)]">Type: {entry.problemDetails.problemType}, Format: {entry.problemDetails.answerFormatDescription}</p>
              {entry.problemDetails.problemType === 'multiple_choice' && entry.problemDetails.options?.map(opt => (
                <p key={opt.id} className="text-xs text-[var(--adventure-log-problem-options-text)] ml-2">{opt.id}: {opt.text}</p>
              ))}
            </div>
          )}
        </div>
      ))}
      {(typeof isLoading === 'string' && storyLog.length > 0 && (isLoading === 'story' || isLoading === 'problem' || isLoading === 'evaluation')) && ( // Loading indicator
          <div className="flex items-center justify-center p-3 text-[var(--text-muted)]">
              <LoadingSpinner size="sm" /> 
              <span className="ml-2">{npcName} is {isLoading === 'story' ? 'unveiling the next chapter' : isLoading === 'problem' ? 'conjuring a challenge' : 'evaluating your response'}...</span>
          </div>
      )}
    </div>
  );
};

export default AdventureLog; 