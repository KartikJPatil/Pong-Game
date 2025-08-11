import React, { useState, useEffect } from "react";

export default function ConditionalOrientationGuard({ children, twoPlayer }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerHeight < window.innerWidth);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    handleOrientationChange();
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Only show rotation prompt for mobile users in 2-player mode who are in portrait
  if (isMobile && twoPlayer && !isLandscape) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
        color: '#0ff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        zIndex: 9999
      }}>
        <div style={{
          fontSize: '4em',
          marginBottom: '20px',
          animation: 'bounce 2s infinite'
        }}>
          📱 ↻
        </div>
        <h2 style={{ 
          fontSize: '1.5em', 
          marginBottom: '15px',
          textShadow: '0 0 10px rgba(0,255,255,0.5)'
        }}>
          Rotate for 2-Player Mode
        </h2>
        <p style={{ 
          fontSize: '1.1em', 
          opacity: 0.8,
          maxWidth: '300px',
          lineHeight: '1.4',
          marginBottom: '20px'
        }}>
          Two-player mode requires landscape orientation for the best experience. 
          Please rotate your device to continue.
        </p>
        
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(0,255,255,0.3)'
        }}>
          <p style={{ 
            fontSize: '0.9em', 
            color: '#aaa', 
            margin: 0 
          }}>
            💡 Tip: Single-player mode works great in portrait too!
          </p>
        </div>
        
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-30px); }
            60% { transform: translateY(-15px); }
          }
        `}</style>
      </div>
    );
  }

  // For all other cases, just render the game
  return children;
}
    