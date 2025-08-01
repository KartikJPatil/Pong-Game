import React from "react";

export default function TouchControls({ 
  player, 
  boardRect, 
  twoPlayer, 
  multiplayer,
  touchDirL,
  touchDirR,
  setTouchDirL,
  setTouchDirR 
}) {
  if (!boardRect) return null;
  
  const isTwoPlayer = twoPlayer && !multiplayer;
  const buttonWidth = 70;
  const buttonHeight = 60;
  const buttonSpacing = 5;
  
  let containerStyle = {
    position: "fixed",
    zIndex: 1000,
    display: "flex",
    gap: buttonSpacing + "px",
    padding: "10px",
    borderRadius: "12px",
    background: "linear-gradient(145deg, rgba(20,20,20,0.95), rgba(40,40,40,0.95))",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
  };

  // Position logic for different modes
  if (isTwoPlayer) {
    // Two player mode: place on sides of the court
    if (player === "left") {
      containerStyle.left = Math.max(10, boardRect.left - buttonWidth - 20) + "px";
      containerStyle.top = (boardRect.top + boardRect.height / 2 - buttonHeight) + "px";
      containerStyle.flexDirection = "column";
    } else {
      containerStyle.right = Math.max(10, window.innerWidth - boardRect.right - buttonWidth - 20) + "px";
      containerStyle.top = (boardRect.top + boardRect.height / 2 - buttonHeight) + "px";
      containerStyle.flexDirection = "column";
    }
  } else {
    // Single player mode: place below the court, centered
    containerStyle.left = "50%";
    containerStyle.transform = "translateX(-50%)";
    containerStyle.top = Math.min(
      window.innerHeight - buttonHeight - 20,
      boardRect.bottom + 20
    ) + "px";
    containerStyle.flexDirection = "row";
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
    fontSize: "24px",
    fontWeight: "bold",
    background: "linear-gradient(145deg, #0ff, #0aa)",
    border: "none",
    borderRadius: "8px",
    color: "#000",
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,255,255,0.3)"
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(145deg, #ff0, #aa0)",
    transform: "scale(0.95)",
    boxShadow: "0 1px 4px rgba(255,255,0,0.5)"
  };

  const currentTouchDir = player === "left" || !isTwoPlayer ? touchDirL : touchDirR;

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
        {isTwoPlayer && containerStyle.flexDirection === "column" ? "▲" : "⬆"}
      </button>
      <button
        style={currentTouchDir === 1 ? activeButtonStyle : buttonStyle}
        onTouchStart={handleTouchStart(1)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart(1)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        {isTwoPlayer && containerStyle.flexDirection === "column" ? "▼" : "⬇"}
      </button>
    </div>
  );
}
