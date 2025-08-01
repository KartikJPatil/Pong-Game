import React from "react";

export default function ChatSection({
  multiplayer,
  chatMessages,
  chatInput,
  setChatInput,
  handleSendChat
}) {
  if (!multiplayer) return null;

  return (
    <div style={{
      maxWidth: 450, 
      margin: "20px auto",
      padding: "20px",
      borderRadius: "15px",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(5px)",
      border: "1px solid rgba(255,255,255,0.1)"
    }}>
      <h3 style={{ color: "#0ff", margin: "0 0 15px 0", textAlign: "center" }}>💬 Chat</h3>
      <div style={{
        border: "1px solid #444", 
        height: 120, 
        overflowY: "auto", 
        background: "rgba(0,0,0,0.3)", 
        color: "#fff", 
        padding: 12, 
        fontSize: 14,
        borderRadius: 10,
        marginBottom: 10
      }}>
        {chatMessages.length === 0 ? (
          <div style={{ color: "#666", fontStyle: "italic" }}>No messages yet...</div>
        ) : (
          chatMessages.map((c, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <span style={{ color: "#0ff", fontWeight: "bold" }}>{c.sender}:</span> {c.msg}
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSendChat} style={{display: "flex", gap: 8}}>
        <input
          placeholder="Type a message..."
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          style={{
            flex: 1, 
            padding: 10,
            borderRadius: 20,
            border: "1px solid #0ff",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            outline: "none"
          }}
          disabled={!multiplayer}
        />
        <button 
          type="submit" 
          disabled={!chatInput.trim() || !multiplayer}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: "none",
            background: chatInput.trim() ? "linear-gradient(45deg, #0ff, #0aa)" : "#666",
            color: "#000",
            fontWeight: "bold",
            cursor: chatInput.trim() ? "pointer" : "not-allowed"
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
