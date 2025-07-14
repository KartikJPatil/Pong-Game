import React from "react";

export default function Leaderboard({ scores }) {
  // scores: array of { left, right, winner, date }
  return (
    <div style={{
      background: "#222c", color: "#fff", padding: "0.7em 1em", borderRadius: 8,
      margin: "1em auto", textAlign: "center", maxWidth: 350
    }}>
      <h4>Local Leaderboard</h4>
      <table style={{ width: "100%", color: "#fff", background: "none" }}>
        <thead>
          <tr style={{ color: "#0ff" }}>
            <th>Date</th>
            <th>Left</th>
            <th>Right</th>
            <th>Winner</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr key={i}>
              <td style={{ fontSize: "0.8em" }}>{s.date}</td>
              <td>{s.left}</td>
              <td>{s.right}</td>
              <td style={{ color: s.winner === "Left" ? "#0f0" : "#f00" }}>
                {s.winner}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}