import React from "react";

export default function GameControls({ 
  running, 
  winner, 
  multiplayer,
  handleStart,
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
    if (gamePhase === "waiting" || gamePhase === "countdown" || gamePhase === "playing") {
      return null; // Show nothing during these phases
    }
  }

  // SINGLE PLAYER AND TWO PLAYER CONTROLS
  if (winner || running) return null; // Show nothing if game is running or finished

  // Only show Start Game button when game is not running
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
