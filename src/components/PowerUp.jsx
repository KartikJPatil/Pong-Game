import React from "react";

export default function PowerUp({ x, y, size, type }) {
  const powerUpStyles = {
    enlarge: { 
      color: "#0f0", 
      symbol: "⬛", 
      glow: "0 0 20px rgba(0,255,0,0.8)",
      description: "Enlarge Paddle"
    },
    shrink: { 
      color: "#f00", 
      symbol: "⬜", 
      glow: "0 0 20px rgba(255,0,0,0.8)",
      description: "Shrink Paddle"
    },
    multi: { 
      color: "#0ff", 
      symbol: "●", 
      glow: "0 0 20px rgba(0,255,255,0.8)",
      description: "Speed Boost"
    }
  };

  const style = powerUpStyles[type] || powerUpStyles.enlarge;

  return (
    <g>
      {/* Rotating background circle */}
      <circle
        cx={x + size/2}
        cy={y + size/2}
        r={size/2 + 3}
        fill="none"
        stroke={style.color}
        strokeWidth="2"
        opacity="0.3"
        strokeDasharray="5,5"
        transform={`rotate(${Date.now() / 20} ${x + size/2} ${y + size/2})`}
      />
      
      {/* Main power-up circle */}
      <circle
        cx={x + size/2}
        cy={y + size/2}
        r={size/2}
        fill={style.color}
        opacity="0.8"
        filter="url(#powerupGlow)"
        style={{
          animation: "powerupPulse 1.5s infinite"
        }}
      />
      
      {/* Symbol */}
      <text
        x={x + size/2}
        y={y + size/2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size/2}
        fill="#000"
        fontWeight="bold"
      >
        {style.symbol}
      </text>

      {/* Add glow filter definition */}
      <defs>
        <filter id="powerupGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </g>
  );
}
