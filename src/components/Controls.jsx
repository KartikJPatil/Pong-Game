import React from "react";

// Add disabled prop to all controls that should not be modifiable by guest in multiplayer
export default function Controls({
  difficulty, setDifficulty,
  theme, setTheme,
  isPaused, onPauseToggle,
  isMuted, onMuteToggle,
  twoPlayer, setTwoPlayer,
  showKeyConfig, setShowKeyConfig,
  winScore, setWinScore,
  disabled // <-- add this prop
}) {
  return (
    <div className="pong-controls">
      <label>
        Difficulty:
        <input
          type="range"
          min={1}
          max={10}
          value={difficulty}
          onChange={e => setDifficulty(Number(e.target.value))}
          disabled={disabled}
          style={{ marginLeft: 8 }}
        />
        <span style={{ marginLeft: 8 }}>{difficulty}</span>
      </label>
      <label style={{ marginLeft: 16 }}>
        Win Score:
        <input
          type="number"
          min={1}
          max={20}
          value={winScore}
          onChange={e => setWinScore(Number(e.target.value))}
          disabled={disabled}
          style={{ width: 50, marginLeft: 8 }}
        />
      </label>
      <label style={{ marginLeft: 16 }}>
        <button
          className="pong-btn"
          type="button"
          onClick={() => setShowKeyConfig(v => !v)}
          disabled={disabled}
        >
          Key Config
        </button>
      </label>
      <label style={{ marginLeft: 16 }}>
        <button
          className="pong-btn"
          type="button"
          onClick={onPauseToggle}
          disabled={disabled}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </label>
      <label style={{ marginLeft: 16 }}>
        <button
          className="pong-btn"
          type="button"
          onClick={onMuteToggle}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </label>
      <label style={{ marginLeft: 16 }}>
        <input
          type="checkbox"
          checked={twoPlayer}
          onChange={e => setTwoPlayer(e.target.checked)}
          disabled={disabled}
        /> Two Player (local)
      </label>
    </div>
  );
}
