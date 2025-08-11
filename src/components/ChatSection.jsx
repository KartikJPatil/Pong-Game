import React, { useRef, useEffect } from "react";

export default function ChatSection({ 
  multiplayer, 
  chatMessages, 
  chatInput, 
  setChatInput, 
  handleSendChat 
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // CRITICAL FIX: Proper input change handler
  const handleChatInputChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setChatInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleSendChat(e);
    }
  };

  if (!multiplayer) return null;

  return (
    <div style={{
      margin: "20px auto",
      padding: "20px",
      borderRadius: "15px",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(5px)",
      border: "1px solid rgba(255,255,255,0.1)",
      maxWidth: "500px",
      width: "100%"
    }}>
      <h3 style={{ color: "#0ff", margin: "0 0 15px 0", textAlign: "center" }}>💬 Chat</h3>
      
      {/* Messages Area */}
      <div style={{
        height: "120px",
        overflowY: "auto",
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        scrollbarWidth: "thin",
        scrollbarColor: "#0ff rgba(255,255,255,0.1)"
      }}>
        {chatMessages.length === 0 ? (
          <div style={{ color: "#666", textAlign: "center", fontStyle: "italic" }}>
            No messages yet. Start chatting!
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div key={index} style={{
              marginBottom: "8px",
              padding: "4px 8px",
              borderRadius: "6px",
              background: "rgba(0,255,255,0.1)",
              border: "1px solid rgba(0,255,255,0.2)"
            }}>
              <span style={{ color: "#0ff", fontWeight: "bold", fontSize: "12px" }}>
                {msg.sender}:
              </span>
              <span style={{ color: "#fff", marginLeft: "8px" }}>
                {msg.msg}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSendChat} style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={chatInput}
          onChange={handleChatInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          autoComplete="off"
          style={{
            flex: 1,
            fontSize: "14px",
            padding: "8px 12px",
            borderRadius: "20px",
            border: "1px solid #0ff",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            outline: "none"
          }}
          onFocus={(e) => {
            e.target.style.background = "rgba(255,255,255,0.15)";
            e.target.style.borderColor = "#0aa";
          }}
          onBlur={(e) => {
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.borderColor = "#0ff";
          }}
        />
        <button
          type="submit"
          className="pong-btn"
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            background: "linear-gradient(45deg, #0ff, #0aa)",
            border: "none",
            borderRadius: "20px",
            minWidth: "60px"
          }}
        >
          📤
        </button>
      </form>
    </div>
  );
}
