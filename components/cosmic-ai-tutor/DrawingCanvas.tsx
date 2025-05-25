import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import './DrawingCanvas.css';

interface DrawingCanvasProps {
  onSubmit: (canvasData: string) => void;
}

export const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({ onSubmit }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');
    const [brushSize, setBrushSize] = useState(3);
    const [color, setColor] = useState('#ffffff');

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 600;
      canvas.height = 400;

      // Set initial canvas style
      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      draw(e);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = color;

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const stopDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const submitDrawing = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dataURL = canvas.toDataURL('image/png');
      onSubmit(dataURL);
    };

    const colors = ['#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];

    return (
      <div className="drawing-canvas-container">
        <div className="canvas-header">
          <h3>✏️ Draw & Learn</h3>
          <p>Draw diagrams, equations, or concepts for the AI to analyze</p>
        </div>

        <div className="canvas-tools">
          <div className="tool-group">
            <label>Tool:</label>
            <div className="tool-buttons">
              <button
                className={`tool-button ${currentTool === 'pen' ? 'active' : ''}`}
                onClick={() => setCurrentTool('pen')}
              >
                ✏️ Pen
              </button>
              <button
                className={`tool-button ${currentTool === 'eraser' ? 'active' : ''}`}
                onClick={() => setCurrentTool('eraser')}
              >
                🧽 Eraser
              </button>
            </div>
          </div>

          <div className="tool-group">
            <label>Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="size-slider"
            />
            <span className="size-indicator">{brushSize}px</span>
          </div>

          <div className="tool-group">
            <label>Color:</label>
            <div className="color-palette">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`color-button ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        <div className="canvas-actions">
          <motion.button
            className="action-button clear-button"
            onClick={clearCanvas}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🗑️ Clear
          </motion.button>
          
          <motion.button
            className="action-button submit-button"
            onClick={submitDrawing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📤 Send to AI
          </motion.button>
        </div>

        <div className="drawing-tips">
          <h4>💡 Drawing Tips:</h4>
          <ul>
            <li>Draw mathematical equations or diagrams</li>
            <li>Sketch scientific concepts or processes</li>
            <li>Create flowcharts or mind maps</li>
            <li>The AI can analyze and explain your drawings</li>
          </ul>
        </div>
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
