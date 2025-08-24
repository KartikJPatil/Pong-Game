import React from "react";

export default function GameControls({ 
  running, 
  winner, 
  isPaused, 
  theme, 
  keyMap,
  twoPlayer,
  multiplayer,
  handleStart,
  setRunning,
  // Multiplayer ready system props
  gamePhase,
  guestReady,
  isHost,
  onGuestReady,
  onHostStart
}) {
  
  const buttonStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    padding: "15px 30px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)"
  };

  // MULTIPLAYER READY SYSTEM
  if (multiplayer) {
    // Guest Ready Button
    if (!isHost && gamePhase === "ready" && !guestReady) {
      return (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button
            style={{
              ...buttonStyle,
              background: "linear-gradient(45deg, #0f0, #0a0)",
              color: "#000"
            }}
            onClick={onGuestReady}
          >
            ✅ I'm Ready!
          </button>
        </div>
      );
    }

    // Host Start Button
    if (isHost && gamePhase === "ready" && guestReady) {
      return (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button
            style={{
              ...buttonStyle,
              background: "linear-gradient(45deg, #0ff, #0aa)",
              color: "#000"
            }}
            onClick={onHostStart}
          >
            🚀 Start Game!
          </button>
        </div>
      );
    }

    // Waiting states
    if (gamePhase === "waiting" || gamePhase === "countdown") {
      return (
        <div style={{ 
          textAlign: "center", 
          margin: "20px 0", 
          color: "#666",
          fontSize: "14px"
        }}>
          {gamePhase === "waiting" && "⏳ Waiting for players..."}
          {gamePhase === "countdown" && "🚀 Game starting..."}
        </div>
      );
    }

    // Game in progress - no controls needed
    if (gamePhase === "playing") {
      return null;
    }
  }

  // SINGLE PLAYER AND TWO PLAYER CONTROLS
  if (winner) return null;

  // Only show Start Game button when game is not running
  if (!running) {
    return (
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <button
          style={{
            ...buttonStyle,
            background: "linear-gradient(45deg, #0f0, #0a0)",
            color: "#000"
          }}
          onClick={handleStart}
        >
          🚀 Start Game
        </button>
      </div>
    );
  }

  // Game is running - no controls shown (Pause/Restart removed)
  return null;
}
