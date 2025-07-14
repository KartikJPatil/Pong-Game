import React from "react";

export default function PowerUp({ x, y, size, type }) {
  // Types could affect color/shape (speed, enlarge, shrink, multiball, etc)
  let color = "#ff0";
  let symbol = "★";
  if (type === "enlarge") color = "#0f0", symbol = "⬛";
  if (type === "shrink") color = "#f00", symbol = "⬜";
  if (type === "multi") color = "#0ff", symbol = "●";

  return (
    <text
      x={x + size / 2}
      y={y + size / 2 + 8}
      textAnchor="middle"
      fontSize={size}
      fill={color}
      pointerEvents="none"
    >
      {symbol}
    </text>
  );
}