import React from "react";

export default function Scoreboard({ left, right, winningScore, winner, onRestart }) {
  const leftPercentage = (left / winningScore) * 100;
  const rightPercentage = (right / winningScore) * 100;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px",
      padding: "20px",
      borderRadius: "15px",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)",
      minWidth: "300px"
    }}>
      {/* Score Display */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        fontSize: "2.5em",
        fontWeight: "bold"
      }}>
        <div style={{
          color: "#0ff",
          textShadow: "0 0 20px rgba(0,255,255,0.5)",
          textAlign: "center",
          flex: 1
        }}>
          <div>{left}</div>
          <div style={{ fontSize: "0.3em", opacity: 0.7 }}>LEFT</div>
        </div>
        
        <div style={{
          color: "#fff",
          fontSize: "0.6em",
          margin: "0 20px",
          opacity: 0.8
        }}>
          VS
        </div>
        
        <div style={{
          color: "#f0f",
          textShadow: "0 0 20px rgba(255,0,255,0.5)",
          textAlign: "center",
          flex: 1
        }}>
          <div>{right}</div>
          <div style={{ fontSize: "0.3em", opacity: 0.7 }}>RIGHT</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        gap: "15px"
      }}>
        {/* Left Progress */}
        <div style={{ flex: 1 }}>
          <div style={{
            height: "8px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #0ff, #0aa)",
              width: `${leftPercentage}%`,
              transition: "width 0.5s ease",
              borderRadius: "4px"
            }} />
          </div>
        </div>

        <div style={{
          color: "#fff",
          fontSize: "0.9em",
          opacity: 0.6,
          minWidth: "60px",
          textAlign: "center"
        }}>
          First to {winningScore}
        </div>

        {/* Right Progress */}
        <div style={{ flex: 1 }}>
          <div style={{
            height: "8px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #f0f, #a0a)",
              width: `${rightPercentage}%`,
              transition: "width 0.5s ease",
              borderRadius: "4px"
            }} />
          </div>
        </div>
      </div>

      {/* Winner Display */}
      {winner && (
        <div style={{
          background: "linear-gradient(45deg, #0ff, #f0f)",
          color: "#000",
          padding: "10px 20px",
          borderRadius: "20px",
          fontWeight: "bold",
          fontSize: "1.2em",
          boxShadow: "0 0 30px rgba(0,255,255,0.5)",
          animation: "pulse 2s infinite"
        }}>
          🏆 {winner} Player Wins! 🏆
        </div>
      )}
    </div>
  );
}
