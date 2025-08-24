import React, { useState, useEffect, useRef } from "react";

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
  const [isVisible, setIsVisible] = useState(true);
  const [leftSwipeActive, setLeftSwipeActive] = useState(null);
  const [rightSwipeActive, setRightSwipeActive] = useState(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Hide controls when user scrolls away from game area (only for single/multiplayer mode)
  useEffect(() => {
    if (twoPlayer && !multiplayer) return; // Skip for two-player mode
    
    const handleScroll = () => {
      if (!boardRect) return;
      const viewportHeight = window.innerHeight;
      const boardTop = boardRect.top;
      const boardBottom = boardRect.bottom;
      const isGameVisible = boardTop < viewportHeight && boardBottom > 0;
      setIsVisible(isGameVisible);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [boardRect, twoPlayer, multiplayer]);

  if (!boardRect) return null;

  const isTwoPlayer = twoPlayer && !multiplayer;

  // SWIPE GESTURES - Only for Two-Player Mode
  if (isTwoPlayer) {
    if (!running || winner) return null;

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

    const handleTouchMove = (e) => {
      if (!touchStartRef.current) return;
      
      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      
      if (deltaX > 50) return; // Ignore horizontal swipes
      if (Math.abs(deltaY) < 40) return; // Minimum swipe distance
      
      const direction = deltaY > 0 ? 1 : -1;
      
      if (touchStartRef.current.side === 'left') {
        setTouchDirL(direction);
        setLeftSwipeActive(direction > 0 ? 'down' : 'up');
      } else {
        setTouchDirR(direction);
        setRightSwipeActive(direction > 0 ? 'down' : 'up');
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!touchStartRef.current) return;
      
      if (touchStartRef.current.side === 'left') {
        setTouchDirL(0);
        setLeftSwipeActive(null);
      } else {
        setTouchDirR(0);
        setRightSwipeActive(null);
      }
      
      touchStartRef.current = null;
    };

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
      </>
    );
  }

  // BUTTON CONTROLS - For Single Player and Multiplayer
  const buttonWidth = 70;
  const buttonHeight = 60;
  const buttonSpacing = 8;

  let containerStyle = {
    display: "flex",
    gap: buttonSpacing + "px",
    padding: "12px",
    borderRadius: "15px",
    background: "linear-gradient(145deg, rgba(20,20,20,0.95), rgba(40,40,40,0.95))",
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(0,255,255,0.3)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.6)",
    position: "static",
    margin: "20px auto",
    flexDirection: "row",
    justifyContent: "center",
    maxWidth: "200px"
  };

  if (!isVisible) return null;

  const handleTouchStart = (direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (player === "left" || !multiplayer) {
      setTouchDirL(direction);
    } else {
      setTouchDirR(direction);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (player === "left" || !multiplayer) {
      setTouchDirL(0);
    } else {
      setTouchDirR(0);
    }
  };

  const buttonStyle = {
    width: buttonWidth + "px",
    height: buttonHeight + "px",
    fontSize: "28px",
    fontWeight: "bold",
    background: player === "left" || !multiplayer ? 
      "linear-gradient(145deg, #0ff, #0aa)" : 
      "linear-gradient(145deg, #f0f, #a0a)",
    border: "none",
    borderRadius: "12px",
    color: "#000",
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: player === "left" || !multiplayer ? 
      "0 4px 12px rgba(0,255,255,0.4)" : 
      "0 4px 12px rgba(255,0,255,0.4)",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)"
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(145deg, #ff0, #aa0)",
    transform: "scale(0.95)",
    boxShadow: "0 2px 8px rgba(255,255,0,0.6)",
    color: "#000"
  };

  const currentTouchDir = player === "left" || !multiplayer ? touchDirL : touchDirR;

  return (
    <div style={containerStyle}>
      <button
        style={currentTouchDir === -1 ? activeButtonStyle : buttonStyle}
        onTouchStart={handleTouchStart(-1)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart(-1)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        ▲
      </button>
      <button
        style={currentTouchDir === 1 ? activeButtonStyle : buttonStyle}
        onTouchStart={handleTouchStart(1)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart(1)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        ▼
      </button>
    </div>
  );
}
