import React from "react";

export default function Controls({
  difficulty, setDifficulty,
  theme, setTheme,
  isMuted, onMuteToggle,
  twoPlayer, setTwoPlayer,
  showKeyConfig, setShowKeyConfig,
  winScore, setWinScore,
  disabled = false
}) {
  
  const controlStyle = {
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto'
  };

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      borderRadius: "15px",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)",
      ...controlStyle
    }}>
      
      {/* Difficulty Control */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px"
      }}>
        <label style={{ 
          color: "#0ff", 
          fontSize: "0.9em", 
          fontWeight: "bold",
          textShadow: "0 0 5px rgba(0,255,255,0.3)"
        }}>
          🎯 Difficulty: {difficulty}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={difficulty}
          onChange={(e) => setDifficulty(parseInt(e.target.value))}
          disabled={disabled}
          style={{
            accentColor: "#0ff",
            width: "120px"
          }}
        />
        <div style={{ 
          color: "#888", 
          fontSize: "0.7em",
          textAlign: "center"
        }}>
          {difficulty <= 3 ? "Easy" : difficulty <= 7 ? "Medium" : "Hard"}
        </div>
      </div>

      {/* Win Score Control */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px"
      }}>
        <label style={{ 
          color: "#0ff", 
          fontSize: "0.9em", 
          fontWeight: "bold",
          textShadow: "0 0 5px rgba(0,255,255,0.3)"
        }}>
          🏁 Win Score: {winScore}
        </label>
        <input
          type="range"
          min="1"
          max="15"
          value={winScore}
          onChange={(e) => setWinScore(parseInt(e.target.value))}
          disabled={disabled}
          style={{
            accentColor: "#0ff",
            width: "120px"
          }}
        />
      </div>

      {/* Toggle Controls */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        {/* REMOVED: Pause button - completely deleted */}
        
        <button
          onClick={onMuteToggle}
          disabled={disabled}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            background: isMuted ? 
              "linear-gradient(45deg, #666, #444)" :
              "linear-gradient(45deg, #0ff, #0aa)",
            color: isMuted ? "#ccc" : "#000",
            fontWeight: "bold",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "0.9em",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
          }}
        >
          {isMuted ? "🔇 Muted" : "🔊 Sound"}
        </button>
      </div>

      {/* Game Mode Controls */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <button
          onClick={() => setTwoPlayer(!twoPlayer)}
          disabled={disabled}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            background: twoPlayer ? 
              "linear-gradient(45deg, #00ff00, #00aa00)" :
              "linear-gradient(45deg, #888, #666)",
            color: twoPlayer ? "#000" : "#ccc",
            fontWeight: "bold",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "0.9em",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
          }}
        >
          {twoPlayer ? "👥 2 Players" : "🤖 vs AI"}
        </button>

        <button
          onClick={() => setShowKeyConfig(!showKeyConfig)}
          disabled={disabled}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            background: showKeyConfig ? 
              "linear-gradient(45deg, #ff0, #aa0)" :
              "linear-gradient(45deg, #0ff, #0aa)",
            color: "#000",
            fontWeight: "bold",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "0.9em",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
          }}
        >
          ⌨️ {showKeyConfig ? "Hide Keys" : "Config Keys"}
        </button>
      </div>

      {disabled && (
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(255,100,100,0.8)",
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "15px",
          fontSize: "0.8em",
          fontWeight: "bold"
        }}>
          🔒 Host Only
        </div>
      )}
    </div>
  );
}
