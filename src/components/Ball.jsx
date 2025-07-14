import React from "react";

export default function Ball({ x, y, size, color, trail }) {
  return (
    <g>
      {trail && trail.map((t, i) => (
        <circle
          key={i}
          cx={t.x}
          cy={t.y}
          r={size/2}
          fill={color}
          opacity={0.2 * (1 - i / trail.length)}
        />
      ))}
      <circle cx={x + size/2} cy={y + size/2} r={size/2} fill={color} />
    </g>
  );
}