import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./PongGame.css";
import Paddle from "./Paddle";
import Ball from "./Ball";
import Scoreboard from "./Scoreboard";
import PowerUp from "./PowerUp";
import Controls from "./Controls";
import KeyConfig from "./KeyConfig";
import Leaderboard from "./Leaderboard";
import Modal from "react-modal";

// Constants
const WIDTH = 600, HEIGHT = 400, PADDLE_HEIGHT = 80, PADDLE_WIDTH = 12, BALL_SIZE = 14;
const BASE_PADDLE_SPEED = 8, BASE_BALL_SPEED = 6;
const TRAIL_LEN = 15;
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function playBeep(f, d, v, mute) {
  if (mute) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = f;
    gain.gain.value = v || 0.04;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, d);
  } catch {}
}

const themes = {
  classic: {
    bg: "#111", fg: "#fff", ball: "#ff0", left: "#fff", right: "#fff",
    gradL: "paddleL", gradR: "paddleR"
  },
  retro: {
    bg: "#223", fg: "#0f0", ball: "#f80", left: "#0f0", right: "#0f0",
    gradL: "retroL", gradR: "retroR"
  },
  neon: {
    bg: "#141036", fg: "#0ff", ball: "#f0f", left: "#0ff", right: "#f0f",
    gradL: "neonL", gradR: "neonR"
  },
  dark: {
    bg: "#222", fg: "#eee", ball: "#eee", left: "#fff", right: "#fff",
    gradL: "", gradR: ""
  }
};

