import React, { useState } from 'react';
import { generateLearningContent } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

const LearningPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [learningContent, setLearningContent] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setLoading(true);
    setError(null);
    setLearningContent(null);

    try {
      const content = await generateLearningContent(topic);
      setLearningContent(content);
    } catch (err) {
      console.error('Error fetching learning content:', err);
      setError('Failed to load learning content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="learning-page-container p-6 max-w-3xl mx-auto bg-[var(--bg-secondary)] rounded-lg shadow-lg text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold text-center mb-6 text-[var(--text-accent)]">Explore New Knowledge</h1>
      <p className="text-center mb-6 text-[var(--text-secondary)]">Enter a topic below to learn something new about Math, Eco, or Coding!</p>

      <div className="input-area flex gap-4 mb-8">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="E.g., Black Holes, Photosynthesis, Python Basics"
          disabled={loading}
          className="flex-grow px-4 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        />
        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className="px-6 py-2 bg-[var(--accent-color)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Learn'}
        </button>
      </div>

      {error && <p className="error-message text-red-500 text-center mb-4">{error}</p>}

      {learningContent && (
        <div className="learning-content-display mt-6 p-4 bg-[var(--bg-primary)] rounded-md border border-[var(--border-color)]">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-accent)]">{learningContent.title}</h2>
          <div className="prose prose-invert max-w-none text-[var(--text-primary)]">
            <ReactMarkdown>{learningContent.content}</ReactMarkdown>
          </div>
        </div>
      )}

      {!learningContent && !loading && !error && (
        <div className="placeholder-text text-center text-[var(--text-secondary)] mt-8">
          <p className="text-lg">Your cosmic learning journey awaits!</p>
        </div>
      )}
    </div>
  );
};

export default LearningPage; 