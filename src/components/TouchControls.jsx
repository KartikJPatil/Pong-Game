import React, { useState, useRef, useEffect } from "react";

export default function TouchControls({ 
  player, 
  boardRect, 
  twoPlayer, 
  multiplayer,
  touchDirL,
  touchDirR,
  setTouchDirL,
  setTouchDirR,
  running,
  winner
}) {
  const [leftSwipeActive, setLeftSwipeActive] = useState(null);
  const [rightSwipeActive, setRightSwipeActive] = useState(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Clear references on unmount
  useEffect(() => {
    return () => {
      touchStartRef.current = null;
    };
  }, []);

  // Handle touch start for swipe detection
  const handleTouchStart = (side) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    touchStartRef.current = { 
      x: touch.clientX, 
      y: touch.clientY, 
      time: Date.now(),
      side: side 
    };
  };

  // Handle touch move to detect swipe direction
  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    
    // Only register vertical swipes (ignore horizontal movement)
    if (deltaX > 50) return;
    
    // Minimum swipe distance for activation (40px)
    if (Math.abs(deltaY) > 40) {
      const direction = deltaY > 0 ? 1 : -1; // Down: 1, Up: -1
      
      if (touchStartRef.current.side === 'left') {
        setTouchDirL(direction);
        setLeftSwipeActive(direction > 0 ? 'down' : 'up');
      } else {
        setTouchDirR(direction);
        setRightSwipeActive(direction > 0 ? 'down' : 'up');
      }
    }
  };

  // Handle touch end to stop paddle movement
  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!touchStartRef.current) return;
    
    // Clear movement immediately
    if (touchStartRef.current.side === 'left') {
      setTouchDirL(0);
      setLeftSwipeActive(null);
    } else {
      setTouchDirR(0);
      setRightSwipeActive(null);
    }
    
    touchStartRef.current = null;
  };

  // Only show swipe controls for two-player mode (not single-player or multiplayer)
  if (!twoPlayer || multiplayer || !running || winner) {
    return null;
  }

  // Two player mode - split screen swipe areas
  return (
    <>
      {/* Left Player Swipe Area */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '50vw',
          height: '100vh',
          background: leftSwipeActive 
            ? leftSwipeActive === 'up' 
              ? 'rgba(0,255,255,0.3)' 
              : 'rgba(0,255,255,0.25)'
            : 'rgba(0,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: '#0ff',
          zIndex: 999,
          userSelect: 'none',
          backdropFilter: 'blur(2px)',
          flexDirection: 'column',
          borderRight: '2px solid rgba(0,255,255,0.3)',
          transition: 'background 0.1s ease'
        }}
        onTouchStart={handleTouchStart('left')}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div style={{ marginBottom: '15px', fontSize: '32px' }}>
          {leftSwipeActive === 'up' ? '⬆️' : leftSwipeActive === 'down' ? '⬇️' : '🎮'}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          Player 1
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'center' }}>
          {leftSwipeActive ? 
            `Swiping ${leftSwipeActive.toUpperCase()}` : 
            'Swipe ↕ to move'
          }
        </div>
      </div>

      {/* Right Player Swipe Area */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '50vw',
          height: '100vh',
          background: rightSwipeActive 
            ? rightSwipeActive === 'up' 
              ? 'rgba(255,0,255,0.3)' 
              : 'rgba(255,0,255,0.25)'
            : 'rgba(255,0,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: '#f0f',
          zIndex: 999,
          userSelect: 'none',
          backdropFilter: 'blur(2px)',
          flexDirection: 'column',
          borderLeft: '2px solid rgba(255,0,255,0.3)',
          transition: 'background 0.1s ease'
        }}
        onTouchStart={handleTouchStart('right')}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div style={{ marginBottom: '15px', fontSize: '32px' }}>
          {rightSwipeActive === 'up' ? '⬆️' : rightSwipeActive === 'down' ? '⬇️' : '🎮'}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          Player 2
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'center' }}>
          {rightSwipeActive ? 
            `Swiping ${rightSwipeActive.toUpperCase()}` : 
            'Swipe ↕ to move'
          }
        </div>
      </div>

      {/* Center divider line */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '0',
          width: '2px',
          height: '100vh',
          background: 'linear-gradient(to bottom, rgba(0,255,255,0.5), rgba(255,0,255,0.5))',
          transform: 'translateX(-50%)',
          zIndex: 998,
          pointerEvents: 'none'
        }}
      />

      {/* Game title overlay - only show when not swiping */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          fontWeight: 'bold',
          opacity: leftSwipeActive || rightSwipeActive ? 0 : 1,
          pointerEvents: 'none',
          textAlign: 'center',
          transition: 'opacity 0.3s ease',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.3)',
          padding: '8px 16px',
          borderRadius: '20px',
          backdropFilter: 'blur(5px)'
        }}
      >
        🏓 PONG<br />
        <span style={{ fontSize: '10px', opacity: 0.8 }}>
          Two Player Mode
        </span>
      </div>
    </>
  );
}
