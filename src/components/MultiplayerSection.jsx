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

  const handleLeaveRoom = () => {
    console.log("Leaving multiplayer room...");
    
    if (socket && socket.connected) {
      // Notify server before disconnecting
      socket.emit("leave_room", { room });
      
      // Wait a moment then disconnect
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    }
    
    // Reset multiplayer state
    setMultiplayer(false);
  };

  const handleJoinRoom = () => {
    const roomCode = roomInput.trim() || Math.random().toString(36).substr(2, 6);
    console.log("Attempting to join room:", roomCode);
    startMultiplayer(roomCode);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
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
            value={roomInput}
            onChange={e => setRoomInput(e.target.value)}
            onKeyPress={handleKeyPress}
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
            onClick={handleJoinRoom}
          >
            🚀 Create/Join Room
          </button>
        </div>
        <div style={{ color: "#aaa", marginTop: 15, fontSize: "14px" }}>
          Leave empty to create a random room • Press Enter to join quickly
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
      <div style={{ fontSize: "16px", marginBottom: "8px" }}>
        🏠 Room: <span style={{ color: "#fff", fontFamily: "monospace" }}>{room}</span> | 👥 Players: {players}/2
      </div>
      
      <div style={{ margin: "8px 0", fontSize: "14px" }}>
        {players < 2 ? (
          <span style={{ color: "#ff0" }}>⏳ Waiting for opponent...</span>
        ) : (
          <span style={{ color: "#0f0" }}>
            🎮 You are {isHost ? "Host (Right paddle)" : "Guest (Left paddle)"} • Ready to play!
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
          margin: "10px 0", 
          padding: "8px", 
          background: "rgba(255,255,255,0.05)", 
          borderRadius: "8px",
          fontSize: "12px"
        }}>
          <div style={{ color: "#aaa", marginBottom: "5px" }}>Share this room code:</div>
          <div style={{ 
            color: "#fff", 
            fontFamily: "monospace", 
            fontSize: "14px",
            fontWeight: "bold",
            background: "rgba(0,0,0,0.3)",
            padding: "4px 8px",
            borderRadius: "4px",
            display: "inline-block"
          }}>
            {room}
          </div>
        </div>
      )}
      
      <button 
        className="pong-btn"
        style={{ 
          marginTop: 10, 
          background: "linear-gradient(45deg, #f44, #a22)", 
          color: "#fff",
          border: "none",
          fontSize: "14px",
          padding: "8px 16px"
        }}
        onClick={handleLeaveRoom}
      >
        🚪 Leave Room
      </button>
    </div>
  );
}