export default function PongGame() {
  // State
  const [leftPaddle, setLeftPaddle] = useState(HEIGHT/2 - PADDLE_HEIGHT/2);
  const [rightPaddle, setRightPaddle] = useState(HEIGHT/2 - PADDLE_HEIGHT/2);
  const [ball, setBall] = useState({
    x: WIDTH/2 - BALL_SIZE/2, y: HEIGHT/2 - BALL_SIZE/2,
    dx: BASE_BALL_SPEED, dy: BASE_BALL_SPEED, speed: BASE_BALL_SPEED
  });
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [winner, setWinner] = useState("");
  const [running, setRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState(5);
  const [theme, setTheme] = useState("classic");
  const [isMuted, setIsMuted] = useState(false);
  const [twoPlayer, setTwoPlayer] = useState(false); // For local 2p only; multiplayer disables this
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keyMap, setKeyMap] = useState({
    leftUp: "w", leftDown: "s", rightUp: "ArrowUp", rightDown: "ArrowDown"
  });
  // Touch
  const [touchDirL, setTouchDirL] = useState(0), [touchDirR, setTouchDirR] = useState(0);
  // Ball trail
  const [trail, setTrail] = useState([]);
  // Power-ups
  const [powerUp, setPowerUp] = useState(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  // Leaderboard
  const [scores, setScores] = useState(() => JSON.parse(localStorage.getItem("pong-leaderboard")||"[]"));
  // Win Score (configurable!)
  const [winScore, setWinScore] = useState(5);

  // Multiplayer (Socket.io)
  const [socket, setSocket] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState("");
  const [multiplayer, setMultiplayer] = useState(false);
  const [players, setPlayers] = useState(1);
  const [side, setSide] = useState(""); // "host" or "guest"

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Leaderboard modal
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // For local keyboard
  const keys = useRef({});
  const animationRef = useRef();
  const boardAreaRef = useRef();
  const [boardRect, setBoardRect] = useState(null);

  // Keep boardRect updated for touch controls
  useEffect(() => {
    function updateRect() {
      if (boardAreaRef.current) setBoardRect(boardAreaRef.current.getBoundingClientRect());
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [/* no deps needed, fires once + on resize */]);

  // Key Handling
  useEffect(() => {
    const down = e => { keys.current[e.key] = true; };
    const up = e => { keys.current[e.key] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Multiplayer: join/create room, setup socket
  function startMultiplayer(roomCode) {
    if (socket) socket.disconnect();
    const s = io(SOCKET_URL);
    setSocket(s);
    setRoom(roomCode);
    setMultiplayer(true);
    setTwoPlayer(false); // Disable local 2p if entering multiplayer!
    s.emit("join", { room: roomCode });

    s.on("players", count => setPlayers(count));
    s.on("host", () => { setIsHost(true); setSide("host"); });
    s.on("side", _side => setSide(_side));
    s.on("full", () => { alert("Room is full"); s.disconnect(); setMultiplayer(false); setIsHost(false); setSide(""); });

    // Receive state from host if guest
    s.on("state_update", (state) => {
      if (side === "guest") {
        setLeftPaddle(state.leftPaddle);
        setRightPaddle(state.rightPaddle);
        setBall(state.ball);
        setScore(state.score);
        setPowerUp(state.powerUp);
        setTrail(state.trail);
        setWinner(state.winner);
        setRunning(state.running);
      }
    });

    // Host receives guest paddle input
    s.on("guest_paddle_input", (input) => {
      if (isHost) setRightPaddle(input);
    });

    // Chat
    s.on("chat", ({ msg, sender }) => {
      setChatMessages(msgs => [...msgs, { msg, sender }]);
    });

    s.on("disconnect", () => {
      setMultiplayer(false);
      setSocket(null);
      setIsHost(false);
      setPlayers(1);
      setRoom("");
      setSide("");
      alert("Disconnected from multiplayer server.");
    });
  }

  // Game Loop
  useEffect(() => {
    if (!running || isPaused || winner) return;
    if (multiplayer && !isHost) return; // only host runs loop in multiplayer

    function gameLoop() {
      let lPad = leftPaddle, rPad = rightPaddle;
      let {x, y, dx, dy, speed} = ball;
      // Paddle movement (keyboard/touch)
      let lUp = keys.current[keyMap.leftUp] || touchDirL === -1, lDn = keys.current[keyMap.leftDown] || touchDirL === 1;
      let rUp = keys.current[keyMap.rightUp] || touchDirR === -1, rDn = keys.current[keyMap.rightDown] || touchDirR === 1;
      let paddleSpeed = BASE_PADDLE_SPEED + (difficulty-5);
      if (lUp) lPad -= paddleSpeed;
      if (lDn) lPad += paddleSpeed;

      if (multiplayer) {
        // Host: right paddle is controlled by guest's paddle input (already setRightPaddle via guest_paddle_input)
      } else if (twoPlayer) {
        if (rUp) rPad -= paddleSpeed;
        if (rDn) rPad += paddleSpeed;
      } else {
        // AI: follow ball
        let aiCenter = rPad + PADDLE_HEIGHT/2;
        let aiTarget = y + BALL_SIZE/2 + (Math.random()*8-4);
        let aiSpeed = BASE_PADDLE_SPEED + (difficulty*1.5);
        if (aiCenter < aiTarget - 8) rPad += aiSpeed;
        else if (aiCenter > aiTarget + 8) rPad -= aiSpeed;
      }
      lPad = clamp(lPad, 0, HEIGHT-PADDLE_HEIGHT);
      rPad = clamp(rPad, 0, HEIGHT-PADDLE_HEIGHT);

      // Ball movement
      x += dx;
      y += dy;
      let curSpeed = Math.sqrt(dx*dx+dy*dy);

      // Trail
      setTrail(trail => {
        let next = [{x, y}, ...trail];
        if (next.length > TRAIL_LEN) next.pop();
        return next;
      });

      // Collisions: Top/Bottom
      if (y <= 0 || y+BALL_SIZE >= HEIGHT) {
        dy = -dy;
        playBeep(800, 60, 0.08, isMuted);
      }
      // Collisions: Left paddle
      if (
        x <= PADDLE_WIDTH &&
        y+BALL_SIZE > lPad &&
        y < lPad+PADDLE_HEIGHT
      ) {
        x = PADDLE_WIDTH;
        let impact = (y + BALL_SIZE/2 - (lPad + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        let angle = impact * Math.PI/4;
        curSpeed *= 1.08; // speed up
        dx = Math.abs(curSpeed * Math.cos(angle));
        dy = curSpeed * Math.sin(angle);
        playBeep(400, 80, 0.08, isMuted);
      }
      // Collisions: Right paddle
      if (
        x+BALL_SIZE >= WIDTH-PADDLE_WIDTH &&
        y+BALL_SIZE > rPad &&
        y < rPad+PADDLE_HEIGHT
      ) {
        x = WIDTH-PADDLE_WIDTH-BALL_SIZE;
        let impact = (y + BALL_SIZE/2 - (rPad + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        let angle = impact * Math.PI/4;
        curSpeed *= 1.08;
        dx = -Math.abs(curSpeed * Math.cos(angle));
        dy = curSpeed * Math.sin(angle);
        playBeep(200, 80, 0.08, isMuted);
      }

      // Power-up collision
      if (powerUp && x+BALL_SIZE > powerUp.x && x < powerUp.x+powerUp.size &&
          y+BALL_SIZE > powerUp.y && y < powerUp.y+powerUp.size) {
        // Apply power-up
        if (powerUp.type === "enlarge") {
          setLeftPaddle(lPad => clamp(lPad, 0, HEIGHT-(PADDLE_HEIGHT*1.7)));
          setRightPaddle(rPad => clamp(rPad, 0, HEIGHT-(PADDLE_HEIGHT*1.7)));
        }
        if (powerUp.type === "shrink") {
          setLeftPaddle(lPad => clamp(lPad, 0, HEIGHT-(PADDLE_HEIGHT*0.7)));
          setRightPaddle(rPad => clamp(rPad, 0, HEIGHT-(PADDLE_HEIGHT*0.7)));
        }
        if (powerUp.type === "multi") {
          dx *= 1.5; dy *= 1.5;
        }
        setPowerUp(null);
        playBeep(1000, 120, 0.12, isMuted);
      }

      // Scoring
      let newScore = {...score};
      let scored = false, win = "";
      if (x < 0) {
        newScore.right += 1; scored = true;
        playBeep(120, 300, 0.18, isMuted);
        if (newScore.right >= winScore) win = "Right";
      } else if (x > WIDTH-BALL_SIZE) {
        newScore.left += 1; scored = true;
        playBeep(800, 300, 0.18, isMuted);
        if (newScore.left >= winScore) win = "Left";
      }
      if (scored) {
        setLeftPaddle(HEIGHT/2-PADDLE_HEIGHT/2);
        setRightPaddle(HEIGHT/2-PADDLE_HEIGHT/2);
        setBall({
          x: WIDTH/2-BALL_SIZE/2, y: HEIGHT/2-BALL_SIZE/2,
          dx: (Math.random()>0.5?1:-1)*BASE_BALL_SPEED,
          dy: (Math.random()>0.5?1:-1)*BASE_BALL_SPEED,
          speed: BASE_BALL_SPEED
        });
        setScore(newScore);
        setTrail([]);
        setPowerUp(null);
        setPowerUpTimer(0);
        if (win) {
          setWinner(win);
          let now = new Date();
          let entry = {
            left: newScore.left, right: newScore.right, winner: win,
            date: now.toLocaleDateString()+" "+now.toLocaleTimeString()
          };
          let nextScores = [entry, ...scores].slice(0, 5);
          setScores(nextScores);
          localStorage.setItem("pong-leaderboard", JSON.stringify(nextScores));
          setRunning(false);
        }
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      setLeftPaddle(lPad);
      setRightPaddle(rPad);
      setBall({ x, y, dx, dy, speed: curSpeed });

      if (!powerUp && (powerUpTimer > 200 + Math.random()*400)) {
        let px = Math.random()*(WIDTH-80)+40, py = Math.random()*(HEIGHT-60)+30;
        let types = ["enlarge","shrink","multi"];
        setPowerUp({
          x: px, y: py, size: 26, type: types[Math.floor(Math.random()*types.length)]
        });
        setPowerUpTimer(0);
      } else if (!powerUp) {
        setPowerUpTimer(t => t+1);
      }

      // Multiplayer: Host sends state to guest
      if (multiplayer && isHost && socket) {
        socket.emit("sync_state", { room, state: {
          leftPaddle: lPad, rightPaddle: rPad, ball: { x, y, dx, dy, speed: curSpeed }, score: newScore,
          powerUp, trail, winner, running
        } });
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    }
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [leftPaddle, rightPaddle, ball, score, running, isPaused, touchDirL, touchDirR, keyMap, difficulty, powerUp, winner, winScore, isMuted, twoPlayer, theme, scores, multiplayer, isHost, socket, room]);

  // Multiplayer: Guest sends paddle input (left paddle)
  useEffect(() => {
    if (multiplayer && socket && !isHost && side === "guest") {
      socket.emit("paddle_input", { room, input: leftPaddle });
    }
  }, [leftPaddle, multiplayer, socket, isHost, room, side]);

  // Chat handling
  function handleSendChat(e) {
    e.preventDefault();
    if (socket && chatInput.trim()) {
      socket.emit("chat", { room, msg: chatInput.trim(), sender: side || "anon" });
      setChatInput("");
    }
  }

  // Touch Controls (placed just outside the SVG court, vertically centered)
  function TouchControls({side, boardRect}) {
    if (!boardRect) return null;
    const btnStyle = {
      position: "fixed",
      left: side === "left"
        ? boardRect.left - 60
        : boardRect.left + boardRect.width + 10,
      top: boardRect.top + boardRect.height/2 - 60,
      zIndex: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    };
    return (
      <div style={btnStyle}>
        <button
          className="pong-touch-btn"
          onTouchStart={() => side==="left"?setTouchDirL(-1):setTouchDirR(-1)}
          onTouchEnd={() => side==="left"?setTouchDirL(0):setTouchDirR(0)}
        >▲</button>
        <button
          className="pong-touch-btn"
          onTouchStart={() => side==="left"?setTouchDirL(1):setTouchDirR(1)}
          onTouchEnd={() => side==="left"?setTouchDirL(0):setTouchDirR(0)}
        >▼</button>
      </div>
    );
  }

  // Start/Restart
  function handleStart() {
    setScore({left:0, right:0});
    setBall({
      x: WIDTH/2-BALL_SIZE/2, y: HEIGHT/2-BALL_SIZE/2,
      dx: (Math.random()>0.5?1:-1)*BASE_BALL_SPEED,
      dy: (Math.random()>0.5?1:-1)*BASE_BALL_SPEED,
      speed: BASE_BALL_SPEED
    });
    setLeftPaddle(HEIGHT/2-PADDLE_HEIGHT/2);
    setRightPaddle(HEIGHT/2-PADDLE_HEIGHT/2);
    setWinner("");
    setTrail([]);
    setPowerUp(null);
    setPowerUpTimer(0);
    setRunning(true);
  }

  // Theme SVG gradients
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

  useEffect(() => {
    if (winner) {
      document.title = `Pong Winner: ${winner}`;
    } else {
      document.title = `Pong ${score.left}:${score.right}`;
    }
  }, [score, winner]);

  const [svgW, setSvgW] = useState(WIDTH), [svgH, setSvgH] = useState(HEIGHT);
  useEffect(() => {
    function handleResize() {
      let w = Math.min(window.innerWidth-20, WIDTH);
      let h = Math.round(w * HEIGHT/WIDTH);
      setSvgW(w); setSvgH(h);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Multiplayer UI
  const [roomInput, setRoomInput] = useState("");
  const t = themes[theme];

  // Theme picker UI
  function ThemePicker() {
    return (
      <div className="pong-theme-picker">
        {Object.keys(themes).map(thm => (
          <button
            key={thm}
            className={`pong-theme-btn${theme === thm ? " selected" : ""}`}
            style={{
              background: themes[thm].bg,
              color: themes[thm].fg,
              border: theme === thm ? "2.5px solid #0ff" : "1.5px solid #888"
            }}
            onClick={() => setTheme(thm)}
            aria-label={`Switch to ${thm} theme`}
          >
            {thm.charAt(0).toUpperCase() + thm.slice(1)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="pong-container">
      {/* --- SCOREBOARD MODAL --- */}
      <Modal
        isOpen={!!winner}
        onRequestClose={() => setWinner("")}
        className="pong-modal"
        overlayClassName="pong-modal-overlay"
        ariaHideApp={false}
      >
        <h2 style={{ fontSize: 32, margin: "0.5em 0" }}>{winner} Wins!</h2>
        <p style={{ fontSize: 22, margin: "0.8em 0" }}>Score: {score.left} - {score.right}</p>
        <button className="pong-btn" onClick={handleStart}>Rematch</button>
        <button className="pong-btn" onClick={() => setWinner("")}>Close</button>
        <button className="pong-btn" style={{ marginTop: 15 }} onClick={() => setShowLeaderboard(true)}>Leaderboard</button>
      </Modal>

      {/* --- LEADERBOARD MODAL --- */}
      <Modal
        isOpen={showLeaderboard}
        onRequestClose={() => setShowLeaderboard(false)}
        className="pong-modal"
        overlayClassName="pong-modal-overlay"
        ariaHideApp={false}
      >
        <h2>Leaderboard</h2>
        <Leaderboard scores={scores} />
        <button className="pong-btn" onClick={() => setShowLeaderboard(false)}>Close</button>
      </Modal>

      {/* --- THEME PICKER --- */}
      <ThemePicker />

      {!multiplayer ? (
        <div style={{ margin: "2em auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff" }}>Online Multiplayer</h2>
          <input
            value={roomInput}
            onChange={e => setRoomInput(e.target.value)}
            placeholder="Room code (any word/number)"
            style={{ fontSize: 18, padding: ".5em 1em", borderRadius: 8, border: "1px solid #0ff" }}
          />
          <button
            className="pong-btn"
            style={{ marginLeft: 16, fontSize: 18, fontWeight: 600 }}
            onClick={() => startMultiplayer(roomInput || Math.random().toString(36).substr(2, 6))}
          >Create/Join Room</button>
          <div style={{ color: "#aaa", marginTop: 20 }}>Or play locally below</div>
        </div>
      ) : (
        <div style={{ color: "#0ff", fontWeight: "bold", margin: "1em 0" }}>
          Room: <span style={{ color: "#fff" }}>{room}</span> | Players: {players}/2 <br/>
          {players < 2 ? "Waiting for opponent..." : isHost ? "You are Host (Right paddle)" : "You are Guest (Left paddle)"}
          <button className="pong-btn"
            style={{ marginLeft: 30, background:"#f44", color:"#fff" }}
            onClick={() => { if (socket) socket.disconnect(); setMultiplayer(false); }}
          >Leave</button>
        </div>
      )}
      <div className="pong-scoreboard">
        <Scoreboard left={score.left} right={score.right} winningScore={winScore} winner={winner} onRestart={handleStart}/>
      </div>
      <Controls
        difficulty={difficulty} setDifficulty={setDifficulty}
        theme={theme} setTheme={setTheme}
        isPaused={isPaused} onPauseToggle={()=>setIsPaused(p=>!p)}
        isMuted={isMuted} onMuteToggle={()=>setIsMuted(m=>!m)}
        twoPlayer={twoPlayer && !multiplayer} setTwoPlayer={setTwoPlayer}
        showKeyConfig={showKeyConfig} setShowKeyConfig={setShowKeyConfig}
        winScore={winScore} setWinScore={setWinScore}
        disabled={multiplayer && !isHost}
      />
      {showKeyConfig && (
        <div className="pong-keyconfig">
          <KeyConfig keyMap={keyMap} setKeyMap={setKeyMap}/>
        </div>
      )}
      <div ref={boardAreaRef} className="pong-board-area" style={{ width: svgW, height: svgH, maxWidth: "100%", position: "relative" }}>
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ background: t.bg, border: "2px solid #fff", maxWidth: "100%" }}
          aria-label="Pong game area"
        >
          {renderDefs()}
          {/* Center line */}
          <line
            x1={WIDTH/2} y1={0} x2={WIDTH/2} y2={HEIGHT}
            stroke={t.fg} strokeDasharray="10,12"
          />
          {/* Paddles */}
          <Paddle x={0} y={leftPaddle} width={PADDLE_WIDTH} height={PADDLE_HEIGHT} color={t.left} gradient={t.gradL}/>
          <Paddle x={WIDTH-PADDLE_WIDTH} y={rightPaddle} width={PADDLE_WIDTH} height={PADDLE_HEIGHT} color={t.right} gradient={t.gradR}/>
          {/* Ball with trail */}
          <Ball x={ball.x} y={ball.y} size={BALL_SIZE} color={t.ball} trail={trail}/>
          {/* Power-up */}
          {powerUp && <PowerUp x={powerUp.x} y={powerUp.y} size={powerUp.size} type={powerUp.type}/>}
        </svg>
      </div>
      {/* Touch Controls OUTSIDE the court, always visible, vertically centered */}
      <TouchControls side="left" boardRect={boardRect}/>
      {twoPlayer && !multiplayer && <TouchControls side="right" boardRect={boardRect}/>}
      <div style={{ color: t.fg, marginTop: 10, fontSize: "1em" }}>
        <strong>Controls:</strong> <br />
        Left: {keyMap.leftUp.toUpperCase()}/{keyMap.leftDown.toUpperCase()} &nbsp;&nbsp;|&nbsp;&nbsp;
        Right: {twoPlayer ? `${keyMap.rightUp.toUpperCase()}/${keyMap.rightDown.toUpperCase()}` : multiplayer ? "Remote" : "AI"}
        <br />
        Touch: ▲▼ (mobile)
      </div>
      {!running && !winner && (
        <button
          className="pong-btn"
          style={{
            marginTop: 18,
            padding: "10px 30px",
            fontSize: 20,
            fontWeight: "bold"
          }}
          onClick={handleStart}
        >Start Game</button>
      )}
      {running && (
        <button
          className="pong-btn"
          style={{
            marginTop: 18,
            marginLeft: 10,
            padding: "8px 20px",
            fontSize: 15,
            background: "#f44",
            color: "#fff"
          }}
          onClick={() => setRunning(false)}
        >Stop</button>
      )}
      <div className="pong-leaderboard">
        <Leaderboard scores={scores}/>
        <button className="pong-btn" style={{ marginTop: 10 }} onClick={() => setShowLeaderboard(true)}>Show Full Leaderboard</button>
      </div>

      {/* --- CHAT UI --- */}
      {multiplayer && (
        <div className="pong-chat-container" style={{maxWidth: 400, margin: "1rem auto"}}>
          <div style={{border: "1px solid #ccc", height: 120, overflowY: "auto", background: "#222", color: "#fff", padding: 8, fontSize: 14}}>
            {chatMessages.map((c, i) => (
              <div key={i}><b>{c.sender}:</b> {c.msg}</div>
            ))}
          </div>
          <form onSubmit={handleSendChat} style={{display: "flex", gap: 4, marginTop: 2}}>
            <input
              placeholder="Type a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              style={{flex: 1, padding: 4}}
              disabled={!multiplayer}
            />
            <button type="submit" disabled={!chatInput.trim() || !multiplayer}>Send</button>
          </form>
        </div>
      )}

      <div style={{ color: "#aaa", margin: "1.5em 0 0 0", fontSize: "0.8em" }}>
        <span aria-label="Accessibility: game is keyboard and screen reader friendly">♿</span>
        &nbsp; Pong in React+Vite &copy; 2025
      </div>
    </div>
  );
}
