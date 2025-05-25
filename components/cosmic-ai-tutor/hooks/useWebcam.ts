import { useRef, useState, useCallback, useEffect } from 'react';

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => Promise<string | null>;
  isLoading: boolean;
  hasPermission: boolean;
  retryCamera: () => Promise<void>;
}

export const useWebcam = (): UseWebcamReturn => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

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
    if (!navigator.mediaDevices?.getUserMedia) {
      issues.push('getUserMedia not supported');
    }
    if (!isSecureContext()) {
      issues.push('HTTPS required for camera access');
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
    }
    
    setIsActive(false);
    setIsLoading(false);
  }, []);

  // Auto cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Check browser compatibility first
      const compatibilityIssues = checkBrowserSupport();
      if (compatibilityIssues.length > 0) {
        throw new Error(`Browser compatibility issues: ${compatibilityIssues.join(', ')}`);
      }

      // Try progressive fallback for camera constraints
      const constraints = [
        // High quality
        {
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user',
            frameRate: { ideal: 30, max: 60 }
          },
          audio: false
        },
        // Medium quality
        {
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            facingMode: 'user',
            frameRate: { ideal: 24 }
          },
          audio: false
        },
        // Basic quality
        {
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
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
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('Camera started with constraints:', constraint);
          break;
        } catch (err: any) {
          lastError = err;
          console.warn('Failed with constraint:', constraint, err);
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('Failed to access camera with any constraints');
      }

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        const video = videoRef.current;
        
        // Set up video element
        video.srcObject = stream;
        video.playsInline = true; // Important for iOS
        video.muted = true; // Prevent audio feedback
        
        // Wait for video metadata to load
        await new Promise<void>((resolve, reject) => {
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
            reject(new Error('Failed to load video metadata'));
          };

          const cleanup = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          // Fallback timeout
          setTimeout(() => {
            if (!resolved && video.readyState >= 1) { // HAVE_METADATA
              resolved = true;
              cleanup();
              resolve();
            } else if (!resolved) {
              resolved = true;
              cleanup();
              reject(new Error('Video metadata loading timeout'));
            }
          }, 10000);
        });

        // Try to play the video
        try {
          await video.play();
        } catch (playError: any) {
          console.warn('Video autoplay failed (this is often normal):', playError);
          // Don't throw here - autoplay failure is common and doesn't prevent functionality
        }

        // Verify video dimensions are available
        let retryCount = 0;
        while (video.videoWidth === 0 && retryCount < 50) { // Up to 5 seconds
          await new Promise(resolve => setTimeout(resolve, 100));
          retryCount++;
        }

        if (video.videoWidth === 0) {
          console.warn('Video dimensions still not available, but proceeding anyway');
        }

        setIsActive(true);
        setIsLoading(false);
      } else {
        throw new Error('Video element not available');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      let errorMessage = 'Camera access failed';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please click the camera icon in your browser\'s address bar and allow access, then try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera is not supported on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not meet the required specifications. Trying with basic settings...';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Camera access was aborted. Please try again.';
      } else if (err.message?.includes('HTTPS required')) {
        errorMessage = 'HTTPS is required for camera access. Please use a secure connection.';
      } else if (err.message?.includes('not supported')) {
        errorMessage = 'Your browser does not support camera access. Please try Chrome, Firefox, or Edge.';
      } else if (err.message) {
        errorMessage = `Camera error: ${err.message}`;
      }

      setError(errorMessage);
      setIsActive(false);
      setIsLoading(false);
    }
  }, [checkBrowserSupport]);

  const stopCamera = useCallback(() => {
    cleanup();
    setHasPermission(false);
  }, [cleanup]);

  const retryCamera = useCallback(async () => {
    setError(null);
    cleanup();
    await startCamera();
  }, [startCamera, cleanup]);

  const captureFrame = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !isActive || !streamRef.current) {
      console.warn('Cannot capture frame: camera not active');
      return null;
    }

    try {
      const video = videoRef.current;
      
      // Check video state
      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        console.warn('Video not ready for capture');
        return null;
      }

      // Ensure video has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('Video dimensions not available yet');
        return null;
      }

      // Check if video is actually playing
      if (video.paused || video.ended) {
        console.warn('Video is not playing, attempting to resume...');
        try {
          await video.play();
        } catch (playError) {
          console.error('Failed to resume video:', playError);
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
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 with JPEG compression for better performance
      const dataURL = canvas.toDataURL('image/jpeg', 0.75);
      
      // Verify the capture produced valid data
      if (dataURL.length < 1000) {
        console.warn('Captured frame appears to be too small, possibly invalid');
        return null;
      }
      
      return dataURL;
    } catch (err) {
      console.error('Frame capture error:', err);
      setError('Failed to capture camera frame. Please try again.');
      return null;
    }
  }, [isActive]);

  return {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    isLoading,
    hasPermission,
    retryCamera
  };
};
