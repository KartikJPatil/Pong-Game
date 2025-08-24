// Game Constants
export const GAME_CONSTANTS = {
  WIDTH: 800,
  HEIGHT: 400,
  PADDLE_HEIGHT: 100,
  PADDLE_WIDTH: 20,
  BALL_SIZE: 20,
  BASE_PADDLE_SPEED: 8,
  BASE_BALL_SPEED: 5,
  TRAIL_LEN: 8
};

// Individual exports for easier access
export const { 
  WIDTH, 
  HEIGHT, 
  PADDLE_HEIGHT, 
  PADDLE_WIDTH, 
  BALL_SIZE, 
  BASE_PADDLE_SPEED, 
  BASE_BALL_SPEED, 
  TRAIL_LEN 
} = GAME_CONSTANTS;

// ✅ FIXED: Replace with your ACTUAL Render URL
export const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pong-game-backend-b100.onrender.com'  // ← PUT YOUR REAL URL HERE
  : 'http://localhost:4000';

// Utility Functions
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getBallSpeed(difficulty) {
  return BASE_BALL_SPEED + (difficulty - 1) * 0.5;
}

export function playBeep(frequency, duration, volume, isMuted) {
  if (isMuted) return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
}
