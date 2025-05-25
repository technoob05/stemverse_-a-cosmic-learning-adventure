import React, { useState, useContext, useEffect } from 'react';
import { QuestComponentProps, EcoWaterCycleEvaluationResult, DynamicEcoScenario } from '../../../types';
import { GameContext } from '../../../gameContext';
import * as geminiService from '../../../services/geminiService';
import { Button, LoadingSpinner } from '../../SharedUI';
import { TOKENS_FOR_HINT, TOKENS_PER_ECO_QUEST_COMPLETION } from '../../../constants';

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className, style }) => {
  const iconMap: { [key: string]: string } = {
    water: '💧', idea: '💡', send: '🛰️', recycle: '♻️', mars: '🪐', check: '✔️', cross: '❌', lightbulb: '💡',
    strength: '💪', weakness: '⚠️', suggestion: '✍️', score: '📊'
  };
  return <span className={className} role="img" aria-label={name} style={style}>{iconMap[name] || '❓'}</span>;
};

const EcoWaterCycleQuestUI: React.FC<QuestComponentProps> = ({ quest, onComplete, isLoadingGemini }) => {
  const [designSections, setDesignSections] = useState({
      source: '',
      purification: '',
      distribution: '',
      // Add other sections like energy, recycling, sustainability later if needed
  });
  const [scenario, setScenario] = useState<DynamicEcoScenario | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EcoWaterCycleEvaluationResult | null>(null);
  const [isLoadingScenario, setIsLoadingScenario] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gameCtx = useContext(GameContext);

  useEffect(() => {
      const fetchScenario = async () => {
          setIsLoadingScenario(true);
          const ecoTheme = "Martian Ecosystem and Water Cycle";
          const generatedScenario = await geminiService.generateDynamicEcoScenario(ecoTheme);
          setScenario(generatedScenario);
          setIsLoadingScenario(false);
      };
      fetchScenario();
  }, [quest.id]);

  const handleSubmitDesign = async () => {
    const allSectionsFilled = Object.values(designSections).every(section => section.trim().length > 0);
    if (!scenario || designSections.source.trim().length === 0) {
      setEvaluationResult({ 
        evaluation: "Please provide a solution in the textarea.", 
        suggestions: [],
        score: 0,
        strengths: [],
        weaknesses: ["No solution provided."]
      });
      return;
    }
    setIsSubmitting(true);
    setEvaluationResult(null);
    
    const result = await geminiService.evaluateEcoWaterCycleDesign(scenario, designSections.source);
    setEvaluationResult(result);

    if (result && result.score >= 60) {
      onComplete({ design: designSections, score: result.score, tokensAwarded: TOKENS_PER_ECO_QUEST_COMPLETION });
    }
    setIsSubmitting(false);
  };
  
  const handleGetHint = async () => {
    if (!gameCtx) return;
    if (gameCtx.gameState.totalTokens < TOKENS_FOR_HINT) {
        setEvaluationResult(prev => ({
            ...(prev || { evaluation: "", suggestions: [], score: 0, strengths:[], weaknesses:[] }),
            evaluation: (prev?.evaluation || "") + `\n\nGaia: You need ${TOKENS_FOR_HINT} Star Tokens for a hint. Explore more or complete other tasks to earn them!`,
        }));
        return;
    }
    setIsSubmitting(true);
    gameCtx.spendTokens(TOKENS_FOR_HINT);
    const hintPrompt = `As Giáo sư Gaia, provide a concise hint related to the following ecological challenge:\nScenario: ${scenario?.scenarioDescription || ''}\nChallenge: ${scenario?.challengeQuestion || ''}\n\nProvide a hint focusing on one or two key ecological principles or practical considerations relevant to solving this specific challenge. Avoid giving direct answers.`;
    const hintText = await geminiService.generateText(hintPrompt, "You are Giáo sư Gaia.");
    
    setEvaluationResult(prev => ({
        ...(prev || { evaluation: "", suggestions: [], score: 0, strengths:[], weaknesses:[] }),
        evaluation: (prev?.evaluation || "") + `\n\nGaia's Hint: ${hintText.text}`,
    }));
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-6 my-4 bg-[var(--card-bg)] bg-opacity-80 rounded-xl shadow-2xl border border-[var(--planet-eco-color)]">
      <div className="flex items-center mb-4">
        <Icon name="water" className="text-4xl mr-3" style={{color: 'var(--planet-eco-color)'}} />
        <div>
            <h4 className="text-xl font-bold" style={{color: 'var(--planet-eco-color)'}}>Ecological Challenge: {quest.title}</h4>
            <p className="text-sm text-[var(--text-secondary)]">{quest.description}</p>
        </div>
      </div>
      
      {isLoadingScenario ? (
           <LoadingSpinner message="Giáo sư Gaia is crafting a new challenge..." />
      ) : scenario ? (
          <div className="space-y-4 mb-4">
              <div className="p-3 bg-[var(--bg-secondary)] rounded-md border border-[var(--card-border)]">
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Scenario:</p>
                  <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{scenario.scenarioDescription}</p>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-md border border-[var(--card-border)]">
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Challenge:</p>
                  <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{scenario.challengeQuestion}</p>
              </div>
              <div>
                  <label htmlFor="solution" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Your Proposed Solution:</label>
                  <textarea
                      id="solution"
                      value={designSections.source}
                      onChange={(e) => setDesignSections({ ...designSections, source: e.target.value })}
                      placeholder="Describe your solution here..."
                      className="w-full p-2 rounded-md bg-[var(--input-bg)] text-[var(--input-text)] font-sans text-sm border border-[var(--input-border)] focus:ring-2 focus:ring-[var(--planet-eco-color)] focus:border-[var(--planet-eco-color)] h-32"
                      disabled={isLoadingGemini || isSubmitting}
                  />
              </div>
          </div>
      ) : (
          <div className="text-center text-[var(--text-danger)]"><p>Failed to load ecological scenario. Please try again later.</p></div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button 
            onClick={handleSubmitDesign} 
            isLoading={isLoadingGemini || isSubmitting} 
            disabled={isLoadingGemini || isSubmitting || isLoadingScenario || !scenario || designSections.source.trim().length === 0}
            className="flex-1 !text-white"
            style={{backgroundColor: 'var(--planet-eco-color)'}}
        >
          <Icon name="send" className="mr-2" /> Submit Design to Giáo sư Gaia
        </Button>
        <Button 
            onClick={handleGetHint}
            variant="ghost" 
            isLoading={isLoadingGemini || isSubmitting} 
            disabled={isLoadingGemini || isSubmitting}
            className="flex-1 hover:text-[var(--bg-primary)]"
            style={{borderColor: 'var(--planet-eco-color)', color: 'var(--planet-eco-color)'}}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--planet-eco-color)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Icon name="lightbulb" className="mr-2" /> Get Hint ({TOKENS_FOR_HINT} Tokens)
        </Button>
      </div>

      {(isLoadingGemini || isSubmitting) && !evaluationResult && <LoadingSpinner message="Giáo sư Gaia is analyzing your proposal..." />}
      
      {evaluationResult && (
        <div className="mt-6 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--card-border)]">
          <h5 className="text-xl font-semibold mb-3 flex items-center" style={{color: 'var(--planet-eco-color)'}}><Icon name="mars" className="mr-2 text-2xl"/>Gaia's Analysis:</h5>
          
          {evaluationResult.score > 0 && (
            <div className="mb-3 p-3 bg-[var(--card-bg)] rounded-md">
                <p className="text-lg font-bold flex items-center text-[var(--text-primary)]">
                    <Icon name="score" className="mr-2 text-yellow-400 text-xl"/> Overall Score: 
                    <span className={`ml-2 ${evaluationResult.score >= 80 ? 'text-[var(--text-success)]' : evaluationResult.score >= 60 ? 'text-[var(--text-warning)]' : 'text-[var(--text-danger)]'}`}>
                        {evaluationResult.score}/100
                    </span>
                </p>
            </div>
          )}

          <div className="mb-3">
            <p className="font-semibold text-[var(--text-secondary)] mb-1 flex items-center" style={{color: 'var(--planet-eco-color)'}}><Icon name="recycle" className="mr-2 text-[var(--planet-eco-color)]"/>Evaluation:</p>
            <p className="text-[var(--text-primary)] text-sm whitespace-pre-wrap leading-relaxed">{evaluationResult.evaluation}</p>
          </div>

          {evaluationResult.strengths && evaluationResult.strengths.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-[var(--text-success)] mb-1 flex items-center"><Icon name="strength" className="mr-2 text-green-500"/>Strengths:</p>
              <ul className="list-none pl-0 text-sm text-[var(--text-primary)] space-y-1">
                {evaluationResult.strengths.map((s, i) => <li key={`str-${i}`} className="bg-green-500/20 p-2 rounded-md flex items-start"><Icon name="check" className="text-green-400 mr-2 mt-1 shrink-0"/>{s}</li>)}
              </ul>
            </div>
          )}

          {evaluationResult.weaknesses && evaluationResult.weaknesses.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-[var(--text-warning)] mb-1 flex items-center"><Icon name="weakness" className="mr-2 text-yellow-500"/>Areas for Improvement:</p>
              <ul className="list-none pl-0 text-sm text-[var(--text-primary)] space-y-1">
                {evaluationResult.weaknesses.map((w, i) => <li key={`weak-${i}`} className="bg-yellow-500/20 p-2 rounded-md flex items-start"><Icon name="lightbulb" className="text-yellow-400 mr-2 mt-1 shrink-0"/>{w}</li>)}
              </ul>
            </div>
          )}

          {evaluationResult.suggestions && evaluationResult.suggestions.length > 0 && (
            <div>
              <p className="font-semibold text-[var(--text-info)] mb-1 flex items-center"><Icon name="suggestion" className="mr-2 text-sky-400"/>Suggestions:</p>
              <ul className="list-none pl-0 text-sm text-[var(--text-primary)] space-y-1">
                {evaluationResult.suggestions.map((s, i) => <li key={`sug-${i}`} className="bg-sky-500/20 p-2 rounded-md flex items-start"><Icon name="idea" className="text-sky-300 mr-2 mt-1 shrink-0"/>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EcoWaterCycleQuestUI;
