import React from "react";

function getBallSpeed(difficulty) {
  const speedMultiplier = 0.3 + (difficulty * 0.14);
  return (6 * speedMultiplier); // BASE_BALL_SPEED = 6
}

export default function GameStats({ difficulty, winScore, multiplayer, twoPlayer, theme }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      margin: "10px 0",
      padding: "15px",
      borderRadius: "10px",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(5px)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: theme.fg,
      fontSize: "14px",
      flexWrap: "wrap"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#0ff", fontWeight: "bold" }}>Ball Speed</div>
        <div>{getBallSpeed(difficulty).toFixed(1)}</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#0ff", fontWeight: "bold" }}>Difficulty</div>
        <div>{difficulty}/10</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#0ff", fontWeight: "bold" }}>Win Score</div>
        <div>{winScore}</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#0ff", fontWeight: "bold" }}>Mode</div>
        <div>{multiplayer ? "Online" : twoPlayer ? "2 Player" : "vs AI"}</div>
      </div>
    </div>
  );
}

export { getBallSpeed };
