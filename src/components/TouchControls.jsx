import React, { useState, useEffect } from "react";

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
  
  // Hide controls when user scrolls away from game area (only for two-player mode)
  useEffect(() => {
    if (!twoPlayer || multiplayer) return;
    
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
    boxShadow: "0 8px 25px rgba(0,0,0,0.6)"
  };

  if (isTwoPlayer) {
    // Two Player Mode: Fixed positioning beside the court in landscape
    if (!isVisible) return null;
    
    containerStyle.position = "fixed";
    containerStyle.zIndex = 1000;
    containerStyle.flexDirection = "column";
    containerStyle.top = (boardRect.top + boardRect.height / 2 - (buttonHeight + buttonSpacing)) + "px";
    
    if (player === "left") {
      // Left controls: positioned on the left side in landscape mode
      containerStyle.left = "20px";
    } else {
      // Right controls: positioned on the right side in landscape mode
      containerStyle.right = "20px";
    }
  } else {
    // Single Player Mode: Static position between buttons and leaderboard
    containerStyle.position = "static";
    containerStyle.margin = "20px auto";
    containerStyle.flexDirection = "row";
    containerStyle.justifyContent = "center";
    containerStyle.maxWidth = "200px";
  }

  const handleTouchStart = (direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (player === "left" || !isTwoPlayer) {
      setTouchDirL(direction);
    } else {
      setTouchDirR(direction);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (player === "left" || !isTwoPlayer) {
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
    background: player === "left" || !isTwoPlayer 
      ? "linear-gradient(145deg, #0ff, #0aa)" 
      : "linear-gradient(145deg, #f0f, #a0a)", // Different color for right player
    border: "none",
    borderRadius: "12px",
    color: "#000",
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: player === "left" || !isTwoPlayer 
      ? "0 4px 12px rgba(0,255,255,0.4)" 
      : "0 4px 12px rgba(255,0,255,0.4)",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)"
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(145deg, #ff0, #aa0)",
    transform: "scale(0.95)",
    boxShadow: "0 2px 8px rgba(255,255,0,0.6)",
    color: "#000"
  };

  const currentTouchDir = player === "left" || !isTwoPlayer ? touchDirL : touchDirR;

  return (
    <div style={containerStyle}>
      {/* Player Label for Two Player Mode */}
      {isTwoPlayer && (
        <div style={{
          color: player === "left" ? "#0ff" : "#f0f",
          fontSize: "12px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "5px",
          textShadow: "0 1px 2px rgba(0,0,0,0.8)"
        }}>
          {player === "left" ? "PLAYER 1" : "PLAYER 2"}
        </div>
      )}

      <button
        style={currentTouchDir === -1 ? activeButtonStyle : buttonStyle}
        onTouchStart={handleTouchStart(-1)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart(-1)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        aria-label={`Move ${player || 'left'} paddle up`}
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
        aria-label={`Move ${player || 'left'} paddle down`}
      >
        ▼
      </button>
    </div>
  );
}
