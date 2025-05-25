import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { GameContext } from '../../../gameContext';
import { AdventureSelectionItem, AdventureMode, GeneratedProblem, AdventureLogEntry } from '../../../types';
import * as geminiService from '../../../services/geminiService';
import { Button, LoadingSpinner, Modal } from '../../SharedUI';
import { TOKENS_FOR_HINT, TOKENS_PER_QUEST_STAGE } from '../../../constants';
import AdventureLog from './AdventureLog';

// Helper Icon (can be moved to a shared location)
const Icon: React.FC<{ name: string, className?: string }> = ({ name, className }) => {
  const iconMap: { [key: string]: string } = {
    send: '✉️', hint: '💡', euclid: '🤔', scroll: '📜', retry: '🔄', next: '➡️', check: '✔️', cross: '❌', image_loading: '🎨'
  };
  return <span className={className} role="img" aria-label={name}>{iconMap[name] || '❓'}</span>;
};

interface MathAdventureScreenProps {
  adventure: AdventureSelectionItem;
  mode: AdventureMode;
  npcName: string;
}

const MathAdventureScreen: React.FC<MathAdventureScreenProps> = ({ adventure, mode, npcName }) => {
  const gameCtx = useContext(GameContext);
  const [storyLog, setStoryLog] = useState<AdventureLogEntry[]>([]);
  const [currentProblem, setCurrentProblem] = useState<GeneratedProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<'story' | 'problem' | 'evaluation' | 'hint' | 'image' | false>(false);
  const [currentStageNum, setCurrentStageNum] = useState(0); // 0 for intro, 1 for first problem, etc.
  const [showEndAdventureModal, setShowEndAdventureModal] = useState(false);
  const [adventureComplete, setAdventureComplete] = useState(false);
  
  const storyLogRef = useRef<HTMLDivElement>(null);

  const adventureEndedRef = useRef(false); // To prevent multiple end calls

  const addLogEntry = useCallback((entry: Omit<AdventureLogEntry, 'timestamp'>) => {
    setStoryLog(prev => [...prev, { ...entry, timestamp: Date.now() }]);
  }, []);

  useEffect(() => {
    if (storyLogRef.current) {
      storyLogRef.current.scrollTop = storyLogRef.current.scrollHeight;
    }
  }, [storyLog]);

  // Initial story fetch
  useEffect(() => {
    adventureEndedRef.current = false; // Reset on new adventure screen mount
    setAdventureComplete(false);
    setCurrentStageNum(0);
    setStoryLog([]); // Clear previous adventure logs

    const fetchInitialStory = async () => {
      setIsLoading('story');
      addLogEntry({ type: 'system_message', content: `Starting adventure: ${adventure.title} (${mode})` });
      const introStory = await geminiService.getInitialMathAdventureStory(adventure.themePrompt, adventure.title);
      const storyEntryContent: Omit<AdventureLogEntry, 'timestamp'> = { type: 'story', content: introStory };
      
      if (mode === 'text_and_image') {
        setIsLoading('image');
        const imageUrl = await geminiService.generateImageFromPrompt(introStory, adventure.title, adventure.themePrompt);
        (storyEntryContent as AdventureLogEntry).imageUrl = imageUrl || undefined; // Add image URL if generated
        addLogEntry({type: 'image_prompt', content: `Image for intro: ${introStory.substring(0,100)}...`});
        if(imageUrl) addLogEntry({type: 'image_url', content: imageUrl});
      }
      setStoryLog(prev => [...prev, { ...storyEntryContent, timestamp: Date.now() } as AdventureLogEntry]); // Add with timestamp here OR ensure addLogEntry is used
      setIsLoading(false);
      // After initial story, fetch the first problem
      setCurrentStageNum(1); // Move to stage 1 for the first problem
    };
    fetchInitialStory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adventure.id, mode]); // Rerun if adventure or mode changes (should be rare after initial load)

  // Fetch problem when currentStageNum increments (and > 0)
  useEffect(() => {
    if (currentStageNum > 0 && currentStageNum <= adventure.estimatedStages && !adventureEndedRef.current) {
      const fetchProblem = async () => {
        setIsLoading('problem');
        setCurrentProblem(null); // Clear old problem
        const lastStory = storyLog.filter(entry => entry.type === 'story').pop()?.content || adventure.themePrompt;
        addLogEntry({type: 'system_message', content: `Fetching problem for Stage ${currentStageNum}...`});
        const problemData = await geminiService.generateMathProblemForAdventure(lastStory, adventure.themePrompt, currentStageNum, adventure.estimatedStages);
        
        if (problemData && problemData.problemText) {
            setCurrentProblem(problemData);
            addLogEntry({type: 'problem', content: `Problem: ${problemData.problemText}`, problemDetails: problemData});
        } else {
            addLogEntry({type: 'system_message', content: "Error: Could not load the next problem. Thầy Euclid seems puzzled."});
            // Consider retry logic or ending adventure if too many errors
        }
        setIsLoading(false);
      };
      fetchProblem();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageNum, adventure.estimatedStages]);

  const currentOverallLoading = typeof isLoading === 'string';

  const handleAnswerSubmit = async () => {
    if (!currentProblem || (!userAnswer.trim() && currentProblem.problemType === 'text_input' && !selectedOptionId) || (currentProblem.problemType === 'multiple_choice' && !selectedOptionId)) {
      addLogEntry({type: 'feedback', content: "Please provide an answer or select an option.", isCorrect: false});
      return;
    }
    setIsLoading('evaluation');
    
    const answerToSubmit = currentProblem.problemType === 'multiple_choice' ? selectedOptionId! : userAnswer;
    addLogEntry({type: 'user_answer', content: `${currentProblem.problemType === 'multiple_choice' ? currentProblem.options?.find(o=>o.id === selectedOptionId)?.text : userAnswer}` });

    const evaluation = await geminiService.evaluateMathAnswerForAdventure(
      currentProblem.problemText,
      answerToSubmit,
      currentProblem.problemType,
      currentProblem.correctAnswer,
      currentProblem.answerFormatDescription
    );

    if (evaluation) {
      addLogEntry({type: 'feedback', content: `${npcName}: ${evaluation.feedbackText}`, isCorrect: evaluation.isCorrect});
      if (evaluation.isCorrect) {
        gameCtx?.completeAdventureStage(`stage_${currentStageNum}`, TOKENS_PER_QUEST_STAGE);
        
        // Fetch next story segment
        setIsLoading('story');
        const lastStoryContext = storyLog.filter(entry => entry.type === 'story').pop()?.content || adventure.themePrompt;
        const isFinalStage = currentStageNum === adventure.estimatedStages;
        
        const nextStorySegment = await geminiService.continueMathAdventureStory(
            adventure.themePrompt, 
            currentProblem.problemText, 
            answerToSubmit, 
            lastStoryContext, 
            currentStageNum, 
            adventure.estimatedStages,
            isFinalStage,
            adventure.title // Added missing adventureTitle
        );

        const storyEntryContent: Omit<AdventureLogEntry, 'timestamp'> = { type: 'story', content: nextStorySegment };
        if (mode === 'text_and_image' && nextStorySegment) {
            setIsLoading('image'); // Separate loading state for image
            addLogEntry({type: 'image_prompt', content: `Image for stage ${currentStageNum+1} story: ${nextStorySegment.substring(0,100)}...`});
            const imageUrl = await geminiService.generateImageFromPrompt(nextStorySegment, adventure.title, adventure.themePrompt);
            (storyEntryContent as AdventureLogEntry).imageUrl = imageUrl || undefined;
            if(imageUrl) addLogEntry({type: 'image_url', content: imageUrl});
        }
        setStoryLog(prev => [...prev, { ...storyEntryContent, timestamp: Date.now() } as AdventureLogEntry]);
        setIsLoading(false); // Reset main loading after story (and possibly image)

        setUserAnswer('');
        setSelectedOptionId(null);
        setCurrentProblem(null); // Clear current problem

        if (isFinalStage) {
          setAdventureComplete(true);
          adventureEndedRef.current = true;
          addLogEntry({type: 'system_message', content: `Adventure "${adventure.title}" completed!`});
          setShowEndAdventureModal(true);
          // gameCtx?.endMathAdventure(true); // Moved to modal close
        } else {
          setCurrentStageNum(prev => prev + 1);
        }
      } else {
        // Incorrect answer, feedback already logged. Allow retry.
        setIsLoading(false);
      }
    } else {
      addLogEntry({type: 'system_message', content: "Error evaluating answer. Please try again."});
      setIsLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (!currentProblem || !gameCtx) return;
    if (gameCtx.gameState.totalTokens < TOKENS_FOR_HINT) {
      addLogEntry({type: 'feedback', content: `You need ${TOKENS_FOR_HINT} Star Tokens for a hint.`, isCorrect: false});
      return;
    }
    setIsLoading('hint');
    gameCtx.spendTokens(TOKENS_FOR_HINT);
    const hintText = await geminiService.getMathAdventureHint(
        currentProblem.problemText, 
        storyLog.filter(e => e.type === 'story').pop()?.content || '',
        currentProblem.problemType,
        currentProblem.options
    );
    addLogEntry({type: 'feedback', content: `${npcName} (Hint): ${hintText}`});
    setIsLoading(false);
  };
  
  const handleEndAdventureConfirmed = () => {
    setShowEndAdventureModal(false);
    gameCtx?.endMathAdventure(adventureComplete); // Pass completion status
    // Navigation back to hub will be handled by PlanetScreen detecting no active adventure
  };


  return (
    <div className={`flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto p-4 md:p-6 rounded-lg shadow-2xl bg-[var(--card-bg)] border border-[var(--card-border)]`}>
      <h2 className="text-2xl md:text-3xl font-bold mb-1 text-center text-[var(--text-primary)]">{adventure.title}</h2>
      <p className="text-sm text-slate-400 text-center mb-4">Stage {Math.min(currentStageNum, adventure.estimatedStages)} / {adventure.estimatedStages} - Mode: {mode === 'text_and_image' ? 'Illustrated Epic' : 'Text-Only Saga'}</p>
      
      {/* Story Log and Image Display */}
      <AdventureLog storyLog={storyLog} isLoading={isLoading} mode={mode} npcName={npcName} />

      {/* Interaction Area */}
      {!adventureComplete && currentProblem && !currentOverallLoading && (
        <div className="mt-auto bg-[var(--card-bg)] p-4 rounded-lg shadow-md">
          <div className="mb-3">
            {currentProblem.problemType === 'text_input' ? (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={currentProblem.answerFormatDescription || "Your answer here..."}
                className="w-full p-3 rounded-md bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] focus:ring-[var(--accent-purple)] focus:border-[var(--accent-purple)]"
                disabled={currentOverallLoading}
              />
            ) : ( // Multiple Choice
              <div className="space-y-2">
                {currentProblem.options?.map(option => (
                  <Button
                    key={option.id}
                    onClick={() => setSelectedOptionId(option.id)}
                    variant={selectedOptionId === option.id ? 'primary' : 'secondary'}
                    className={`w-full justify-start text-left ${selectedOptionId === option.id ? '!bg-[var(--accent-purple)] ring-2 ring-[var(--accent-purple-light)]' : '!bg-[var(--button-secondary-bg)] hover:!bg-[var(--button-secondary-hover-bg)]'}`}
                    disabled={currentOverallLoading}
                  >
                    <span className="font-bold mr-2">{option.id}.</span> {option.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAnswerSubmit} isLoading={typeof isLoading === 'string' && isLoading === 'evaluation'} disabled={currentOverallLoading || ((currentProblem.problemType === 'text_input' && !userAnswer.trim()) || (currentProblem.problemType === 'multiple_choice' && !selectedOptionId))} className="flex-1 !bg-[var(--button-success-bg)] hover:!bg-[var(--button-success-hover-bg)]">
              Submit Answer <Icon name="send" className="ml-2"/>
            </Button>
            <Button onClick={handleGetHint} variant="ghost" isLoading={typeof isLoading === 'string' && isLoading === 'hint'} disabled={currentOverallLoading} className="flex-1 !border-[var(--accent-purple)] hover:!bg-[var(--accent-purple-transparent)]">
              Get Hint ({TOKENS_FOR_HINT} Tokens) <Icon name="hint" className="ml-2"/>
            </Button>
          </div>
        </div>
      )}
      
      {currentOverallLoading && !currentProblem && isLoading !== 'image' && 
        <div className="flex-grow flex flex-col items-center justify-center">
          <LoadingSpinner message={`Thầy Euclid is preparing Stage ${currentStageNum || 1}...`} />
        </div>
      }

      {adventureComplete && (
         <div className="text-center p-4">
            <p className="text-2xl text-[var(--text-success)] font-semibold">Adventure Complete!</p>
            <Button onClick={() => setShowEndAdventureModal(true)} className="mt-4 !bg-[var(--accent-purple)] hover:!bg-[var(--accent-purple-dark)]">Return to Archives</Button>
        </div>
      )}

      {/* Button to end adventure mid-progress */}
      {!adventureComplete && ( 
        <div className="mt-auto flex justify-center">
           <Button onClick={() => setShowEndAdventureModal(true)} variant="secondary" className="!border-red-500 text-red-500 hover:!bg-red-500/10">End Adventure</Button>
        </div>
      )}

      <Modal isOpen={showEndAdventureModal} onClose={handleEndAdventureConfirmed} title={adventureComplete ? "Adventure Concluded!" : "Leave Adventure?"}>
        <p className="text-[var(--text-secondary)] mb-4">
          {adventureComplete 
            ? `Congratulations, Star Explorer! You have successfully navigated "${adventure.title}". Thầy Euclid is most impressed!`
            : "Are you sure you wish to abandon this adventure? Your current progress on this adventure will be lost."
          }
        </p>
        <Button onClick={handleEndAdventureConfirmed} className="w-full !bg-[var(--accent-purple)] hover:!bg-[var(--accent-purple-dark)]">
          {adventureComplete ? "Claim Rewards & Exit" : "Confirm Exit"}
        </Button>
      </Modal>

    </div>
  );
};

export default MathAdventureScreen;
