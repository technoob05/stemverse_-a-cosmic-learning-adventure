import React, { useState, useContext, useEffect, useCallback } from 'react';
import { GameContext } from '../gameContext';
import { Planet, PlanetId, QuestComponentProps, ChatMessage as ChatMessageType, GeminiEvaluationResult } from '../types';
import { PLANETS_CONFIG, TOKENS_FOR_HINT, TOKENS_PER_QUEST_STAGE, TOKENS_PER_ECO_QUEST_COMPLETION } from '../constants';
import { Button, Modal, LoadingSpinner, ChatMessage, ProgressBar, SpeechInputButton } from './SharedUI';
import * as geminiService from '../services/geminiService'; 
import MathAdventureHub from './planets/math/MathAdventureHub';
import MathAdventureScreen from './planets/math/MathAdventureScreen';
import EcoWaterCycleQuestUI from './planets/eco/EcoWaterCycleQuestUI';

// Icon component (redefined here for PlanetScreens or can be moved to SharedUI if truly shared globally)
const Icon: React.FC<{ name: string, className?: string, isEmoji?: boolean, style?: React.CSSProperties }> = ({ name, className, isEmoji = true, style }) => {
  const iconMap: { [key: string]: string } = {
    math: '🌌', eco: '🌳', code: '💡', lock: '🔒', check: '✔️', star: '⭐', back: '↩️', lightbulb: '💡',
    robot: '🤖', settings: '⚙️', book: '📚', image:'🖼️', text:'📜', play: '▶️',
    water: '💧', hub: '🛰️', user: '🧑‍🚀', badge: '🎖️',
    // Planet specific micro-icons (optional)
    fractal: '🌀', chip: '💻', leaf: '🌿',
  };
  if (isEmoji) {
    return <span className={className} role="img" aria-label={name} style={style}>{iconMap[name] || '❓'}</span>;
  }
  return <span className={className} style={style}>{name}</span>;
};

