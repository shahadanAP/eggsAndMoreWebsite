// src/components/VideoPlayer.js
import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    
    const attemptPlay = () => {
      video.play()
        .then(() => {
          // Successfully playing
        })
        .catch(error => {
          console.error('Playback failed:', error);
          setShowFallback(true);
        });
    };

    // For mobile browsers
    const handleUserInteraction = () => {
      attemptPlay();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // First attempt
    attemptPlay();

    // Fallback for strict autoplay policies
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  return (
    <div className="video-container">
      {showFallback && (
        <div className="video-fallback">
          <button 
            onClick={() => {
              videoRef.current?.play();
              setShowFallback(false);
            }}
            className="play-button"
          >
            ▶ Play Video
          </button>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{ display: showFallback ? 'none' : 'block' }}
      >
        <source src={require("./assets/EggsAndMore.mp4")} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
};

export default VideoPlayer;