import React from "react";

export default function Paddle({ x, y, width, height, color, gradient, isActive = false }) {
  return (
    <g>
      {/* Paddle glow effect */}
      <rect
        x={x - 2}
        y={y - 2}
        width={width + 4}
        height={height + 4}
        fill={gradient ? `url(#${gradient})` : color}
        opacity="0.3"
        rx="2"
      />
      
      {/* Main paddle */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={gradient ? `url(#${gradient})` : color}
        rx="2"
        filter={isActive ? "url(#paddleGlow)" : "none"}
        style={{
          transition: "all 0.2s ease"
        }}
      />
      
      {/* Highlight strip */}
      <rect
        x={x + 1}
        y={y + 2}
        width={Math.max(1, width - 2)}
        height={height - 4}
        fill="rgba(255,255,255,0.3)"
        rx="1"
      />

      {/* Add glow filter definition */}
      <defs>
        <filter id="paddleGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </g>
  );
}
