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
  setRunning
}) {
  return (
    <>
      {/* --- CONTROL INSTRUCTIONS --- */}
      <div style={{ 
        color: theme.fg, 
        marginTop: 15, 
        fontSize: "14px",
        textAlign: "center",
        padding: "15px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.1)",
        maxWidth: "600px"
      }}>
        <div style={{ color: "#0ff", fontWeight: "bold", marginBottom: "8px" }}>🎮 Controls</div>
        <div>
          <strong>Left Player:</strong> {keyMap.leftUp.toUpperCase()}/{keyMap.leftDown.toUpperCase()} &nbsp;|&nbsp;
          <strong>Right Player:</strong> {twoPlayer ? `${keyMap.rightUp.toUpperCase()}/${keyMap.rightDown.toUpperCase()}` : multiplayer ? "Remote Player" : "AI"}
        </div>
        <div style={{ marginTop: "5px", color: "#aaa" }}>
          📱 Touch controls available on mobile devices
        </div>
      </div>

      {/* --- GAME CONTROL BUTTONS --- */}
      <div style={{ margin: "20px 0", display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
        {!running && !winner && (
          <button
            className="pong-btn"
            style={{
              padding: "12px 30px",
              fontSize: 18,
              fontWeight: "bold",
              background: "linear-gradient(45deg, #0f0, #0a0)",
              border: "none",
              borderRadius: 25,
              boxShadow: "0 0 20px rgba(0,255,0,0.3)"
            }}
            onClick={handleStart}
          >
            🚀 Start Game
          </button>
        )}
        {running && (
          <button
            className="pong-btn"
            style={{
              padding: "10px 25px",
              fontSize: 16,
              background: "linear-gradient(45deg, #f44, #a22)",
              color: "#fff",
              border: "none",
              borderRadius: 25
            }}
            onClick={() => setRunning(false)}
          >
            ⏹ Stop Game
          </button>
        )}
        {isPaused && running && (
          <div style={{ 
            color: "#ff0", 
            fontSize: "18px", 
            fontWeight: "bold",
            textShadow: "0 0 10px rgba(255,255,0,0.5)"
          }}>
            ⏸ PAUSED
          </div>
        )}
      </div>
    </>
  );
}
