import React from "react";

export default function Paddle({ x, y, width, height, color, gradient }) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={gradient ? `url(#${gradient})` : color || "#fff"}
      rx={10}
    />
  );
}