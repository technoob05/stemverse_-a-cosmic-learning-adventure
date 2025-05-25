import React, { useState, useContext, useEffect } from 'react';
import { QuestComponentProps, DynamicCodeChallenge, GeminiEvaluationResult } from '../../../types';
import { GameContext } from '../../../gameContext';
import * as geminiService from '../../../services/geminiService';
import { Button, LoadingSpinner } from '../../SharedUI';
import { TOKENS_FOR_HINT, TOKENS_PER_CODE_QUEST_COMPLETION } from '../../../constants';

// Placeholder Icon component (replace with actual icons later)
const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className, style }) => {
    const iconMap: { [key: string]: string } = {
        code: '💻', send: '🛰️', check: '✔️', cross: '❌', idea: '💡', lightbulb: '💡', analysis: '🔬', suggestion: '✍️'
    };
    return <span className={className} role="img" aria-label={name} style={style}>{iconMap[name] || '❓'}</span>;
};

const DynamicCodeChallengeUI: React.FC<QuestComponentProps> = ({ quest, onComplete, isLoadingGemini }) => {
    const [challenge, setChallenge] = useState<DynamicCodeChallenge | null>(null);
    const [userCode, setUserCode] = useState<string>('');
    const [evaluationResult, setEvaluationResult] = useState<GeminiEvaluationResult | null>(null);
    const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const gameCtx = useContext(GameContext);

    useEffect(() => {
        const fetchChallenge = async () => {
            setIsLoadingChallenge(true);
            // For now, hardcode language, topic, difficulty - can make dynamic later
            const language = 'javascript'; 
            const topic = quest.description; // Use quest description as a hint for topic
            const difficulty = 'easy'; // Can make dynamic later

            const generatedChallenge = await geminiService.generateDynamicCodeChallenge(language, topic, difficulty);
            setChallenge(generatedChallenge);
            if (generatedChallenge?.initialCode) {
                setUserCode(generatedChallenge.initialCode);
            }
            setIsLoadingChallenge(false);
        };
        fetchChallenge();
    }, [quest.id, quest.description]); // Depend on quest.id and description

    const handleSubmitCode = async () => {
        if (!challenge || userCode.trim().length === 0) {
            setEvaluationResult({
                analysis: "Please write some code before submitting.",
                suggestions: []
            });
            return;
        }
        setIsSubmitting(true);
        setEvaluationResult(null); // Clear previous evaluation
        
        // Use the updated analyzeCodeSnippet function
        const result = await geminiService.analyzeCodeSnippet(challenge, userCode);
        setEvaluationResult(result);

        // TODO: Determine completion criteria based on evaluation result (e.g., score, specific feedback)
        // For now, let's just complete if we get any analysis back.
        if (result && result.analysis) {
             // On complete, we might pass the result or a score
            // onComplete({ challenge: challenge, userCode: userCode, evaluation: result, tokensAwarded: TOKENS_PER_CODE_QUEST_COMPLETION });
            // Temporarily disable auto-complete until evaluation criteria is defined
        }

        setIsSubmitting(false);
    };
    
    // TODO: Implement handleGetHint for Code planet
    const handleGetHint = async () => {
        if (!gameCtx) return;
        if (gameCtx.gameState.totalTokens < TOKENS_FOR_HINT) {
             setEvaluationResult(prev => ({
                ...(prev || { analysis: "", suggestions: [] }),
                analysis: (prev?.analysis || "") + `\n\nAI Mentor: You need ${TOKENS_FOR_HINT} Star Tokens for a hint. Explore more or complete other tasks to earn them!`,
            }));
            return;
        }
        
        setIsSubmitting(true);
        gameCtx.spendTokens(TOKENS_FOR_HINT);
        
        if (!challenge) {
            setEvaluationResult(prev => ({
                ...(prev || { analysis: "", suggestions: [] }),
                analysis: (prev?.analysis || "") + "\n\nAI Mentor: No active challenge to provide a hint for.",
            }));
            setIsSubmitting(false);
            return;
        }
        
        const hintText = await geminiService.getCodeDebuggingHint(challenge, userCode, evaluationResult);
        
        setEvaluationResult(prev => ({
            ...(prev || { analysis: "", suggestions: [] }),
            analysis: (prev?.analysis || "") + `\n\nAI Mentor's Hint: ${hintText}`,
        }));
        
        setIsSubmitting(false);
    };

    return (
        <div className="p-4 md:p-6 my-4 bg-[var(--card-bg)] bg-opacity-80 rounded-xl shadow-2xl border border-[var(--planet-code-color)]">
            <div className="flex items-center mb-4">
                <Icon name="code" className="text-4xl mr-3" style={{ color: 'var(--planet-code-color)' }} />
                <div>
                    <h4 className="text-xl font-bold" style={{ color: 'var(--planet-code-color)' }}>Coding Challenge: {challenge?.challengeTitle || quest.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{challenge?.problemDescription || quest.description}</p>
                </div>
            </div>

            {isLoadingChallenge ? (
                <LoadingSpinner message="AI Mentor is crafting a new challenge..." />
            ) : challenge ? (
                <div className="space-y-4 mb-4">
                    {challenge.initialCode && (
                        <div className="p-3 bg-[var(--bg-secondary)] rounded-md border border-[var(--card-border)]">
                             <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Initial Code ({challenge.requiredLanguage}):</p>
                            <pre className="text-[var(--text-primary)] text-sm bg-[var(--input-bg)] p-2 rounded-md overflow-auto">{challenge.initialCode}</pre>
                        </div>
                    )}
                    
                    {challenge.testCases && challenge.testCases.length > 0 && (
                         <div className="p-3 bg-[var(--bg-secondary)] rounded-md border border-[var(--card-border)]">
                             <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Test Cases:</p>
                             <ul className="list-disc list-inside text-sm text-[var(--text-primary)]">
                                 {challenge.testCases.map((tc, index) => (
                                     <li key={index}>Input: <span className="font-mono bg-[var(--input-bg)] px-1 rounded">{tc.input}</span>, Expected Output: <span className="font-mono bg-[var(--input-bg)] px-1 rounded">{tc.output}</span></li>
                                 ))}
                             </ul>
                         </div>
                    )}

                    <div>
                        <label htmlFor="userCode" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Your Code ({challenge.requiredLanguage}):</label>
                        <textarea
                            id="userCode"
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            placeholder="Write your solution here..."
                            className="w-full p-2 rounded-md bg-[var(--input-bg)] text-[var(--input-text)] font-mono text-sm border border-[var(--input-border)] focus:ring-2 focus:ring-[var(--planet-code-color)] focus:border-[var(--planet-code-color)] h-64 resize-y"
                            disabled={isLoadingGemini || isSubmitting}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center text-[var(--text-danger)]"><p>Failed to load coding challenge. Please try again later.</p></div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button
                    onClick={handleSubmitCode}
                    isLoading={isLoadingGemini || isSubmitting}
                    disabled={isLoadingGemini || isSubmitting || isLoadingChallenge || !challenge || userCode.trim().length === 0}
                    className="flex-1 !text-white"
                    style={{ backgroundColor: 'var(--planet-code-color)' }}
                >
                    <Icon name="send" className="mr-2" /> Submit Code to AI Mentor
                </Button>
                 <Button
                    onClick={handleGetHint}
                    variant="ghost"
                    isLoading={isLoadingGemini || isSubmitting}
                    disabled={isLoadingGemini || isSubmitting}
                    className="flex-1 hover:text-[var(--bg-primary)]"
                    style={{ borderColor: 'var(--planet-code-color)', color: 'var(--planet-code-color)' }}
                     onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--planet-code-color)'}
                     onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Icon name="lightbulb" className="mr-2" /> Get Hint ({TOKENS_FOR_HINT} Tokens)
                </Button>
            </div>

            {(isLoadingGemini || isSubmitting) && !evaluationResult && <LoadingSpinner message="AI Mentor is analyzing your code..." />}

            {evaluationResult && ( // Display evaluation result
                <div className="mt-6 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--card-border)]">
                    <h5 className="text-xl font-semibold mb-3 flex items-center" style={{ color: 'var(--planet-code-color)' }}><Icon name="analysis" className="mr-2 text-2xl" />AI Mentor's Analysis:</h5>

                    {evaluationResult.analysis && (
                        <div className="mb-3">
                            <p className="font-semibold text-[var(--text-primary)] mb-1 flex items-center"><Icon name="code" className="mr-2 text-sky-400"/>Evaluation:</p>
                            <p className="text-[var(--text-primary)] text-sm whitespace-pre-wrap leading-relaxed">{evaluationResult.analysis}</p>
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
                    
                     {/* TODO: Add success/failure indication based on analysis and potential score */}
                     {/* For now, assume any analysis is a step forward, but real completion logic needed */}
                     {/* <Button onClick={() => onComplete({ tokensAwarded: TOKENS_PER_CODE_QUEST_COMPLETION })}>Mark as Complete (Temporary)</Button> */}
                </div>
            )}
        </div>
    );
};

export default DynamicCodeChallengeUI; 