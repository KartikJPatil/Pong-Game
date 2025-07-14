import React from "react";

export default function Controls({
  difficulty,
  setDifficulty,
  theme,
  setTheme,
  isPaused,
  onPauseToggle,
  isMuted,
  onMuteToggle,
  twoPlayer,
  setTwoPlayer,
  showKeyConfig,
  setShowKeyConfig,
  winScore,
  setWinScore
}) {
  return (
    <div className="pong-controls-bar">
      <label>
        AI Level:
        <input
          className="pong-slider"
          type="range"
          min="1"
          max="10"
          value={difficulty}
          onChange={e => setDifficulty(+e.target.value)}
        />
        <span>{difficulty}</span>
      </label>
      <label>
        Theme:
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="classic">Classic</option>
          <option value="retro">Retro</option>
          <option value="neon">Neon</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label>
        Win Score:
        <input
          className="pong-slider"
          type="range"
          min="3"
          max="20"
          value={winScore}
          onChange={e => setWinScore(+e.target.value)}
        />{" "}
        <span>{winScore}</span>
      </label>
      <button className="pong-btn" onClick={onPauseToggle}>
        {isPaused ? "Resume" : "Pause"}
      </button>
      <button className="pong-btn" onClick={onMuteToggle}>
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <label>
        <input
          type="checkbox"
          checked={twoPlayer}
          onChange={e => setTwoPlayer(e.target.checked)}
        />{" "}
        2 Player
      </label>
      <button
        className="pong-btn"
        onClick={() => setShowKeyConfig(v => !v)}
      >
        {showKeyConfig ? "Hide Controls" : "Custom Controls"}
      </button>
    </div>
  );
}