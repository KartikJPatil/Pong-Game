// Make sure your SOCKET_URL is correct
export const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://YOUR-RENDER-SERVER-URL.onrender.com'  // Replace with your actual Render URL
  : 'http://localhost:4000';

// Other existing exports...
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