const CodeChallengeQuestUI: React.FC<QuestComponentProps> = ({ quest, onComplete, isLoadingGemini }) => {
  const [code, setCode] = useState('');
  const language = 'javascript'; // Hardcode language as setter is unused
  const [analysis, setAnalysis] = useState<GeminiEvaluationResult | null>(null);
  const [hint, setHint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const gameCtx = useContext(GameContext);

  const exampleProblem = quest.id === 'cq1' 
    ? `// Fix the syntax error in this ${language} code:\nfunction greet(name) {\n console.log("Hello, " + name;\n}`
    : `// Write a ${language} function called 'calculateArea' that takes radius and returns the area of a circle (Math.PI * r * r).\n`;
  
  useEffect(() => {
    if (quest.id === 'cq1') setCode(exampleProblem);
    else setCode(''); 
    setAnalysis(null);
    setHint('');
  }, [quest.id, exampleProblem, language]);

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setAnalysis(null); 
    const result = await geminiService.analyzeCodeSnippet(language, code);
    setAnalysis(result); 
    if (result && result.analysis && !result.analysis.toLowerCase().includes("error") && !result.analysis.toLowerCase().includes("incorrect") && !result.analysis.toLowerCase().includes("flaw")) {
      if (quest.id === 'cq1' && code.includes(')')) { 
         onComplete({ code });
      } else if (quest.id !== 'cq1' && code.length > 20) { 
         onComplete({ code });
      }
    }
    setIsSubmitting(false);
  };

  const handleGetHint = async () => {
    if (!gameCtx) return;
    if (gameCtx.gameState.totalTokens < TOKENS_FOR_HINT) {
      setHint(`You need ${TOKENS_FOR_HINT} Star Tokens for a hint.`);
      return;
    }
    setIsGettingHint(true);
    setHint(''); 
    gameCtx.spendTokens(TOKENS_FOR_HINT);
    const hintText = await geminiService.getCodeDebuggingHint(language, code, "I'm stuck / My code isn't working as expected.");
    setHint(hintText);
    setIsGettingHint(false);
  };

  return (
    <div className="p-4 my-4 bg-[var(--card-bg)] rounded-lg shadow-lg border border-[var(--card-border)]">
      <h4 className="text-lg font-semibold text-[var(--accent-sky)] mb-2">{quest.title}</h4>
      <p className="text-[var(--text-secondary)] mb-3">{quest.description}</p>
      {(quest.id === 'cq1' || quest.id === 'cq2') && <p className="text-sm text-[var(--text-muted)] mb-2 bg-[var(--bg-tertiary)] p-2 rounded">Challenge: {exampleProblem.split('\n').slice(quest.id === 'cq1' ? 0 : 1).join('\n').replace('// ','')}</p>}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Enter your ${language} code here...`}
        className="w-full h-48 p-2 rounded-md bg-[var(--input-bg)] text-[var(--input-text)] font-mono text-sm border border-[var(--input-border)] focus:ring-[var(--input-focus-ring)] focus:border-[var(--input-focus-ring)] mb-3"
        disabled={isLoadingGemini || isSubmitting || isGettingHint}
      />
      <div className="flex space-x-2 mb-3">
        <Button onClick={handleSubmitCode} isLoading={isLoadingGemini || isSubmitting} disabled={isLoadingGemini || isSubmitting || isGettingHint} className="!bg-[var(--planet-code-color)] hover:opacity-80">Analyze & Submit Code</Button>
        <Button onClick={handleGetHint} variant="secondary" isLoading={isLoadingGemini || isGettingHint} disabled={isLoadingGemini || isSubmitting || isGettingHint}>Get Hint ({TOKENS_FOR_HINT} Tokens)</Button>
      </div>
      {(isLoadingGemini || isSubmitting || isGettingHint) && analysis === null && hint === '' && <LoadingSpinner message="Code Master is working..." />}
      {analysis && (
        <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded">
          <h5 className="font-semibold text-lg text-[var(--accent-sky)]">Code Master's Analysis:</h5>
          <p className="text-[var(--text-secondary)] mb-1 whitespace-pre-wrap">{analysis.analysis || analysis.evaluation}</p>
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <>
              <p className="font-semibold text-[var(--text-muted)] mt-2">Suggestions:</p>
              <ul className="list-disc list-inside text-[var(--text-muted)] pl-2">
                {analysis.suggestions.map((s, i) => <li key={i} className="whitespace-pre-wrap">{s}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
       {hint && <p className="text-sm text-[var(--accent-purple)] italic p-2 bg-[var(--bg-tertiary)] rounded-md mt-2 whitespace-pre-wrap">{hint}</p>}
    </div>
  );
};

const assignQuestComponent = (planetId: PlanetId, questId: string): React.FC<QuestComponentProps> | null => {
  if (planetId === PlanetId.MATH) return null; 
  if (planetId === PlanetId.ECO) {
    if (questId === 'eq1_water_cycle') return EcoWaterCycleQuestUI;
    const ecoPlanetConfig = PLANETS_CONFIG.find(p => p.id === PlanetId.ECO);
    const questConfig = ecoPlanetConfig?.quests.find(q => q.id === questId);
    return questConfig?.uiComponent || null; 
  }
  if (planetId === PlanetId.CODE) {
     const codePlanetConfig = PLANETS_CONFIG.find(p => p.id === PlanetId.CODE);
     const questConfig = codePlanetConfig?.quests.find(q => q.id === questId);
     return questConfig?.uiComponent || CodeChallengeQuestUI; 
  }
  
  return (({ quest, onComplete }) => (
    <div className="p-4 my-4 bg-[var(--card-bg)] rounded-lg">
      <h4 className="text-lg font-semibold text-[var(--text-accent)]">{quest.title}</h4>
      <p className="text-sm text-[var(--text-secondary)] mb-2">{quest.description}</p>
      <Button 
        onClick={() => onComplete({ message: `Completed ${quest.title}` })}
        variant="success"
      >
        Simulate Complete Quest (Default)
      </Button>
    </div>
  ));
};

export const PlanetScreen: React.FC = () => {
  const gameCtx = useContext(GameContext);
  const [isLoadingGeminiGlobal, setIsLoadingGeminiGlobal] = useState(false); 
  const [currentNpcMessage, setCurrentNpcMessage] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [userChatMessage, setUserChatMessage] = useState(''); // State for chat input
  const [showConfirmLeaveModal, setShowConfirmLeaveModal] = useState(false); 

  const planetId = gameCtx?.gameState.currentPlanetId;
  const planet = PLANETS_CONFIG.find(p => p.id === planetId);
  const mathAdventureState = gameCtx?.gameState.progress[PlanetId.MATH]?.mathAdventure;

  useEffect(() => {
    if (planet) {
      const welcomeMsg = `Welcome to ${planet.name}, Star Explorer! I am ${planet.npcName}. ${planet.description} I'm here to guide you.`;
      setCurrentNpcMessage(welcomeMsg);
      setChatMessages([{id: Date.now().toString(), sender: 'ai', text: `Welcome to ${planet.name}! I am ${planet.npcName}. ${planet.description.split('.')[0]}. What knowledge do you seek?`, timestamp: Date.now()}]);
      
      if (planet.id !== PlanetId.MATH || !mathAdventureState?.selectedAdventureId) {
        setShowWelcomeModal(true); 
      } else {
        setShowWelcomeModal(false);
      }
    }
  }, [planet, mathAdventureState?.selectedAdventureId]);

  const getGeminiResponseForChat = useCallback(async (prompt: string, systemInstruction?: string): Promise<string> => {
    setIsLoadingGeminiGlobal(true);
    const response = await geminiService.generateText(prompt, systemInstruction);
    setIsLoadingGeminiGlobal(false);
    if (response.error) {
      return `Error: ${response.error}`;
    }
    return response.text;
  }, []);
  
  const handleQuestCompletion = (completedPlanetId: PlanetId, questId: string, data?: any) => {
    if (!gameCtx || !planet || completedPlanetId === PlanetId.MATH) return; 
    
    let tokensToAward = TOKENS_PER_QUEST_STAGE; 
    if (completedPlanetId === PlanetId.ECO && questId === 'eq1_water_cycle') {
        tokensToAward = data?.tokensAwarded || TOKENS_PER_ECO_QUEST_COMPLETION; 
    }

    gameCtx.completeQuest(completedPlanetId, questId, tokensToAward);
    
    const completedQuest = planet.quests.find(q => q.id === questId);
    const npcCongratulationPrompt = `The Star Explorer just completed the task: "${completedQuest?.title || questId}" on ${planet.name}. Congratulate them warmly. Your persona is ${planet.npcName}.`;
    
    getGeminiResponseForChat(npcCongratulationPrompt, `You are ${planet.npcName}.`).then(msg => {
      setChatMessages(prev => [...prev, {id: Date.now().toString(), sender: 'ai', text: msg, timestamp: Date.now()}]);
    });
  };
  
  const handleSpeechInput = async (text: string) => {
     if (!planet) return;
     setChatMessages(prev => [...prev, {id: Date.now().toString(), sender: 'user', text: text, timestamp: Date.now()}]);
     setIsLoadingGeminiGlobal(true);
     
     let systemInstruction = `You are ${planet.npcName} on ${planet.name}. You are wise and helpful.`;
     let userPrompt = `The user, Star Explorer, said: "${text}". Respond conversationally.`;

     if (planet.id === PlanetId.MATH && mathAdventureState?.selectedAdventureId) {
        systemInstruction = PLANETS_CONFIG.find(p => p.id === PlanetId.MATH)?.adventureConfig?.adventures.find(adv => adv.id === mathAdventureState.selectedAdventureId)?.themePrompt || systemInstruction;
        userPrompt = `The user, Star Explorer, is on the adventure "${PLANETS_CONFIG.find(p => p.id === PlanetId.MATH)?.adventureConfig?.adventures.find(adv => adv.id === mathAdventureState.selectedAdventureId)?.title}" and said: "${text}". Respond as Thầy Euclid, offering general guidance or encouragement related to their adventure or math in general. Do not give specific answers to problems unless explicitly asked for a hint (which is handled elsewhere).`;
     } else if (planet.id === PlanetId.MATH) {
        userPrompt = `The user, Star Explorer, is on Mathos and said: "${text}". Respond as Thầy Euclid, offering general mathematical wisdom or guidance.`;
     }

     const responseText = await geminiService.generateText(userPrompt, systemInstruction);
     setIsLoadingGeminiGlobal(false);
     setChatMessages(prev => [...prev, {id: (Date.now()+1).toString(), sender: 'ai', text: responseText.text, timestamp: Date.now()+1}]);
  };

  const handleChatInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setUserChatMessage(event.target.value);
  };

  const handleSendChatMessage = async () => {
      if (!userChatMessage.trim() || !planet) return; // Don't send empty messages

      const newUserMessage: ChatMessageType = { 
          id: Date.now().toString(), 
          sender: 'user', 
          text: userChatMessage,
          timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, newUserMessage]);
      setUserChatMessage(''); // Clear input after sending

      setIsLoadingGeminiGlobal(true);
      
      let systemInstruction = `You are ${planet.npcName} on ${planet.name}. You are wise and helpful.`;
      let userPrompt = `The user, Star Explorer, said: "${newUserMessage.text}". Respond conversationally.`;

      // Potentially adjust prompt/system instruction based on planet/adventure context
       if (planet.id === PlanetId.MATH && mathAdventureState?.selectedAdventureId) {
         systemInstruction = PLANETS_CONFIG.find(p => p.id === PlanetId.MATH)?.adventureConfig?.adventures.find(adv => adv.id === mathAdventureState.selectedAdventureId)?.themePrompt || systemInstruction;
         userPrompt = `The user, Star Explorer, is on the adventure "${PLANETS_CONFIG.find(p => p.id === PlanetId.MATH)?.adventureConfig?.adventures.find(adv => adv.id === mathAdventureState.selectedAdventureId)?.title}" and said: "${newUserMessage.text}". Respond as Thầy Euclid, offering general guidance or encouragement related to their adventure or math in general. Do not give specific answers to problems unless explicitly asked for a hint (which is handled elsewhere in the adventure screen).`;
      } else if (planet.id === PlanetId.MATH) {
         userPrompt = `The user, Star Explorer, is on Mathos and said: "${newUserMessage.text}". Respond as Thầy Euclid, offering general mathematical wisdom or guidance.`;
      }
      // Add similar logic for other planets if needed

      const response = await geminiService.generateText(userPrompt, systemInstruction);
      setIsLoadingGeminiGlobal(false);

      const aiResponse: ChatMessageType = {
          id: (Date.now()+1).toString(), // Ensure unique ID
          sender: 'ai',
          text: response.text,
          timestamp: Date.now() + 1
      };
      setChatMessages(prev => [...prev, aiResponse]);
  };

  if (!gameCtx || !planet) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner message="Loading planet data..." /></div>;
  }
  
  const { gameState, setActivePlanet, getPlanetProgress, startMathAdventure, endMathAdventure } = gameCtx;
  const planetProgress = getPlanetProgress(planet.id);
  const completedQuestsOnThisPlanet = gameState.progress[planet.id]?.completedQuestIds || [];

  const confirmLeaveAdventure = () => {
    endMathAdventure(false); 
    setActivePlanet(null);
    setShowConfirmLeaveModal(false);
  };

  const renderPlanetContent = () => {
    if (planet.id === PlanetId.MATH) {
      if (mathAdventureState?.selectedAdventureId && mathAdventureState.currentAdventureMode) {
        const selectedAdventure = planet.adventureConfig?.adventures.find(adv => adv.id === mathAdventureState.selectedAdventureId);
        if (!selectedAdventure) {
            console.error("Selected adventure not found in config!");
            endMathAdventure(false); 
            return <MathAdventureHub adventures={planet.adventureConfig?.adventures || []} onStartAdventure={startMathAdventure} />;
        }
        return <MathAdventureScreen 
                  adventure={selectedAdventure} 
                  mode={mathAdventureState.currentAdventureMode}
                  npcName={planet.npcName}
                />;
      } else {
        return <MathAdventureHub adventures={planet.adventureConfig?.adventures || []} onStartAdventure={startMathAdventure} />;
      }
    }

    return (
      <div className="md:col-span-2 space-y-6"> 
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Challenges on {planet.name.split(' - ')[0]}</h2>
        {planet.quests.map(currentQuest => {
          const QuestUI = assignQuestComponent(planet.id, currentQuest.id);
          if (!QuestUI) return <p key={currentQuest.id} className="text-[var(--text-danger)]">Error: UI not found for quest {currentQuest.title}</p>;
          
          const isCompleted = completedQuestsOnThisPlanet.includes(currentQuest.id);
          return (
            <div key={currentQuest.id} className={`rounded-lg ${isCompleted ? 'bg-green-800/30 border-2 border-[var(--text-success)]' : 'bg-[var(--card-bg)] shadow-xl border border-[var(--card-border)]'}`}>
              {isCompleted ? (
                <div className="p-4 text-center">
                   <Icon name="check" className="text-3xl text-[var(--text-success)] mr-2 inline-block" />
                   <span className="text-lg text-[var(--text-secondary)] font-semibold">{currentQuest.title} - Completed!</span>
                </div>
              ) : (
                <QuestUI
                  quest={currentQuest}
                  onComplete={(data) => handleQuestCompletion(planet.id, currentQuest.id, data)}
                  getGeminiResponse={getGeminiResponseForChat} 
                  isLoadingGemini={isLoadingGeminiGlobal} 
                />
              )}
            </div>
          );
        })}
        {planet.quests.length === 0 && (
          <p className="text-[var(--text-muted)] text-center py-8">No specific challenges listed for this planet. Explore and interact with {planet.npcName}!</p>
        )}
      </div>
    );
  };

  const planetAccentColorVar = 
    planet.id === PlanetId.MATH ? 'var(--planet-math-color)' :
    planet.id === PlanetId.ECO ? 'var(--planet-eco-color)' :
    'var(--planet-code-color)';

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-[var(--bg-primary)] bg-opacity-60 flex flex-col"> {/* Adjusted min-height for navbar */}
      
      <Modal 
          isOpen={showWelcomeModal && !!currentNpcMessage && (!mathAdventureState || !mathAdventureState.selectedAdventureId)} 
          onClose={() => setShowWelcomeModal(false)} 
          title={`Welcome to ${planet.name.split(' - ')[0]}!`}
        >
          <div className="flex items-center mb-4">
            <img src={planet.npcImage} alt={planet.npcName} className="w-20 h-20 rounded-full mr-4 border-2 border-[var(--accent-cyan)] object-cover" />
            <div>
              <p className="text-lg font-semibold text-[var(--text-primary)]">Greetings from {planet.npcName}!</p>
              <p className="text-[var(--text-secondary)]">{currentNpcMessage}</p>
            </div>
          </div>
          <Button onClick={() => setShowWelcomeModal(false)} className="w-full !bg-[var(--accent-cyan)] hover:opacity-80">Let's Begin!</Button>
      </Modal>

      <Modal 
        isOpen={showConfirmLeaveModal}
        onClose={() => setShowConfirmLeaveModal(false)}
        title="Confirm Departure"
      >
        <p className="text-[var(--text-secondary)] mb-6">
          Are you sure you want to leave this Math Adventure? Your current progress in this specific adventure run will not be saved.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setShowConfirmLeaveModal(false)}>Stay on Mathos</Button>
          <Button variant="danger" onClick={confirmLeaveAdventure}>Leave Adventure</Button>
        </div>
      </Modal>

      <header className="mb-6 md:mb-8">
        {/* Back to Hub button is now in Navbar, this can be removed or kept as secondary option */}
        {/* <Button 
          onClick={handleBackToHubClick} 
          variant="ghost" 
          className="mb-4 !border-[var(--button-ghost-border)] hover:!bg-[var(--button-ghost-hover-bg)]"
        >
          <Icon name="back" className="mr-2" /> Back to Space Hub
        </Button> */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 bg-[var(--card-bg)] bg-opacity-80 rounded-lg shadow-xl backdrop-blur-sm border border-[var(--card-border)]"> 
          <Icon name={planet.id as string} className="text-5xl sm:text-6xl" style={{color: planetAccentColorVar }} />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">{planet.name.split(' - ')[0]}</h1>
             <p className="text-[var(--text-secondary)] mt-1 text-sm sm:text-base">{planet.description.split('.')[0]}.</p>
          </div>
        </div>
        <div className="mt-4">
           <ProgressBar progress={planetProgress} label={`${planet.name.split(' - ')[0]} Mastery`} color={planetAccentColorVar} />
        </div>
      </header>

      {planet.id === PlanetId.MATH ? (
        renderPlanetContent() 
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
            {renderPlanetContent()} 
            <aside className="md:col-span-1 p-4 bg-[var(--card-bg)] bg-opacity-80 rounded-lg shadow-xl h-fit sticky top-[calc(4rem+1rem)] backdrop-blur-sm border border-[var(--card-border)]"> {/* Adjusted top for sticky navbar */}
              <div className="flex items-center mb-4">
                <img src={planet.npcImage} alt={planet.npcName} className="w-16 h-16 rounded-full mr-3 border-2 object-cover" style={{borderColor: planetAccentColorVar}} />
                <div>
                  <h3 className="text-xl font-semibold" style={{color: planetAccentColorVar}}>{planet.npcName}</h3>
                  <p className="text-sm text-[var(--text-muted)]">Your AI Guide</p>
                </div>
              </div>
              <div className="h-64 overflow-y-auto mb-4 p-2 bg-[var(--bg-primary)] rounded scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--scrollbar-track)]">
                {chatMessages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                {isLoadingGeminiGlobal && chatMessages.length > 0 && chatMessages[chatMessages.length-1].sender === 'user' && 
                  <div className="flex justify-start my-2"><div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-bl-none"><LoadingSpinner size="sm" /></div></div>
                }
              </div>
              {/* New chat input area */}
              <div className="flex mt-auto space-x-2">
                  <input
                      type="text"
                      value={userChatMessage}
                      onChange={handleChatInputChange}
                      className="flex-grow p-2 rounded-md bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] focus:ring-[var(--accent-cyan)] focus:border-[var(--accent-cyan)]"
                      placeholder={`Chat with ${planet.npcName}...`}
                      disabled={isLoadingGeminiGlobal}
                  />
                  <Button 
                      onClick={handleSendChatMessage}
                      disabled={isLoadingGeminiGlobal || !userChatMessage.trim()}
                   >
                       Send
                   </Button>
              </div>
            </aside>
        </div>
      )}
    </div>
  );
};

