import React from "react";

export default function Ball({ x, y, size, color, trail = [] }) {
  return (
    <g>
      {/* Trail effect */}
      {trail && trail.map((t, i) => (
        <circle
          key={i}
          cx={t.x + size/2}
          cy={t.y + size/2}
          r={(size/2) * (1 - i/trail.length) * 0.8}
          fill={color}
          opacity={(1 - i/trail.length) * 0.4}
          filter="url(#ballTrailGlow)"
        />
      ))}

      {/* Ball glow effect */}
      <circle
        cx={x + size/2}
        cy={y + size/2}
        r={size/2 + 3}
        fill={color}
        opacity="0.3"
        filter="url(#ballGlow)"
      />

      {/* Main ball */}
      <circle
        cx={x + size/2}
        cy={y + size/2}
        r={size/2}
        fill={color}
        filter="url(#ballGlow)"
      />

      {/* Ball highlight */}
      <circle
        cx={x + size/2 - 2}
        cy={y + size/2 - 2}
        r={size/4}
        fill="rgba(255,255,255,0.6)"
      />

      {/* Add glow filter definitions */}
      <defs>
        <filter id="ballGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="ballTrailGlow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </g>
  );
}
