import React from "react";
import Paddle from "./Paddle";
import Ball from "./Ball";
import PowerUp from "./PowerUp";

export default function GameBoard({
  svgW,
  svgH,
  WIDTH,
  HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_SIZE,
  theme,
  leftPaddle,
  rightPaddle,
  ball,
  trail,
  powerUp,
  boardAreaRef
}) {
  
  function renderDefs() {
    return (
      <defs>
        <linearGradient id="paddleL" x1="0" y1="0" x2="0" y2={PADDLE_HEIGHT} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#ccc" />
        </linearGradient>
        <linearGradient id="paddleR" x1="0" y1="0" x2="0" y2={PADDLE_HEIGHT} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#999" />
        </linearGradient>
        <linearGradient id="retroL" x1="0" y1="0" x2={PADDLE_WIDTH} y2={PADDLE_HEIGHT} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f0" /><stop offset="100%" stopColor="#080" />
        </linearGradient>
        <linearGradient id="retroR" x1="0" y1="0" x2={PADDLE_WIDTH} y2={PADDLE_HEIGHT} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f0" /><stop offset="100%" stopColor="#4f0" />
        </linearGradient>
        <linearGradient id="neonL" x1="0" y1="0" x2="0" y2={PADDLE_HEIGHT} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ff" /><stop offset="100%" stopColor="#044" />
        </linearGradient>
        <linearGradient id="neonR" x1="0" y1="0" x2="0" y2={PADDLE_HEIGHT} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0f" /><stop offset="100%" stopColor="#404" />
        </linearGradient>
      </defs>
    );
  }

  return (
    <div 
      ref={boardAreaRef} 
      className="pong-board-area" 
      style={{ 
        width: svgW, 
        height: svgH, 
        maxWidth: "100%", 
        position: "relative",
        margin: "20px 0",
        borderRadius: "15px",
        overflow: "hidden",
        boxShadow: "0 0 30px rgba(0,255,255,0.3)"
      }}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ 
          background: theme.bg, 
          border: `3px solid ${theme.fg}`, 
          maxWidth: "100%",
          borderRadius: "15px"
        }}
        aria-label="Pong game area"
      >
        {renderDefs()}
        {/* Center line */}
        <line
          x1={WIDTH/2} y1={0} x2={WIDTH/2} y2={HEIGHT}
          stroke={theme.fg} strokeDasharray="10,12" strokeWidth="2"
        />
        {/* Paddles */}
        <Paddle x={0} y={leftPaddle} width={PADDLE_WIDTH} height={PADDLE_HEIGHT} color={theme.left} gradient={theme.gradL}/>
        <Paddle x={WIDTH-PADDLE_WIDTH} y={rightPaddle} width={PADDLE_WIDTH} height={PADDLE_HEIGHT} color={theme.right} gradient={theme.gradR}/>
        {/* Ball with trail */}
        <Ball x={ball.x} y={ball.y} size={BALL_SIZE} color={theme.ball} trail={trail}/>
        {/* Power-up */}
        {powerUp && <PowerUp x={powerUp.x} y={powerUp.y} size={powerUp.size} type={powerUp.type}/>}
      </svg>
    </div>
  );
}
