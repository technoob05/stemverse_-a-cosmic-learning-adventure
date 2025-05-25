import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoToLearningAppContent from '../video-to-learning-app/App';
import { DataContext } from '../video-to-learning-app/context';
import '../video-to-learning-app/styles.css';

const VideoToLearningApp: React.FC = () => {
  const navigate = useNavigate();
  const [examples, setExamples] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Set up global process.env object for Gemini API key
  useEffect(() => {
    // Check if process global is not defined
    if (typeof globalThis.process === 'undefined') {
      // In production, we'd get this from environment variables
      // For development/demo, you could add your key here or use localStorage
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY') || 'YOUR_API_KEY';
      globalThis.process = { env: { GEMINI_API_KEY } };
    }
  }, []);

  useEffect(() => {
    // Load examples data
    setIsLoading(true);
    fetch('./components/video-to-learning-app/public/data/examples.json')
      .then((res) => res.json())
      .then((fetchedData) => {
        setExamples(fetchedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading examples:', error);
        setIsLoading(false);
      });
  }, []);

  const empty = {title: '', url: '', spec: '', code: ''};

  const dataContextValue = {
    examples,
    isLoading,
    setExamples,
    defaultExample: examples.length > 0 ? examples[0] : empty,
  };

  return (
    <div className="video-learning-page-container">
      <div className="page-header mb-6">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate('/learn')}
            className="mb-4 flex items-center text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors"
          >
            <span className="mr-2">←</span> Back to Learning Hub
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-[var(--text-primary)]">
            Video to Learning App
          </h1>
          <p className="text-center text-[var(--text-secondary)] mt-2">
            Transform any educational YouTube video into an interactive learning application
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <DataContext.Provider value={dataContextValue}>
          <VideoToLearningAppContent />
        </DataContext.Provider>
      </div>
    </div>
  );
};

export default VideoToLearningApp; 