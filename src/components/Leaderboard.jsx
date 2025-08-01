import React from "react";

export default function Leaderboard({ scores }) {
  if (!scores || scores.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "30px",
        color: "#666",
        fontStyle: "italic"
      }}>
        <div style={{ fontSize: "2em", marginBottom: "10px" }}>🏆</div>
        <div>No games played yet</div>
        <div style={{ fontSize: "0.9em", marginTop: "5px" }}>
          Play some games to see your scores here!
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: "15px",
      padding: "20px",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)"
    }}>
      <h3 style={{
        margin: "0 0 20px 0",
        textAlign: "center",
        color: "#0ff",
        textShadow: "0 0 10px rgba(0,255,255,0.5)"
      }}>
        🏆 Recent Games
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {scores.slice(0, 5).map((game, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 15px",
              background: index === 0 ? 
                "linear-gradient(90deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1))" :
                "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              border: index === 0 ? "1px solid #0ff" : "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.3s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                fontSize: "1.2em",
                color: index === 0 ? "#ffd700" : "#ccc"
              }}>
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
              </div>
              
              <div style={{
                fontSize: "1.1em",
                fontWeight: "bold",
                color: game.winner === "Left" ? "#0ff" : "#f0f",
                textShadow: `0 0 5px ${game.winner === "Left" ? "rgba(0,255,255,0.5)" : "rgba(255,0,255,0.5)"}`
              }}>
                {game.left} - {game.right}
              </div>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "2px"
            }}>
              <div style={{
                color: game.winner === "Left" ? "#0ff" : "#f0f",
                fontSize: "0.9em",
                fontWeight: "bold"
              }}>
                {game.winner} Won
              </div>
              <div style={{
                color: "#888",
                fontSize: "0.7em"
              }}>
                {game.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {scores.length > 5 && (
        <div style={{
          textAlign: "center",
          marginTop: "15px",
          color: "#666",
          fontSize: "0.9em"
        }}>
          ... and {scores.length - 5} more games
        </div>
      )}
    </div>
  );
}
