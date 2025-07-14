import React from "react";

export default function KeyConfig({ keyMap, setKeyMap }) {
  // keyMap: { leftUp, leftDown, rightUp, rightDown }
  function handleChange(side, dir, e) {
    setKeyMap(km => ({
      ...km,
      [side + dir]: e.target.value
    }));
  }
  return (
    <div style={{
      background: "#222c", color: "#fff", padding: "1em", borderRadius: 10,
      margin: "1em auto", textAlign: "center", maxWidth: 400
    }}>
      <h4>Custom Key Bindings</h4>
      <div>
        <label>
          Left Up:
          <input value={keyMap.leftUp} maxLength={1}
            onChange={e => handleChange("left", "Up", e)}
            style={{ width: 32, margin: "0 1em" }}
          />
        </label>
        <label>
          Left Down:
          <input value={keyMap.leftDown} maxLength={1}
            onChange={e => handleChange("left", "Down", e)}
            style={{ width: 32, margin: "0 1em" }}
          />
        </label>
      </div>
      <div>
        <label>
          Right Up:
          <input value={keyMap.rightUp} maxLength={1}
            onChange={e => handleChange("right", "Up", e)}
            style={{ width: 32, margin: "0 1em" }}
          />
        </label>
        <label>
          Right Down:
          <input value={keyMap.rightDown} maxLength={1}
            onChange={e => handleChange("right", "Down", e)}
            style={{ width: 32, margin: "0 1em" }}
          />
        </label>
      </div>
    </div>
  );
}