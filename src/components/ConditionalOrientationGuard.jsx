import React, { useState, useEffect } from 'react';

export default function ConditionalOrientationGuard({ twoPlayer, children }) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      const isMobileDevice = window.innerWidth <= 768; // Mobile breakpoint
      
      setIsLandscape(isLandscapeMode);
      setIsMobile(isMobileDevice);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      // Add delay for orientation change to complete
      setTimeout(checkOrientation, 100);
    });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Only show orientation guard for two-player mode on mobile devices
  if (twoPlayer && isMobile && !isLandscape) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          animation: 'rotate 2s infinite linear'
        }}>
          📱 ↻
        </div>
        <h2 style={{
          fontSize: '24px',
          marginBottom: '16px',
          color: '#0ff'
        }}>
          Please Rotate Your Device
        </h2>
        <p style={{
          fontSize: '16px',
          opacity: 0.8,
          maxWidth: '300px',
          lineHeight: '1.4'
        }}>
          For the best two-player experience, please rotate your device to landscape mode.
        </p>
        <style jsx>{`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return children;
}
