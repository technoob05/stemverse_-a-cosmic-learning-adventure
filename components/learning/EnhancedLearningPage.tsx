import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateEnhancedLearningContent, getSuggestedTopics, generateQuizFromContent } from '../../services/learningService';
import { LearningContent, LearningCategory, Quiz } from '../../types';
import ReactMarkdown from 'react-markdown';

// Component for category selection
const CategorySelector: React.FC<{
  selectedCategory: LearningCategory;
  onSelectCategory: (category: LearningCategory) => void;
}> = ({ selectedCategory, onSelectCategory }) => {
  const categories: { id: LearningCategory; name: string; icon: string; color: string }[] = [
    { id: 'math', name: 'Mathematics', icon: '🧮', color: 'bg-purple-600' },
    { id: 'eco', name: 'Environment', icon: '🌿', color: 'bg-green-600' },
    { id: 'code', name: 'Programming', icon: '💻', color: 'bg-blue-600' },
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
            selectedCategory === category.id
              ? `${category.color} text-white shadow-lg`
              : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
          }`}
        >
          <span className="text-2xl">{category.icon}</span>
          <span className="font-medium">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

// Component for suggested topics
const SuggestedTopics: React.FC<{
  topics: string[];
  onSelectTopic: (topic: string) => void;
  isLoading: boolean;
}> = ({ topics, onSelectTopic, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-24"></div>
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-32"></div>
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-28"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2 text-[var(--text-secondary)]">Suggested Topics:</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => onSelectTopic(topic)}
            className="px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-quaternary)] transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

// Component for content display
const ContentDisplay: React.FC<{
  content: LearningContent;
  category: LearningCategory;
  onTakeQuiz: () => void;
}> = ({ content, category, onTakeQuiz }) => {
  const getCategoryColor = (cat: LearningCategory): string => {
    switch (cat) {
      case 'math': return 'text-purple-500';
      case 'eco': return 'text-green-500';
      case 'code': return 'text-blue-500';
      default: return 'text-[var(--text-accent)]';
    }
  };

  const getCategoryIcon = (cat: LearningCategory): string => {
    switch (cat) {
      case 'math': return '🧮';
      case 'eco': return '🌿';
      case 'code': return '💻';
      default: return '📚';
    }
  };

  return (
    <div className="learning-content-display mt-6">
      <div className="bg-[var(--bg-primary)] rounded-t-lg p-6 border border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{getCategoryIcon(category)}</span>
          <h2 className={`text-2xl font-bold ${getCategoryColor(category)}`}>{content.title}</h2>
        </div>
        
        <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-[var(--text-secondary)]">{content.summary}</p>
        </div>
        
        <div className="prose prose-invert max-w-none text-[var(--text-primary)]">
          <ReactMarkdown>{content.content}</ReactMarkdown>
        </div>
        
        {/* Key Points Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Key Points</h3>
          <ul className="list-disc pl-6 space-y-2">
            {content.keyPoints.map((point, index) => (
              <li key={index} className="text-[var(--text-primary)]">{point}</li>
            ))}
          </ul>
        </div>
        
        {/* Examples Section */}
        {content.examples && content.examples.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Examples</h3>
            <div className="space-y-4">
              {content.examples.map((example, index) => (
                <div key={index} className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{example.description}</h4>
                  <div className="bg-[var(--bg-quaternary)] p-3 rounded">
                    <ReactMarkdown>{example.solution}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Practice Questions Section */}
        {content.practiceQuestions && content.practiceQuestions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Practice Questions</h3>
            <div className="space-y-6">
              {content.practiceQuestions.map((question, index) => (
                <div key={index} className="border border-[var(--border-color)] rounded-lg overflow-hidden">
                  <div className="bg-[var(--bg-tertiary)] p-3">
                    <h4 className="font-medium">Question {index + 1}</h4>
                  </div>
                  <div className="p-4">
                    <p className="mb-4">{question.question}</p>
                    <details className="cursor-pointer">
                      <summary className="text-[var(--text-accent)] font-medium">Show Answer</summary>
                      <div className="mt-2 p-3 bg-[var(--bg-quaternary)] rounded">
                        <ReactMarkdown>{question.answer}</ReactMarkdown>
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Related Topics */}
        {content.relatedTopics && content.relatedTopics.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {content.relatedTopics.map((topic, index) => (
                <span key={index} className="px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Quiz Button */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={onTakeQuiz}
            className="px-6 py-3 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>Take Quiz</span>
            <span>📝</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Quiz Component
const QuizComponent: React.FC<{
  quiz: Quiz;
  onFinish: (score: number) => void;
}> = ({ quiz, onFinish }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(quiz.questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = (): number => {
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / quiz.questions.length) * 100);
  };

  const handleFinish = () => {
    const score = calculateScore();
    onFinish(score);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="bg-[var(--bg-primary)] rounded-lg p-6 border border-[var(--border-color)]">
        <h2 className="text-2xl font-bold mb-6 text-center">Quiz Results</h2>
        
        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold">{score}%</span>
            </div>
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="var(--bg-tertiary)" 
                strokeWidth="8"
              />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke={score >= 70 ? "var(--accent-color)" : "var(--text-error)"} 
                strokeWidth="8"
                strokeDasharray={`${score * 2.83} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-xl">
            {score >= 90 ? "Excellent! You've mastered this topic!" : 
             score >= 70 ? "Good job! You understand this topic well." :
             score >= 50 ? "Not bad! Review the material to improve." :
             "Keep learning! Review the material and try again."}
          </p>
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Review Answers:</h3>
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
              <p className="font-medium mb-2">{question.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {question.options.map((option, oIndex) => (
                  <div 
                    key={oIndex} 
                    className={`p-2 rounded ${
                      selectedAnswers[qIndex] === oIndex && question.correctAnswer === oIndex
                        ? 'bg-green-500/20 border border-green-500'
                        : selectedAnswers[qIndex] === oIndex
                        ? 'bg-red-500/20 border border-red-500'
                        : question.correctAnswer === oIndex
                        ? 'bg-green-500/20 border border-green-500'
                        : 'bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    {option}
                    {selectedAnswers[qIndex] === oIndex && question.correctAnswer === oIndex && " ✅"}
                    {selectedAnswers[qIndex] === oIndex && question.correctAnswer !== oIndex && " ❌"}
                    {selectedAnswers[qIndex] !== oIndex && question.correctAnswer === oIndex && " (Correct)"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleFinish}
            className="px-6 py-3 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            Return to Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg p-6 border border-[var(--border-color)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quiz</h2>
        <span className="px-3 py-1 bg-[var(--bg-tertiary)] rounded-full text-sm">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </span>
      </div>
      
      <div className="mb-8">
        <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full">
          <div 
            className="h-full bg-[var(--accent-color)] rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-medium mb-4">{quiz.questions[currentQuestion].question}</h3>
        <div className="grid grid-cols-1 gap-3">
          {quiz.questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`p-4 text-left rounded-lg transition-colors ${
                selectedAnswers[currentQuestion] === index
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-quaternary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion] === -1}
          className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

// Component for featured tools
const FeaturedTools: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-3 text-[var(--text-secondary)]">Featured Learning Tools:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => navigate('/ai-storyteller')}
          className="bg-[var(--bg-secondary)] p-4 rounded-lg cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📝</span>
            <h4 className="font-semibold">AI Storyteller</h4>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Create interactive educational stories with AI assistance.</p>
        </div>
        
        <div 
          onClick={() => navigate('/video-to-learning')}
          className="bg-[var(--bg-secondary)] p-4 rounded-lg cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎬</span>
            <h4 className="font-semibold">Video to Learning App</h4>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Transform YouTube videos into interactive learning applications.</p>
        </div>
      </div>
    </div>
  );
};

// Main Learning Page Component
const EnhancedLearningPage: React.FC = () => {
  const [category, setCategory] = useState<LearningCategory>('math');
  const [topic, setTopic] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Load suggested topics when category changes
  useEffect(() => {
    const loadSuggestedTopics = async () => {
      setLoadingTopics(true);
      try {
        const topics = await getSuggestedTopics(category);
        setSuggestedTopics(topics);
      } catch (err) {
        console.error('Error loading suggested topics:', err);
      } finally {
        setLoadingTopics(false);
      }
    };
    
    loadSuggestedTopics();
  }, [category]);

  const handleCategoryChange = (newCategory: LearningCategory) => {
    setCategory(newCategory);
    setLearningContent(null);
    setQuiz(null);
    setShowQuiz(false);
    setQuizScore(null);
    setError(null);
  };

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    handleGenerateClick(selectedTopic);
  };

  const handleGenerateClick = async (customTopic?: string) => {
    const topicToUse = customTopic || topic;
    
    if (!topicToUse.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setLoading(true);
    setError(null);
    setLearningContent(null);
    setQuiz(null);
    setShowQuiz(false);

    try {
      const content = await generateEnhancedLearningContent(topicToUse, category);
      setLearningContent(content);
    } catch (err) {
      console.error('Error fetching learning content:', err);
      setError('Failed to load learning content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = async () => {
    if (!learningContent) return;
    
    setLoading(true);
    try {
      const generatedQuiz = await generateQuizFromContent(learningContent, category);
      if (generatedQuiz) {
        setQuiz(generatedQuiz);
        setShowQuiz(true);
      } else {
        setError('Failed to generate quiz. Please try again.');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizFinish = (score: number) => {
    setQuizScore(score);
    setShowQuiz(false);
  };

  const getCategoryTitle = (): string => {
    switch (category) {
      case 'math': return 'Mathematics with Thầy Euclid';
      case 'eco': return 'Environmental Science with Giáo sư Gaia';
      case 'code': return 'Programming with Code Master Ada';
      default: return 'Explore New Knowledge';
    }
  };

  const getCategoryDescription = (): string => {
    switch (category) {
      case 'math': return 'Discover the beauty of mathematics, from basic concepts to advanced theories.';
      case 'eco': return 'Learn about our planet, ecosystems, and sustainable environmental practices.';
      case 'code': return 'Master programming concepts, algorithms, and coding best practices.';
      default: return 'Enter a topic below to learn something new!';
    }
  };

  return (
    <div className="learning-page-container p-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-[var(--text-accent)] cosmic-title">Cosmic Learning Adventure</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">Embark on an educational journey through the STEMverse. Select a subject and explore fascinating topics with our expert guides.</p>
      </div>
      
      <CategorySelector selectedCategory={category} onSelectCategory={handleCategoryChange} />
      
      <FeaturedTools />
      
      <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-accent)]">{getCategoryTitle()}</h2>
        <p className="mb-6 text-[var(--text-secondary)]">{getCategoryDescription()}</p>
        
        <SuggestedTopics 
          topics={suggestedTopics} 
          onSelectTopic={handleTopicSelect} 
          isLoading={loadingTopics} 
        />
        
        <div className="input-area flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`E.g., ${category === 'math' ? 'Calculus, Geometry' : category === 'eco' ? 'Climate Change, Biodiversity' : 'Python, Data Structures'}`}
            disabled={loading}
            className="flex-grow px-4 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          />
          <button
            onClick={() => handleGenerateClick()}
            disabled={loading || !topic.trim()}
            className="px-6 py-2 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <span>Learn</span>
                <span>🚀</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className="error-message text-red-500 text-center mb-4">{error}</p>}

      {loading && !error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Generating content...</p>
        </div>
      )}

      {showQuiz && quiz && (
        <QuizComponent quiz={quiz} onFinish={handleQuizFinish} />
      )}

      {!showQuiz && learningContent && !loading && (
        <ContentDisplay 
          content={learningContent} 
          category={category} 
          onTakeQuiz={handleTakeQuiz} 
        />
      )}

      {quizScore !== null && !showQuiz && (
        <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg text-center">
          <p className="font-medium">
            Your quiz score: {quizScore}% 
            {quizScore >= 70 ? " 🎉" : " 📚"}
          </p>
        </div>
      )}

      {!learningContent && !loading && !error && (
        <div className="placeholder-text text-center text-[var(--text-secondary)] mt-16">
          <div className="text-6xl mb-4">🌠</div>
          <p className="text-xl">Your cosmic learning journey awaits!</p>
          <p className="mt-2">Select a topic from the suggestions or enter your own.</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedLearningPage; 