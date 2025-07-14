import React from "react";

export default function Scoreboard({ left, right, winningScore, winner, onRestart }) {
  return (
    <div style={{
      color: "#fff",
      fontSize: "2em",
      margin: "1em",
      textAlign: "center"
    }}>
      <div>
        {left} : {right}
      </div>
      {winner && (
        <div style={{ margin: "1em 0", fontSize: "1.2em", color: "#0ff" }}>
          Winner: {winner}
          <button style={{
            marginLeft: 16, background: "#0ff", color: "#111",
            border: "none", borderRadius: 8, padding: "0.5em 1.2em",
            fontWeight: "bold", cursor: "pointer"
          }}
          onClick={onRestart}>Play Again</button>
        </div>
      )}
      <div style={{ fontSize: "0.6em", color: "#aaa" }}>
        First to {winningScore} wins!
      </div>
    </div>
  );
}