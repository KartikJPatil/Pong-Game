import React, { useState } from "react";

export default function MultiplayerSection({ 
  multiplayer, 
  players, 
  room, 
  isHost, 
  side,
  startMultiplayer, 
  socket,
  setMultiplayer,
  gamePhase
}) {
  const [roomInput, setRoomInput] = useState("");

  const handleLeaveRoom = () => {
    if (socket && socket.connected) {
      socket.emit("leave_room", { room });
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    }
    setMultiplayer(false);
  };

  const handleJoinRoom = () => {
    const roomCode = roomInput.trim() || Math.random().toString(36).substr(2, 6);
    startMultiplayer(roomCode);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleJoinRoom();
    }
  };

  const handleRoomInputChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRoomInput(e.target.value);
  };

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
            type="text"
            value={roomInput}
            onChange={handleRoomInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Room code (optional)"
            autoComplete="off"
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
            onClick={handleJoinRoom}
          >
            🚀 Create/Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      color: "#0ff", 
      fontWeight: "bold", 
      margin: "15px 0",
      padding: "20px",
      borderRadius: "15px",
      background: "rgba(0,255,255,0.1)",
      border: "2px solid #0ff",
      textAlign: "center",
      maxWidth: "600px"
    }}>
      <div style={{ fontSize: "18px", marginBottom: "12px" }}>
        🏠 Room: <span style={{ color: "#fff", fontFamily: "monospace" }}>{room}</span> | 👥 Players: {players}/2
      </div>
      
      <div style={{ margin: "12px 0", fontSize: "16px" }}>
        {gamePhase === "waiting" && players < 2 && (
          <span style={{ color: "#ff0" }}>⏳ Waiting for opponent...</span>
        )}
        {gamePhase === "ready" && players === 2 && (
          <span style={{ color: "#0f0" }}>
            🎮 Both players connected! {isHost ? "You can start when guest is ready." : "Get ready to play!"}
          </span>
        )}
        {gamePhase === "countdown" && (
          <span style={{ color: "#f0f", fontSize: "18px", fontWeight: "bold" }}>
            🚀 Game starting soon...
          </span>
        )}
        {gamePhase === "playing" && (
          <span style={{ color: "#0f0" }}>
            🎮 Game in progress! You are {isHost ? "Host (Right paddle)" : "Guest (Left paddle)"}
          </span>
        )}
      </div>
      
      {/* Connection Status */}
      <div style={{ margin: "8px 0", fontSize: "12px", opacity: 0.8 }}>
        Status: {socket && socket.connected ? 
          <span style={{ color: "#0f0" }}>🟢 Connected</span> : 
          <span style={{ color: "#f44" }}>🔴 Disconnected</span>
        }
      </div>
      
      {/* Room sharing */}
      {players === 1 && (
        <div style={{ 
          margin: "15px 0", 
          padding: "12px", 
          background: "rgba(255,255,255,0.05)", 
          borderRadius: "10px",
          fontSize: "14px"
        }}>
          <div style={{ color: "#aaa", marginBottom: "8px" }}>Share this room code:</div>
          <div style={{ 
            color: "#fff", 
            fontFamily: "monospace", 
            fontSize: "16px",
            fontWeight: "bold",
            background: "rgba(0,0,0,0.4)",
            padding: "8px 12px",
            borderRadius: "8px",
            display: "inline-block"
          }}>
            {room}
          </div>
        </div>
      )}
      
      <button 
        className="pong-btn"
        style={{ 
          marginTop: 15, 
          background: "linear-gradient(45deg, #f44, #a22)", 
          color: "#fff",
          border: "none",
          fontSize: "14px",
          padding: "10px 20px"
        }}
        onClick={handleLeaveRoom}
      >
        🚪 Leave Room
      </button>
    </div>
  );
}
