import React from "react";

const themes = {
  classic: {
    bg: "#111", fg: "#fff", ball: "#ff0", left: "#fff", right: "#fff",
    gradL: "paddleL", gradR: "paddleR"
  },
  retro: {
    bg: "#223", fg: "#0f0", ball: "#f80", left: "#0f0", right: "#0f0",
    gradL: "retroL", gradR: "retroR"
  },
  neon: {
    bg: "#141036", fg: "#0ff", ball: "#f0f", left: "#0ff", right: "#f0f",
    gradL: "neonL", gradR: "neonR"
  },
  dark: {
    bg: "#222", fg: "#eee", ball: "#eee", left: "#fff", right: "#fff",
    gradL: "", gradR: ""
  }
};

export default function GameHeader({ theme, setTheme }) {
  function ThemePicker() {
    return (
      <div style={{
        display: "flex", 
        gap: "8px", 
        margin: "15px auto", 
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "10px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <span style={{ color: "#0ff", fontWeight: "bold", marginRight: "10px", alignSelf: "center" }}>Theme:</span>
        {Object.keys(themes).map(thm => {
          // Get better text colors for each theme
          const getTextColor = (themeName) => {
            switch(themeName) {
              case 'classic': return "#0ff"; // Cyan text for classic
              case 'retro': return "#0f0";   // Green text for retro
              case 'neon': return "#f0f";    // Magenta text for neon
              case 'dark': return "#eee";    // Light gray text for dark
              default: return "#fff";
            }
          };

          const textColor = getTextColor(thm);
          const isSelected = theme === thm;

          return (
            <button
              key={thm}
              style={{
                background: isSelected 
                  ? `linear-gradient(145deg, ${themes[thm].bg}, rgba(0,255,255,0.2))` 
                  : themes[thm].bg,
                color: textColor, // Use the better text color
                border: isSelected ? "2px solid #0ff" : "1px solid #555",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: isSelected ? "bold" : "normal",
                fontSize: "14px",
                transition: "all 0.3s ease",
                boxShadow: isSelected ? "0 0 15px rgba(0,255,255,0.5)" : "0 2px 5px rgba(0,0,0,0.3)",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)" // Add text shadow for better readability
              }}
              onClick={() => setTheme(thm)}
              aria-label={`Switch to ${thm} theme`}
              onMouseEnter={(e) => {
                if (theme !== thm) {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
                  e.target.style.color = "#0ff"; // Highlight color on hover
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== thm) {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
                  e.target.style.color = textColor; // Restore original color
                }
              }}
            >
              {thm.charAt(0).toUpperCase() + thm.slice(1)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{
      textAlign: "center",
      marginBottom: "20px",
      color: "#0ff",
      textShadow: "0 0 20px rgba(0,255,255,0.5)"
    }}>
      <h1 style={{ 
        fontSize: "3em", 
        margin: "0", 
        fontWeight: "bold",
        background: "linear-gradient(45deg, #0ff, #f0f)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}>
        PONG
      </h1>
      <p style={{ margin: "5px 0", fontSize: "1.2em", opacity: 0.8 }}>
        React Edition
      </p>
      <ThemePicker />
    </div>
  );
}

export { themes };
