import React, { useState } from "react";

export default function KeyConfig({ keyMap, setKeyMap }) {
  const [editingKey, setEditingKey] = useState(null);

  function handleChange(keyName, newValue) {
    setKeyMap(km => ({
      ...km,
      [keyName]: newValue
    }));
  }

  function handleKeyPress(keyName, e) {
    e.preventDefault();
    const key = e.key === ' ' ? 'Space' : e.key;
    handleChange(keyName, key);
    setEditingKey(null);
  }

  const KeyButton = ({ keyName, label, currentKey }) => (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 15px",
      background: "rgba(255,255,255,0.1)",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.2)"
    }}>
      <span style={{ 
        color: "#fff", 
        fontSize: "1em",
        fontWeight: "500"
      }}>
        {label}:
      </span>
      <button
        onClick={() => setEditingKey(keyName)}
        onKeyDown={(e) => editingKey === keyName && handleKeyPress(keyName, e)}
        style={{
          background: editingKey === keyName ? 
            "linear-gradient(45deg, #ff0, #aa0)" :
            "linear-gradient(45deg, #0ff, #0aa)",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          fontWeight: "bold",
          cursor: "pointer",
          minWidth: "80px",
          fontSize: "0.9em",
          transition: "all 0.3s ease",
          boxShadow: editingKey === keyName ? 
            "0 0 15px rgba(255,255,0,0.5)" :
            "0 2px 5px rgba(0,0,0,0.3)"
        }}
      >
        {editingKey === keyName ? "Press key..." : currentKey.toUpperCase()}
      </button>
    </div>
  );

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: "15px",
      padding: "25px",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)",
      maxWidth: "400px",
      margin: "0 auto"
    }}>
      <h3 style={{
        margin: "0 0 20px 0",
        textAlign: "center",
        color: "#0ff",
        textShadow: "0 0 10px rgba(0,255,255,0.5)"
      }}>
        ⌨️ Key Configuration
      </h3>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px"
      }}>
        <div style={{
          display: "grid",
          gap: "12px"
        }}>
          <div style={{
            color: "#0ff",
            fontWeight: "bold",
            fontSize: "1em",
            marginBottom: "5px",
            textAlign: "center"
          }}>
            🎮 Left Player Controls
          </div>
          <KeyButton
            keyName="leftUp"
            label="Move Up"
            currentKey={keyMap.leftUp}
          />
          <KeyButton
            keyName="leftDown"
            label="Move Down"
            currentKey={keyMap.leftDown}
          />
        </div>

        <div style={{
          display: "grid",
          gap: "12px"
        }}>
          <div style={{
            color: "#f0f",
            fontWeight: "bold",
            fontSize: "1em",
            marginBottom: "5px",
            textAlign: "center"
          }}>
            🎮 Right Player Controls
          </div>
          <KeyButton
            keyName="rightUp"
            label="Move Up"
            currentKey={keyMap.rightUp}
          />
          <KeyButton
            keyName="rightDown"
            label="Move Down"
            currentKey={keyMap.rightDown}
          />
        </div>
      </div>

      <div style={{
        marginTop: "20px",
        padding: "15px",
        background: "rgba(255,255,0,0.1)",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,0,0.3)",
        color: "#fff",
        fontSize: "0.9em",
        textAlign: "center"
      }}>
        💡 <strong>Tip:</strong> Click on any key button and press your desired key to change it.
      </div>

      {editingKey && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.9)",
          color: "#fff",
          padding: "20px",
          borderRadius: "15px",
          border: "2px solid #ff0",
          textAlign: "center",
          zIndex: 1000,
          boxShadow: "0 0 30px rgba(255,255,0,0.5)"
        }}>
          <div style={{ fontSize: "1.2em", marginBottom: "10px" }}>
            Press any key to assign to <br/>
            <strong style={{ color: "#ff0" }}>
              {editingKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </strong>
          </div>
          <button
            onClick={() => setEditingKey(null)}
            style={{
              background: "#666",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "5px 15px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
