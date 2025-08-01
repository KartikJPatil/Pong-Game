import React, { useState } from "react";

export default function MultiplayerSection({ 
  multiplayer, 
  players, 
  room, 
  isHost, 
  side,
  startMultiplayer, 
  socket,
  setMultiplayer 
}) {
  const [roomInput, setRoomInput] = useState("");

  if (!multiplayer) {
    return (
      <div style={{ 
        margin: "20px auto", 
        textAlign: "center",
        padding: "20px",
        borderRadius: "15px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.1)",
        maxWidth: "500px"
      }}>
        <h2 style={{ color: "#0ff", margin: "0 0 15px 0" }}>🌐 Online Multiplayer</h2>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={roomInput}
            onChange={e => setRoomInput(e.target.value)}
            placeholder="Room code (optional)"
            style={{ 
              fontSize: 16, 
              padding: "10px 15px", 
              borderRadius: 25, 
              border: "2px solid #0ff",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              outline: "none",
              minWidth: "200px"
            }}
          />
          <button
            className="pong-btn"
            style={{ 
              fontSize: 16, 
              fontWeight: 600,
              padding: "10px 20px",
              background: "linear-gradient(45deg, #0ff, #0aa)",
              border: "none",
              borderRadius: 25
            }}
            onClick={() => startMultiplayer(roomInput || Math.random().toString(36).substr(2, 6))}
          >
            🚀 Create/Join Room
          </button>
        </div>
        <div style={{ color: "#aaa", marginTop: 15, fontSize: "14px" }}>
          Leave empty to create a random room
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      color: "#0ff", 
      fontWeight: "bold", 
      margin: "15px 0",
      padding: "15px",
      borderRadius: "10px",
      background: "rgba(0,255,255,0.1)",
      border: "1px solid #0ff",
      textAlign: "center"
    }}>
      <div>🏠 Room: <span style={{ color: "#fff" }}>{room}</span> | 👥 Players: {players}/2</div>
      <div style={{ margin: "5px 0" }}>
        {players < 2 ? "⏳ Waiting for opponent..." : 
         isHost ? "🎮 You are Host (Right paddle)" : "🎮 You are Guest (Left paddle)"}
      </div>
      <button 
        className="pong-btn"
        style={{ 
          marginTop: 10, 
          background: "linear-gradient(45deg, #f44, #a22)", 
          color: "#fff",
          border: "none"
        }}
        onClick={() => { if (socket) socket.disconnect(); setMultiplayer(false); }}
      >
        🚪 Leave Room
      </button>
    </div>
  );
}