export const SpaceHub: React.FC = () => {
  const gameCtx = useContext(GameContext);
  if (!gameCtx) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner message="Initializing Universe..." /></div>;

  const { gameState, startPlanet, getPlanetProgress } = gameCtx;

  const getPlanetThemeVars = (planetId: PlanetId): { textColor: string, borderColor: string, shadowColor: string, bgColor: string, iconTextColor: string, microIcon?: string } => {
    switch(planetId) {
      case PlanetId.MATH: return { textColor: 'var(--planet-math-color)', borderColor: 'var(--planet-math-color)', shadowColor: 'var(--planet-math-color)', bgColor: 'var(--planet-math-color)', iconTextColor: 'var(--planet-math-color)', microIcon: 'fractal' };
      case PlanetId.ECO: return { textColor: 'var(--planet-eco-color)', borderColor: 'var(--planet-eco-color)', shadowColor: 'var(--planet-eco-color)', bgColor: 'var(--planet-eco-color)', iconTextColor: 'var(--planet-eco-color)', microIcon: 'leaf' };
      case PlanetId.CODE: return { textColor: 'var(--planet-code-color)', borderColor: 'var(--planet-code-color)', shadowColor: 'var(--planet-code-color)', bgColor: 'var(--planet-code-color)', iconTextColor: 'var(--planet-code-color)', microIcon: 'chip' };
      default: return { textColor: 'var(--text-accent)', borderColor: 'var(--text-accent)', shadowColor: 'var(--text-accent)', bgColor: 'var(--text-accent)', iconTextColor: 'var(--text-accent)'};
    }
  };

  const PlanetCard: React.FC<{ planetConfig: Planet }> = ({ planetConfig }) => {
    const isUnlocked = gameState.unlockedPlanetIds.includes(planetConfig.id);
    const progress = getPlanetProgress(planetConfig.id);
    const themeVars = getPlanetThemeVars(planetConfig.id);

    const cardBaseStyle = `relative p-6 rounded-xl border transition-all duration-300 ease-in-out group flex flex-col min-h-[350px]`;
    const unlockedStyle = `bg-[var(--card-bg)] backdrop-blur-lg border-[var(--card-border)] hover:border-[${themeVars.borderColor}] hover:shadow-2xl hover:shadow-[${themeVars.shadowColor}]/30 hover:scale-[1.03] cursor-pointer`;
    const lockedStyle = `bg-[var(--card-bg)]/60 backdrop-blur-sm border-[var(--card-border)] opacity-60 cursor-not-allowed`;

    return (
      <div
        className={`${cardBaseStyle} ${isUnlocked ? unlockedStyle : lockedStyle}`}
        onClick={() => isUnlocked && startPlanet(planetConfig.id)}
        aria-disabled={!isUnlocked}
        role="button"
        tabIndex={isUnlocked ? 0 : -1}
      >
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-full bg-[var(--bg-tertiary)] group-hover:bg-[${themeVars.bgColor}]/20 transition-colors duration-300`}>
                <Icon name={planetConfig.id as string} className="text-4xl" style={{color: isUnlocked ? themeVars.iconTextColor : 'var(--text-muted)' }} />
            </div>
            {themeVars.microIcon && isUnlocked && (
                <Icon name={themeVars.microIcon} className="text-2xl opacity-30 group-hover:opacity-70 transition-opacity duration-300" style={{color: themeVars.iconTextColor}} />
            )}
            {!isUnlocked && (
              <div className="p-2 bg-[var(--bg-tertiary)] rounded-full">
                <Icon name="lock" className="text-xl text-[var(--text-muted)]" />
              </div>
            )}
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isUnlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'} group-hover:text-[${themeVars.textColor}] transition-colors duration-300`}>{planetConfig.name.split(' - ')[0]}</h2>
           <p className={`${isUnlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'} text-sm mb-5 h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--scrollbar-track)]`}>
            {planetConfig.description}
          </p>
        </div>

        <div className="mt-auto">
          {isUnlocked ? (
            <ProgressBar progress={progress} label="Mastery" color={themeVars.bgColor} size="md"/>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Complete other realms to unlock.</p>
          )}
          {isUnlocked && planetConfig.id === PlanetId.MATH && (
              <p className="text-xs mt-2" style={{color: themeVars.textColor}}>Embark on narrative adventures!</p>
          )}
           {isUnlocked && planetConfig.id === PlanetId.ECO && (
              <p className="text-xs mt-2" style={{color: themeVars.textColor}}>Heal the planet with your designs!</p>
          )}
           {isUnlocked && planetConfig.id === PlanetId.CODE && (
              <p className="text-xs mt-2" style={{color: themeVars.textColor}}>Debug the core logic!</p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 selection:bg-[var(--accent-purple)] selection:text-white"> {/* Adjusted min-height for navbar */}
       <div className="text-center mb-12 md:mb-16 pt-8 md:pt-12">
          {/* Title moved to Navbar, this section can be simplified or repurposed */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">
            Select Your Realm
          </h1>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Welcome, <Icon name="user" className="inline text-xl" style={{color: 'var(--accent-cyan)'}} /> <span className="font-semibold" style={{color: 'var(--accent-cyan)'}}>{gameState.userName}</span>! The cosmos awaits your genius.
          </p>
      </div>
      
        {gameState.masterBadgeEarned && (
          <div className="mb-10 md:mb-12 p-4 md:p-5 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 text-slate-900 rounded-xl shadow-2xl text-center max-w-md mx-auto animate-bounce"> {/* Changed animation */}
            <div className="flex items-center justify-center">
              <Icon name="badge" className="text-3xl md:text-4xl mr-3" />
              <span className="text-xl md:text-2xl font-bold">STEM Master Badge Unlocked!</span>
            </div>
            <p className="text-sm mt-1">You've conquered the STEMverse! True cosmic brilliance!</p>
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {PLANETS_CONFIG.map(planetConf => (
          <PlanetCard key={planetConf.id} planetConfig={planetConf} />
        ))}
      </div>
      
      <footer className="text-center mt-16 md:mt-20 text-[var(--text-muted)] text-xs">
          <p>&copy; {new Date().getFullYear()} STEMverse - A Cosmic Learning Adventure.</p>
          <p>Powered by React, Tailwind CSS, and the Gemini API.</p>
      </footer>
    </div>
  );
};
