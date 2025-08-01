// Game utility functions

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
  
  export function getBallSpeed(difficulty) {
    const speedMultiplier = 0.3 + (difficulty * 0.14);
    return 6 * speedMultiplier; // BASE_BALL_SPEED = 6
  }
  
  export function playBeep(f, d, v, mute) {
    if (mute) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = f;
      gain.gain.value = v || 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, d);
    } catch {}
  }
  
  export const GAME_CONSTANTS = {
    WIDTH: 600,
    HEIGHT: 400,
    PADDLE_HEIGHT: 80,
    PADDLE_WIDTH: 12,
    BALL_SIZE: 14,
    BASE_PADDLE_SPEED: 8,
    BASE_BALL_SPEED: 6,
    TRAIL_LEN: 15
  };
  
  export const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  