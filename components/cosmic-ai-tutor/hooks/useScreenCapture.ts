import { useRef, useState, useCallback, useEffect } from 'react';

interface UseScreenCaptureReturn {
  isActive: boolean;
  error: string | null;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
  captureFrame: () => Promise<string | null>;
  captureScreen: () => Promise<string | null>; // Alias for captureFrame
  isLoading: boolean;
  retryCapture: () => Promise<void>; // Retry function
}

export const useScreenCapture = (): UseScreenCaptureReturn => {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we're in a secure context
  const isSecureContext = useCallback(() => {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }, []);

  // Check browser compatibility
  const checkBrowserSupport = useCallback(() => {
    const issues: string[] = [];

    if (!navigator.mediaDevices) {
      issues.push('MediaDevices API not supported');
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      issues.push('getDisplayMedia not supported');
    }
    if (!isSecureContext()) {
      issues.push('HTTPS required for screen sharing');
    }

    return issues;
  }, [isSecureContext]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.remove();
      videoRef.current = null;
    }
    
    setIsActive(false);
    setIsLoading(false);
  }, []);

  // Auto cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startCapture = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Check browser compatibility first
      const compatibilityIssues = checkBrowserSupport();
      if (compatibilityIssues.length > 0) {
        throw new Error(`Browser compatibility issues: ${compatibilityIssues.join(', ')}`);
      }

      // Try progressive fallback for screen capture constraints
      const constraints = [
        // High quality
        {
          video: {
            width: { ideal: 1920, max: 3840 },
            height: { ideal: 1080, max: 2160 },
            frameRate: { ideal: 15, max: 30 },
            cursor: 'always'
          },
          audio: false
        },
        // Medium quality
        {
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 10, max: 20 },
            cursor: 'always'
          },
          audio: false
        },
        // Basic quality
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 5 }
          },
          audio: false
        },
        // Minimal constraints
        {
          video: true,
          audio: false
        }
      ];

      let stream: MediaStream | null = null;
      let lastError: Error | null = null;

      // Try each constraint set until one works
      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getDisplayMedia(constraint);
          console.log('Screen capture started with constraints:', constraint);
          break;
        } catch (err: any) {
          lastError = err;
          console.warn('Failed with screen constraint:', constraint, err);
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('Failed to access screen with any constraints');
      }

      streamRef.current = stream;

      // Create and setup hidden video element for capturing frames
      if (videoRef.current) {
        videoRef.current.remove();
      }
      
      videoRef.current = document.createElement('video');
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.style.position = 'absolute';
      videoRef.current.style.left = '-9999px';
      videoRef.current.style.top = '-9999px';
      videoRef.current.style.width = '1px';
      videoRef.current.style.height = '1px';
      
      // Add to DOM (required for some browsers to work properly)
      document.body.appendChild(videoRef.current);

      // Wait for video metadata to load
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current!;
        let resolved = false;
        
        const onLoadedMetadata = () => {
          if (resolved) return;
          resolved = true;
          cleanup();
          resolve();
        };

        const onError = (event: Event) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          reject(new Error('Failed to load screen capture video'));
        };

        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
        };

        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onError);
        
        video.srcObject = stream;
        
        // Fallback timeout
        setTimeout(() => {
          if (!resolved && video.readyState >= 1) { // HAVE_METADATA
            resolved = true;
            cleanup();
            resolve();
          } else if (!resolved) {
            resolved = true;
            cleanup();
            reject(new Error('Screen capture video metadata loading timeout'));
          }
        }, 10000);
      });

      // Try to play the video
      try {
        await videoRef.current.play();
      } catch (playError: any) {
        console.warn('Screen capture video autoplay failed (this is often normal):', playError);
        // Don't throw here - autoplay failure is common and doesn't prevent functionality
      }
      
      // Listen for stream end (user stops sharing)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          console.log('Screen sharing ended by user');
          cleanup();
        });
      }

      // Verify video dimensions are available
      let retryCount = 0;
      while (videoRef.current.videoWidth === 0 && retryCount < 50) { // Up to 5 seconds
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
      }

      if (videoRef.current.videoWidth === 0) {
        console.warn('Screen capture video dimensions still not available, but proceeding anyway');
      }

      setIsActive(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Screen capture error:', err);
      
      // Cleanup on error
      cleanup();

      let errorMessage = 'Screen capture failed';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Screen sharing permission denied. Please allow screen sharing when prompted and try again.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Screen sharing is not supported on this device or browser.';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Screen sharing was cancelled by the user.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No screen available for sharing.';
      } else if (err.name === 'InvalidStateError') {
        errorMessage = 'Screen sharing is already active in another tab.';
      } else if (err.message?.includes('HTTPS required')) {
        errorMessage = 'HTTPS is required for screen sharing. Please use a secure connection.';
      } else if (err.message?.includes('not supported')) {
        errorMessage = 'Your browser does not support screen sharing. Please try Chrome, Firefox, or Edge.';
      } else if (err.message) {
        errorMessage = `Screen sharing error: ${err.message}`;
      }

      setError(errorMessage);
      setIsActive(false);
      setIsLoading(false);
    }
  }, [cleanup, checkBrowserSupport]);

  const stopCapture = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const retryCapture = useCallback(async () => {
    setError(null);
    cleanup();
    await startCapture();
  }, [startCapture, cleanup]);

  const captureFrame = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !isActive || !streamRef.current) {
      console.warn('Cannot capture screen frame: screen capture not active');
      return null;
    }

    try {
      const video = videoRef.current;
      
      // Check video state
      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        console.warn('Screen capture video not ready');
        return null;
      }
      
      // Ensure video has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('Screen capture video dimensions not available yet');
        
        // Wait a bit for video to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn('Screen capture video still has no dimensions');
          return null;
        }
      }

      // Check if video is actually playing
      if (video.paused || video.ended) {
        console.warn('Screen capture video is not playing, attempting to resume...');
        try {
          await video.play();
        } catch (playError) {
          console.error('Failed to resume screen capture video:', playError);
          return null;
        }
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current screen frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 with JPEG compression
      // Use slightly lower quality for screen content (often compresses better)
      const dataURL = canvas.toDataURL('image/jpeg', 0.7);
      
      // Verify the capture produced valid data
      if (dataURL.length < 1000) {
        console.warn('Captured screen frame appears to be too small, possibly invalid');
        return null;
      }
      
      return dataURL;
    } catch (err) {
      console.error('Screen frame capture error:', err);
      setError('Failed to capture screen frame. Please try again.');
      return null;
    }
  }, [isActive]);

  // Alias for captureFrame to match interface expectations
  const captureScreen = captureFrame;

  return {
    isActive,
    error,
    startCapture,
    stopCapture,
    captureFrame,
    captureScreen,
    isLoading,
    retryCapture
  };
};
