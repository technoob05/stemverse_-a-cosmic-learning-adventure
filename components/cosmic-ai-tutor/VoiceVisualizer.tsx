import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './VoiceVisualizer.css';

interface VoiceVisualizerProps {
  isListening: boolean;
  volume: number;
  onVoiceData: (audioData: ArrayBuffer) => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isListening,
  volume,
  onVoiceData,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (isListening && !mediaRecorder) {
      const initializeAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          });

          const recorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
          });

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { 
              type: 'audio/webm;codecs=opus' 
            });
            const arrayBuffer = await audioBlob.arrayBuffer();
            onVoiceData(arrayBuffer);
            audioChunksRef.current = [];
          };

          setMediaRecorder(recorder);

          cleanup = () => {
            stream.getTracks().forEach(track => track.stop());
            setMediaRecorder(null);
          };
        } catch (error) {
          console.error('Error accessing microphone:', error);
        }
      };

      initializeAudio();
    }

    return cleanup;
  }, [isListening, mediaRecorder, onVoiceData]);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Create visualizer bars based on volume
  const bars = Array.from({ length: 20 }, () => {
    const height = Math.max(4, Math.random() * volume * 100 + (isRecording ? 10 : 4));
    return height;
  });

  return (
    <div className="voice-visualizer">
      <div className="visualizer-container">
        <div className="audio-bars">
          {bars.map((height, index) => (
            <motion.div
              key={index}
              className="audio-bar"
              animate={{
                height: isRecording ? `${height}px` : '4px',
                backgroundColor: isRecording 
                  ? `hsl(${200 + index * 8}, 70%, ${50 + height / 2}%)` 
                  : 'rgba(255, 255, 255, 0.3)'
              }}
              transition={{
                duration: 0.1,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      </div>

      <div className="voice-controls">
        <motion.button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          whileTap={{ scale: 0.95 }}
          disabled={!mediaRecorder}
        >
          <div className="record-icon">
            {isRecording ? '⏸️' : '🎤'}
          </div>
          <span className="record-text">
            {isRecording ? 'Release to Send' : 'Hold to Speak'}
          </span>
        </motion.button>

        {volume > 0 && (
          <div className="volume-indicator">
            <span className="volume-label">Volume:</span>
            <div className="volume-bar">
              <motion.div
                className="volume-fill"
                animate={{ width: `${Math.min(100, volume * 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="voice-tips">
        <h4>💡 Voice Tips:</h4>
        <ul>
          <li>Hold the microphone button while speaking</li>
          <li>Speak clearly for best results</li>
          <li>Ask questions or describe what you want to learn</li>
          <li>The AI can hear and respond with voice</li>
        </ul>
      </div>
    </div>
  );
};
